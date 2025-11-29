"use client";

import { useEffect, useState } from "react";
import { api } from "@/api-client/client";
import type { Category, NewCategory } from "@/api-client/models";

interface UseCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  createCategory: (data: NewCategory) => Promise<boolean>;
  updateCategory: (id: string, data: NewCategory) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: any = await api.getCategories();
      const payload = response?.data ?? response;
      const items = payload.items ?? payload.content ?? payload ?? [];
      setCategories(Array.isArray(items) ? items : []);
    } catch (err: any) {
      const message = err?.message || "Błąd pobierania kategorii";
      setError(message);
      console.error("useCategories fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const createCategory = async (data: NewCategory): Promise<boolean> => {
    setError(null);
    
    try {
      const response: any = await api.createCategory(data);
      const newCategory = response?.data ?? response;
      setCategories([...categories, newCategory]);
      return true;
    } catch (err: any) {
      const message = err?.message || "Błąd tworzenia kategorii";
      setError(message);
      console.error("useCategories create error:", err);
      return false;
    }
  };

  const updateCategory = async (id: string, data: NewCategory): Promise<boolean> => {
    setError(null);
    
    try {
      const response: any = await api.updateCategory(id, data);
      const updatedCategory = response?.data ?? response;
      setCategories(
        categories.map(cat => cat.categoryId === id ? updatedCategory : cat)
      );
      return true;
    } catch (err: any) {
      const message = err?.message || "Błąd aktualizacji kategorii";
      setError(message);
      console.error("useCategories update error:", err);
      return false;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    setError(null);
    
    try {
      await api.deleteCategory(id);
      setCategories(categories.filter(cat => cat.categoryId !== id));
      return true;
    } catch (err: any) {
      const message = err?.message || "Błąd usuwania kategorii";
      setError(message);
      console.error("useCategories delete error:", err);
      return false;
    }
  };

  return {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories
  };
}
