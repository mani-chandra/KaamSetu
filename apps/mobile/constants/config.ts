export const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const TOKEN_KEY = "kaamsetu_auth_token";
