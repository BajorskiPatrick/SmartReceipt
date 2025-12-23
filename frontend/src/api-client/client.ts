import { Configuration, MainAppApi } from "@/api-client";
import { axiosInstance } from "./axiosInstance";

const basePath =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1.0";

const config = new Configuration({
  basePath,
  //accessToken: () => localStorage.getItem("accessToken") || "",
});

// 🔥 KLUCZOWE: przekazujemy axiosInstance
export const api = new MainAppApi(config, basePath, axiosInstance);
