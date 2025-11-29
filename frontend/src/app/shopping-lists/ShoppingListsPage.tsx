// src/app/shopping-lists/ShoppingListsPage.tsx
"use client";

import { useState } from "react";
import { useShoppingLists } from "@/hooks/useShoppingLists";
import { useShoppingListDetail } from "@/hooks/useShoppingListDetail";
import type { ShoppingList } from "@/api-client/models";

/**
 * SHOPPING LISTS - Listy zakupów
 * 
 * Struktura:
 * 1. Przegląd wszystkich list
 * 2. Edycja szczegółów listy
 * 3. Zaznaczanie kupionych pozycji
 * 4. Dodawanie nowych pozycji
 */

export default function ShoppingListsPage() {
  const { lists, isLoading, error, createList, deleteList, refetch } = useShoppingLists();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      alert("Podaj nazwę listy");
      return;
    }

    const success = await createList({
      name: newListName,
      items: []
    });

    if (success) {
      setNewListName("");
      setSelectedListId(null);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (confirm("Czy na pewno chcesz usunąć tę listę?")) {
      await deleteList(listId);
      if (selectedListId === listId) {
        setSelectedListId(null);
      }
    }
  };

  return (
    <div className="shopping-lists-container">
      {/* === HEADER === */}
      <header className="shopping-lists-header">
        <h1>Listy zakupów</h1>
      </header>

      <div className="shopping-lists-layout">
        {/* === LISTS SIDEBAR === */}
        <aside className="lists-sidebar">
          <h3>Moje listy</h3>

          {isLoading ? (
            <div className="loading">Ładowanie list...</div>
          ) : (
            <>
              <div className="lists-list">
                {lists.map(list => (
                  <div
                    key={list.shoppingListId}
                    className={`list-item ${
                      selectedListId === list.shoppingListId ? "active" : ""
                    }`}
                  >
                    <button
                      className="list-button"
                      onClick={() => setSelectedListId(list.shoppingListId)}
                    >
                      <span className="list-name">{list.name}</span>
                      <span className="item-count">({list.itemCount || 0})</span>
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteList(list.shoppingListId)}
                      title="Usuń"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              {lists.length === 0 && (
                <p className="empty-state">Brak list - stwórz nową!</p>
              )}

              <div className="create-list-form">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Nazwa nowej listy..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleCreateList();
                    }
                  }}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleCreateList}
                >
                  + Nowa lista
                </button>
              </div>
            </>
          )}

          {error && (
            <div className="alert alert-error">
              {error}
              <button onClick={refetch}>Spróbuj ponownie</button>
            </div>
          )}
        </aside>

        {/* === LIST DETAIL === */}
        <main className="list-detail">
          {selectedListId ? (
            <ShoppingListDetailView listId={selectedListId} />
          ) : (
            <div className="empty-state-main">
              <p>Wybierz listę lub stwórz nową</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/**
 * === KOMPONENTY POMOCNICZE ===
 */

interface ShoppingListDetailViewProps {
  listId: string;
}

function ShoppingListDetailView({ listId }: ShoppingListDetailViewProps) {
  const { list, isLoading, error, addItem, updateItem, removeItem } = useShoppingListDetail(listId);
  const [newItemName, setNewItemName] = useState("");

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      alert("Podaj nazwę produktu");
      return;
    }

    const success = await addItem(newItemName);
    if (success) {
      setNewItemName("");
    }
  };

  if (isLoading) return <div className="loading">Ładowanie szczegółów listy...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!list) return <div className="empty-state">Nie znaleziono listy</div>;

  const completedCount = list.items?.filter(i => i.isPurchased).length || 0;
  const totalCount = list.items?.length || 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="list-detail-content">
      <div className="list-header">
        <h2>{list.name}</h2>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          <span className="progress-text">
            {completedCount} / {totalCount}
          </span>
        </div>
      </div>

      {/* === ITEMS LIST === */}
      <div className="items-section">
        {list.items && list.items.length > 0 ? (
          <ul className="items-list">
            {list.items.map(item => (
              <li key={item.shoppingListItemId} className={`item ${item.isPurchased ? "purchased" : ""}`}>
                <input
                  type="checkbox"
                  checked={item.isPurchased || false}
                  onChange={(e) => updateItem(item.shoppingListItemId, e.target.checked)}
                />
                <span className="item-name">{item.productName}</span>
                {item.quantity && item.quantity > 1 && (
                  <span className="item-quantity">× {item.quantity}</span>
                )}
                <button
                  className="btn-remove"
                  onClick={() => removeItem(item.shoppingListItemId)}
                  title="Usuń"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-items">Brak produktów na liście</p>
        )}
      </div>

      {/* === ADD ITEM FORM === */}
      <div className="add-item-form">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Dodaj nowy produkt..."
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleAddItem();
            }
          }}
        />
        <button
          className="btn btn-primary"
          onClick={handleAddItem}
        >
          + Dodaj
        </button>
      </div>
    </div>
  );
}
