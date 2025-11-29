// src/app/receipts/ReceiptsPage.tsx
"use client";

import { useState } from "react";
import { useReceiptUpload } from "@/hooks/useReceiptUpload";
import { useExpenseCreate } from "@/hooks/useExpenseCreate";
import type { OcrExpense } from "@/api-client/models";

/**
 * RECEIPTS - Bank paragonów / Wgrywanie paragonów
 * 
 * Struktura:
 * 1. Obszar drag & drop do wgrywania
 * 2. Podgląd wyników OCR (edytowalne pola)
 * 3. Przycisk akceptacji i dodania do wydatków
 */

export default function ReceiptsPage() {
  const { upload, isLoading: uploading, error: uploadError, result: ocrResult } = useReceiptUpload();
  const { createExpense, isLoading: creating, error: createError } = useExpenseCreate();
  
  const [dragActive, setDragActive] = useState(false);
  const [editedResult, setEditedResult] = useState<OcrExpense | null>(null);

  // Obsługa drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        await upload(file);
      } else {
        alert("Proszę wybrać plik obrazu");
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      await upload(e.target.files[0]);
    }
  };

  const handleAcceptOCR = async () => {
    if (!ocrResult || !editedResult) return;

    // Konwertuj wynik OCR do formatu NewExpense
    const expenseData = {
      transactionDate: editedResult.transactionDate,
      description: editedResult.description,
      items: editedResult.items?.map(item => ({
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        categoryId: item.categoryId || ""
      }))
    };

    const success = await createExpense(expenseData as any);
    if (success) {
      alert("Wydatek został dodany!");
      setEditedResult(null);
      // Reset formularza
    }
  };

  return (
    <div className="receipts-container">
      {/* === HEADER === */}
      <header className="receipts-header">
        <h1>Bank Paragonów</h1>
        <p>Wgraj zdjęcie paragonu, a my wyodrębnimy dane automatycznie</p>
      </header>

      {/* === UPLOAD AREA === */}
      <section className="upload-section">
        {!ocrResult ? (
          <div
            className={`drag-drop-area ${dragActive ? "active" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="upload-content">
              <p className="icon">📷</p>
              <p className="title">Wgraj paragon</p>
              <p className="description">
                Przeciągnij i upuść plik lub kliknij aby wybrać
              </p>
              <input
                type="file"
                id="file-input"
                accept="image/*"
                onChange={handleFileInput}
                disabled={uploading}
                style={{ display: "none" }}
              />
              <label htmlFor="file-input" className="btn btn-primary">
                {uploading ? "Przetwarzanie..." : "Wybierz plik"}
              </label>
            </div>

            {uploadError && (
              <div className="alert alert-error">
                <p>{uploadError}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="ocr-result-section">
            <h3>Wynik OCR - Edytuj dane jeśli potrzeba</h3>
            
            <ReceiptEditor 
              data={editedResult || ocrResult}
              onChange={setEditedResult}
            />

            <div className="action-buttons">
              <button 
                className="btn btn-primary"
                onClick={handleAcceptOCR}
                disabled={creating}
              >
                {creating ? "Dodawanie..." : "✓ Akceptuj i dodaj wydatek"}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setEditedResult(null);
                  // Reset upload
                }}
                disabled={creating}
              >
                ✕ Anuluj
              </button>
            </div>

            {createError && (
              <div className="alert alert-error">
                <p>{createError}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* === RECENT RECEIPTS SECTION === */}
      {/* TODO: Dodaj sekcję z historią paragonów */}
      <section className="recent-receipts">
        <h3>Historia paragonów</h3>
        <p>TODO: Wyświetl listę ostatnio wgranych paragonów</p>
      </section>
    </div>
  );
}

/**
 * === KOMPONENTY POMOCNICZE ===
 */

interface ReceiptEditorProps {
  data: OcrExpense;
  onChange: (data: OcrExpense) => void;
}

function ReceiptEditor({ data, onChange }: ReceiptEditorProps) {
  const handleFieldChange = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...(data.items || [])];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    onChange({
      ...data,
      items: newItems
    });
  };

  return (
    <div className="receipt-editor">
      {/* === DANE OGÓLNE === */}
      <div className="editor-section">
        <h4>Informacje ogólne</h4>
        
        <div className="form-group">
          <label>Opis (sklep, rodzaj):</label>
          <input
            type="text"
            value={data.description || ""}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            placeholder="np. Sklep Lidl"
          />
        </div>

        <div className="form-group">
          <label>Data transakcji:</label>
          <input
            type="datetime-local"
            value={data.transactionDate?.slice(0, 16) || ""}
            onChange={(e) => handleFieldChange("transactionDate", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Łączna kwota:</label>
          <input
            type="number"
            value={data.totalAmount || 0}
            onChange={(e) => handleFieldChange("totalAmount", parseFloat(e.target.value))}
            step="0.01"
          />
          <span>zł</span>
        </div>
      </div>

      {/* === POZYCJE Z PARAGONU === */}
      <div className="editor-section">
        <h4>Pozycje na paragonie</h4>
        
        {data.items && data.items.length > 0 ? (
          <div className="items-list">
            {data.items.map((item, idx) => (
              <div key={idx} className="item-row">
                <input
                  type="text"
                  value={item.productName}
                  onChange={(e) => handleItemChange(idx, "productName", e.target.value)}
                  placeholder="Nazwa produktu"
                />
                <input
                  type="number"
                  value={item.quantity || 1}
                  onChange={(e) => handleItemChange(idx, "quantity", parseInt(e.target.value))}
                  placeholder="Ilość"
                  step="1"
                  min="1"
                />
                <input
                  type="number"
                  value={item.price || 0}
                  onChange={(e) => handleItemChange(idx, "price", parseFloat(e.target.value))}
                  placeholder="Cena za sztukę"
                  step="0.01"
                />
                <span>zł</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-items">Brak pozycji do wyświetlenia</p>
        )}
      </div>

      <p className="hint">
        💡 Jeśli OCR coś źle rozpoznał, możesz edytować powyższe pola
      </p>
    </div>
  );
}
