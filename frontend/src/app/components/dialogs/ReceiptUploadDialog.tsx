"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography
} from "@mui/material";
import { api } from "@/api-client/client";

type Props = {
  open: boolean;
  onClose: () => void;
  onUploaded: (ocrData: any) => void;
};

export default function ReceiptUploadDialog({ open, onClose, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

 const handleUpload = async () => {
  if (!file) return;

  setLoading(true);
  try {
    console.log("Uploading file:", file);

    // poprawne wywołanie
    const { data: ocr } = await api.uploadReceipt(file);

    console.log("OCR response:", ocr);

    onUploaded(ocr);
    onClose();
  } catch (error) {
    console.error("Upload failed:", error);
    alert("OCR failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload receipt</DialogTitle>
      <DialogContent>
        <Box mt={1}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!file || loading}
          onClick={handleUpload}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}
