"use client";

import { useState } from "react";
import { api } from "@/api-client/client";
import type { OcrExpense } from "@/api-client/models";

interface UseReceiptUploadReturn {
  upload: (file: File) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  result: OcrExpense | null;
}

export function useReceiptUpload(): UseReceiptUploadReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OcrExpense | null>(null);

  const upload = async (file: File): Promise<boolean> => {
    if (!file) {
      setError("Proszę wybrać plik");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError("Plik jest zbyt duży (max 10MB)");
      return false;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Tworzenie FormData dla multipart upload
      const formData = new FormData();
      formData.append("image", file);
      formData.append("transactionDate", new Date().toISOString());

      const response: any = await api.uploadReceipt(formData);
      const payload = response?.data ?? response;
      setResult(payload as OcrExpense);
      return true;
    } catch (err: any) {
      let message = "Błąd wgrywania paragonu";
      
      if (err.status === 417) {
        message = "Plik jest zbyt duży (max 10MB)";
      } else if (err.status === 502) {
        message = "Błąd przetwarzania OCR";
      } else if (err?.message) {
        message = err.message;
      }

      setError(message);
      console.error("useReceiptUpload error:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    upload,
    isLoading,
    error,
    result
  };
}
