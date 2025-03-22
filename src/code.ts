// src/code.ts

// Declare types
type LogEntry = {
  timestamp: string;
  stage: string;
  status: "start" | "success" | "error";
  details?: Record<string, unknown>;
  error?: Error | unknown;
};

type AuthFlowStage = {
  PLUGIN_INIT: string;
  UI_LOADED: string;
  AUTH_URL_REQUEST: string;
  AUTH_URL_RECEIVED: string;
  AUTH_SUCCESS: string;
  AUTH_ERROR: string;
  TOKEN_EXCHANGE_START: string;
  TOKEN_EXCHANGE_COMPLETE: string;
  AUTH_COMPLETE: string;
  PROFILE_REQUEST: string;
  PROFILE_RECEIVED: string;
};

interface PluginMessage {
  type: string;
  token?: string;
  error?: unknown;
  url?: string;
}

const AuthStages: AuthFlowStage = {
  PLUGIN_INIT: "PLUGIN_INITIALIZATION",
  UI_LOADED: "UI_LOADED",
  AUTH_URL_REQUEST: "AUTH_URL_REQUEST",
  AUTH_URL_RECEIVED: "AUTH_URL_RECEIVED",
  AUTH_SUCCESS: "AUTH_SUCCESS",
  AUTH_ERROR: "AUTH_ERROR",
  TOKEN_EXCHANGE_START: "TOKEN_EXCHANGE_START",
  TOKEN_EXCHANGE_COMPLETE: "TOKEN_EXCHANGE_COMPLETE",
  AUTH_COMPLETE: "AUTH_COMPLETE",
  PROFILE_REQUEST: "PROFILE_REQUEST",
  PROFILE_RECEIVED: "PROFILE_RECEIVED",
};

// Google API 관련 타입 정의
interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
  locale: string;
}

class GoogleApiClient {
  private accessToken: string;
  private static instance: GoogleApiClient;

  private constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  static getInstance(accessToken?: string): GoogleApiClient {
    if (!GoogleApiClient.instance && accessToken) {
      GoogleApiClient.instance = new GoogleApiClient(accessToken);
    }
    return GoogleApiClient.instance;
  }

  private async fetchWithAuth(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${this.accessToken}`,
      Accept: "application/json",
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    return response;
  }

  async getUserProfile(): Promise<GoogleUserProfile> {
    logger.log(AuthStages.PROFILE_REQUEST, "start");
    try {
      const response = await this.fetchWithAuth(
        "https://www.googleapis.com/oauth2/v1/userinfo"
      );
      const profile = await response.json();
      logger.log(AuthStages.PROFILE_RECEIVED, "success", { profile });
      return profile;
    } catch (error) {
      logger.log(AuthStages.PROFILE_RECEIVED, "error", {}, error);
      throw error;
    }
  }

  // 추가 Google API 메서드들을 여기에 구현할 수 있습니다.
}

class AuthLogger {
  private logs: LogEntry[] = [];
  private static instance: AuthLogger;

  private constructor() {}

  static getInstance(): AuthLogger {
    if (!AuthLogger.instance) {
      AuthLogger.instance = new AuthLogger();
    }
    return AuthLogger.instance;
  }

  log(
    stage: string,
    status: "start" | "success" | "error",
    details?: Record<string, unknown>,
    error?: unknown
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      stage,
      status,
      details,
      error:
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : error,
    };
    this.logs.push(entry);
    console.log(
      `[${entry.timestamp}] ${stage} - ${status}` +
        (details ? "\nDetails: " + JSON.stringify(details) : "") +
        (error ? "\nError: " + JSON.stringify(error) : "")
    );
    figma.ui.postMessage({ type: "log", entry });
  }
}

const logger = AuthLogger.getInstance();

// Display the plugin UI
figma.showUI(__html__, { width: 400, height: 600 });

// Log plugin initialization
logger.log(AuthStages.PLUGIN_INIT, "start", { method: "GET" });

// API 엔드포인트 설정
const API_BASE_URL = "https://aitest-cafe24-dyhas-projects.vercel.app";
const AUTH_API_ENDPOINT = `${API_BASE_URL}/api/google-auth`;

figma.ui.onmessage = async (msg: PluginMessage) => {
  console.log("Message received:", msg);

  if (msg.type === "start-auth") {
    try {
      // OAuth 인증 URL 요청 시작
      logger.log(AuthStages.AUTH_URL_REQUEST, "start");

      console.log("Fetching auth URL from:", AUTH_API_ENDPOINT);
      const response = await fetch(AUTH_API_ENDPOINT, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      });

      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response text:", responseText);

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${responseText}`
        );
      }

      const data = JSON.parse(responseText);
      console.log("Parsed response data:", data);

      if (!data.authUrl) {
        throw new Error("No auth URL received");
      }

      logger.log(AuthStages.AUTH_URL_RECEIVED, "success", {
        authUrl: data.authUrl,
      });

      // 팝업 창을 열어 인증 URL로 이동
      figma.ui.postMessage({ type: "open-url", url: data.authUrl });
    } catch (error) {
      console.error("Auth URL request failed:", error);
      logger.log(AuthStages.AUTH_URL_RECEIVED, "error", {}, error);
      figma.notify(
        "Authentication failed: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  } else if (msg.type === "auth-success" && msg.token) {
    try {
      // 팝업 창에서 인증 성공 후 전달받은 access token 처리
      logger.log(AuthStages.AUTH_SUCCESS, "success", { token: msg.token });

      // Google API 클라이언트 초기화
      const googleClient = GoogleApiClient.getInstance(msg.token);

      // 사용자 프로필 정보 가져오기
      const profile = await googleClient.getUserProfile();

      // UI에 프로필 정보 전달
      figma.ui.postMessage({
        type: "profile-loaded",
        profile,
      });

      figma.notify("Authentication successful!");
    } catch (error) {
      console.error("Profile fetch failed:", error);
      logger.log(AuthStages.PROFILE_RECEIVED, "error", {}, error);
      figma.notify("Failed to fetch user profile");
    }
  } else if (msg.type === "auth-error") {
    logger.log(AuthStages.AUTH_ERROR, "error", {}, msg.error);
    figma.notify("Authentication failed.");
  } else if (msg.type === "ui-ready") {
    logger.log(AuthStages.UI_LOADED, "success");
  }
};
