"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
var node_fetch_1 = __importDefault(require("node-fetch"));
var CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
var API_BASE_URL = process.env.API_BASE_URL || "https://accounts.google.com/o/oauth2/v2/auth";
var REDIRECT_URI = process.env.REDIRECT_URI;
var SCOPES = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
    "https://www.googleapis.com/auth/drive.file",
].join(" ");
var AUTH_URL = "".concat(API_BASE_URL, "?client_id=").concat(CLIENT_ID, "&redirect_uri=").concat(REDIRECT_URI, "&response_type=code&scope=").concat(encodeURIComponent(SCOPES));
function listFolderContents(accessToken, folderId) {
    return __awaiter(this, void 0, void 0, function () {
        var response, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4, (0, node_fetch_1.default)("https://www.googleapis.com/drive/v3/files?q='".concat(folderId, "' in parents&fields=files(id,name,mimeType,webViewLink)"), {
                        headers: {
                            Authorization: "Bearer ".concat(accessToken),
                        },
                    })];
                case 1:
                    response = _c.sent();
                    if (!!response.ok) return [3, 3];
                    _a = Error.bind;
                    _b = "Drive API error: ".concat;
                    return [4, response.text()];
                case 2: throw new (_a.apply(Error, [void 0, _b.apply("Drive API error: ", [_c.sent()])]))();
                case 3: return [2, response.json()];
            }
        });
    });
}
function handler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, code, action, folderId, accessToken, tokenResponse, tokenData, folderContents, error_1, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("Incoming request:", req.method, req.headers);
                    console.log("Using REDIRECT_URI from env:", process.env.REDIRECT_URI);
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
                        return [2, res.status(200).end()];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 10, , 11]);
                    if (!(req.method === "GET")) return [3, 2];
                    return [2, res.status(200).json({ url: AUTH_URL })];
                case 2:
                    if (!(req.method === "POST")) return [3, 9];
                    _a = req.body, code = _a.code, action = _a.action, folderId = _a.folderId, accessToken = _a.accessToken;
                    if (!(action === "token")) return [3, 5];
                    return [4, (0, node_fetch_1.default)("https://oauth2.googleapis.com/token", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                            },
                            body: new URLSearchParams({
                                code: code,
                                client_id: CLIENT_ID,
                                client_secret: CLIENT_SECRET,
                                redirect_uri: REDIRECT_URI,
                                grant_type: "authorization_code",
                            }),
                        })];
                case 3:
                    tokenResponse = _b.sent();
                    return [4, tokenResponse.json()];
                case 4:
                    tokenData = _b.sent();
                    return [2, res.status(200).json(tokenData)];
                case 5:
                    if (!(action === "listFolder" && folderId && accessToken)) return [3, 9];
                    _b.label = 6;
                case 6:
                    _b.trys.push([6, 8, , 9]);
                    return [4, listFolderContents(accessToken, folderId)];
                case 7:
                    folderContents = _b.sent();
                    return [2, res.status(200).json(folderContents)];
                case 8:
                    error_1 = _b.sent();
                    console.error("Drive API error:", error_1);
                    return [2, res
                            .status(500)
                            .json({ error: "Failed to fetch folder contents" })];
                case 9: return [3, 11];
                case 10:
                    error_2 = _b.sent();
                    console.error("OAuth error:", error_2);
                    return [2, res.status(500).json({ error: "Internal Server Error" })];
                case 11: return [2, res.status(405).json({ error: "Method not allowed" })];
            }
        });
    });
}
