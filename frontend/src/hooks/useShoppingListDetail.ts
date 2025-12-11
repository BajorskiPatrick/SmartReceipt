"use client";

import { useEffect, useState } from "react";
import { api } from "@/api-client/client";
import type { ShoppingList, NewShoppingListItems } from "@/api-client/models";

interface UseShoppingListDetailReturn {
  list: ShoppingList | null;
  isLoading: boolean;
  error: string | null;
  addItem: (productName: string, quantity?: number, unit?: string) => Promise<boolean>;
  updateItem: (itemId: string, isPurchased: boolean) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useShoppingListDetail(listId: string): UseShoppingListDetailReturn {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchList = async () => {
    if (!listId) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response: any = await api.getShoppingList(listId);
      const payload = response?.data ?? response;
      setList(payload as ShoppingList);
    } catch (err: any) {
      const message = err?.message || "Błąd pobierania listy";
      setError(message);
      console.error("useShoppingListDetail fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [listId]);

  const addItem = async (
    productName: string,
    quantity: number = 1,
    unit: string = "szt."
  ): Promise<boolean> => {
    setError(null);
    
    try {
      const payload: NewShoppingListItems = {
        items: [{ productName }]
      };
      
      const response: any = await api.addShoppingListItems(listId, payload);
      const updatedList = response?.data ?? response;
      setList(updatedList);
      return true;
    } catch (err: any) {
      const message = err?.message || "Błąd dodawania produktu";
      setError(message);
      console.error("useShoppingListDetail addItem error:", err);
      return false;
    }
  };

  const updateItem = async (itemId: string, isPurchased: boolean): Promise<boolean> => {
    setError(null);
    
    try {
      const response: any = await api.updateShoppingListItem(listId, itemId, isPurchased);
      const updatedList = response?.data ?? response;
      setList(updatedList);
      return true;
    } catch (err: any) {
      const message = err?.message || "Błąd aktualizacji produktu";
      setError(message);
      console.error("useShoppingListDetail updateItem error:", err);
      return false;
    }
  };

  const removeItem = async (itemId: string): Promise<boolean> => {
    setError(null);
    
    try {
      const response: any = await api.deleteShoppingListItem(listId, itemId);
      const updatedList = response?.data ?? response;
      setList(updatedList);
      return true;
    } catch (err: any) {
      const message = err?.message || "Błąd usuwania produktu";
      setError(message);
      console.error("useShoppingListDetail removeItem error:", err);
      return false;
    }
  };

  return {
    list,
    isLoading,
    error,
    addItem,
    updateItem,
    removeItem,
    refetch: fetchList
  };
}
