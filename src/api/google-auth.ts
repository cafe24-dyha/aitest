import { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";

// OAuth 설정
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const API_BASE_URL =
  process.env.API_BASE_URL || "https://accounts.google.com/o/oauth2/v2/auth";
const REDIRECT_URI = process.env.REDIRECT_URI!;

const AUTH_URL = `${API_BASE_URL}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.readonly`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("Incoming request:", req.method, req.headers);
  console.log("Using REDIRECT_URI from env:", process.env.REDIRECT_URI);

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  console.log("CORS headers set:", {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    return res.status(200).end();
  }

  try {
    if (req.method === "GET") {
      // Return the authorization URL
      return res.status(200).json({ url: AUTH_URL });
    } else if (req.method === "POST") {
      const { code } = req.body;

      // Exchange the authorization code for tokens
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenResponse.json();
      return res.status(200).json(tokenData);
    }
  } catch (error) {
    console.error("OAuth error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
