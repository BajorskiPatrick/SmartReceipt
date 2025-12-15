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
import { CloudUpload } from "@mui/icons-material";
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
      const { data: ocr } = await api.uploadReceipt(file, {
        transactionDate: new Date().toISOString()
      });
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
        <Box mt={2} display="flex" flexDirection="column" alignItems="center">
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            id="receipt-file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <label htmlFor="receipt-file">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUpload />}
            >
              Choose receipt
            </Button>
          </label>

          {file && (
            <Typography variant="body2" mt={1}>
              Selected: {file.name}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!file || loading}
          onClick={handleUpload}
          startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
        >
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
