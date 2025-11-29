"use client";

import { useEffect, useState } from "react";
import { api } from "@/api-client/client";
import type { ShoppingList, NewShoppingList } from "@/api-client/models";

interface UseShoppingListsReturn {
  lists: ShoppingList[];
  isLoading: boolean;
  error: string | null;
  createList: (data: NewShoppingList) => Promise<boolean>;
  deleteList: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useShoppingLists(): UseShoppingListsReturn {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLists = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: any = await api.getShoppingLists();
      const payload = response?.data ?? response;
      const items = payload.items ?? payload.content ?? payload ?? [];
      setLists(Array.isArray(items) ? items : []);
    } catch (err: any) {
      const message = err?.message || "Błąd pobierania list";
      setError(message);
      console.error("useShoppingLists fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const createList = async (data: NewShoppingList): Promise<boolean> => {
    setError(null);
    
    try {
      const response: any = await api.createShoppingList(data);
      const newList = response?.data ?? response;
      setLists([...lists, newList]);
      return true;
    } catch (err: any) {
      const message = err?.message || "Błąd tworzenia listy";
      setError(message);
      console.error("useShoppingLists create error:", err);
      return false;
    }
  };

  const deleteList = async (id: string): Promise<boolean> => {
    setError(null);
    
    try {
      await api.deleteShoppingList(id);
      setLists(lists.filter(l => l.shoppingListId !== id));
      return true;
    } catch (err: any) {
      const message = err?.message || "Błąd usuwania listy";
      setError(message);
      console.error("useShoppingLists delete error:", err);
      return false;
    }
  };

  return {
    lists,
    isLoading,
    error,
    createList,
    deleteList,
    refetch: fetchLists
  };
}
