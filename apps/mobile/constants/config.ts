export const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "https://kaam-setu-self.vercel.app";

export const TOKEN_KEY = "kaamsetu_auth_token";
