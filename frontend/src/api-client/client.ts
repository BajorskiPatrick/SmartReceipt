// src/api-client/client.ts
import { Configuration, MainAppApi } from "@/api-client"; // index.ts exports
const basePath = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1.0";

const config = new Configuration({
  basePath,
  // accessToken może być funkcją (common.ts obsługuje funkcję)
  accessToken: () => localStorage.getItem("accessToken") || "",
});

export const api = new MainAppApi(config);
