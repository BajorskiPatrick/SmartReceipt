// src/app/expenses/ExpensesPage.tsx
"use client";

import { useState } from "react";
import { useExpenses } from "@/hooks/useExpanses";
import { useCategories } from "@/hooks/useCategories";
import type { ExpenseSummary, Category } from "@/api-client/models";

/**
 * EXPENSES - Zarządzanie wydatkami
 * 
 * Struktura:
 * 1. Filtry (kategoria, data, kwota)
 * 2. Sortowanie
 * 3. Lista wydatków z paginacją
 * 4. Możliwość edycji/usunięcia
 */

export default function ExpensesPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  

  // Pobierz listę wydatków
  const { 
    data: expenses, 
    page, 
    totalPages, 
    setPage, 
    isLoading: expensesLoading 
  } = useExpenses(year, month, selectedCategory);

  // Pobierz kategorie do filtrowania
  const { categories, isLoading: categoriesLoading } = useCategories();

  const handleCategoryFilter = (categoryId: string | undefined) => {
    setSelectedCategory(categoryId);
    setPage(0); // Reset paginacji
  };

  const handleMonthChange = (newMonth: number) => {
    setMonth(newMonth);
    setPage(0);
  };

  return (
    <div className="expenses-container">
      {/* === HEADER === */}
      <header className="expenses-header">
        <h1>Moje wydatki</h1>
        <a href="/expenses/new" className="btn btn-primary">
          + Dodaj wydatek
        </a>
      </header>

      {/* === FILTERS SECTION === */}
      <section className="filters-section">
        <div className="filter-group">
          <label>Miesiąc:</label>
          <select 
            value={month} 
            onChange={(e) => handleMonthChange(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
              <option key={m} value={m}>
                {new Intl.DateTimeFormat("pl-PL", { month: "long" })
                  .format(new Date(year, m - 1))}
              </option>
            ))}
          </select>

          <label>Rok:</label>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[2023, 2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Kategoria:</label>
          <select 
            value={selectedCategory || ""} 
            onChange={(e) => handleCategoryFilter(e.target.value || undefined)}
          >
            <option value="">Wszystkie kategorie</option>
            {categoriesLoading ? (
              <option disabled>Ładowanie kategorii...</option>
            ) : (
              categories.map(cat => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </option>
              ))
            )}
          </select>
        </div>
      </section>

      {/* === EXPENSES LIST SECTION === */}
      <section className="expenses-list-section">
        {expensesLoading ? (
          <div className="loading">Ładowanie wydatków...</div>
        ) : expenses.length > 0 ? (
          <>
            <ExpensesTable expenses={expenses} />
            
            {/* === PAGINATION === */}
            <div className="pagination">
              <button 
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                ← Poprzednia
              </button>
              
              <span>Strona {page + 1} z {totalPages}</span>
              
              <button 
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
              >
                Następna →
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>Brak wydatków w wybranym okresie</p>
            <a href="/expenses/new" className="btn btn-primary">
              Dodaj pierwszy wydatek
            </a>
          </div>
        )}
      </section>
    </div>
  );
}

/**
 * === KOMPONENTY POMOCNICZE ===
 */

interface ExpensesTableProps {
  expenses: ExpenseSummary[];
}

function ExpensesTable({ expenses }: ExpensesTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="expenses-table-wrapper">
      <table className="expenses-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Opis</th>
            <th>Kategoria</th>
            <th>Kwota</th>
            <th>Pozycje</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(exp => (
            <tr key={exp.expenseId} className="expense-row">
              <td>{new Date(exp.transactionDate).toLocaleDateString("pl-PL")}</td>
              <td>{exp.description || "-"}</td>
              <td>{exp.categoryName || "-"}</td>
              <td className="amount">{exp.totalAmount.toFixed(2)} zł</td>
              <td>{exp.itemCount || 0}</td>
              <td className="actions">
                <button 
                  className="btn-expand"
                  onClick={() => setExpandedId(
                    expandedId === exp.expenseId ? null : exp.expenseId
                  )}
                >
                  {expandedId === exp.expenseId ? "↑ Zwiń" : "↓ Rozwiń"}
                </button>
                <a href={`/expenses/${exp.expenseId}`} className="btn-edit">
                  Edytuj
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
