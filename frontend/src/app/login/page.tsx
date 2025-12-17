"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import ColorModeIconDropdown from "../shared-theme/ColorModeIconDropdown";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await login(form);
    if (ok) {
  const role = localStorage.getItem("userRole");
  if (role === "ROLE_ADMIN") {
    router.push("/admin");
  } else {
    router.push("/");
  }
}

  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" color="text.primary">
            Logowanie
          </Typography>
          <ColorModeIconDropdown />
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Hasło"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
            >
              Zaloguj
            </Button>
          </Stack>
        </form>

        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}

        <Typography variant="body2" sx={{ mt: 2 }}>
          Nie masz konta?{" "}
          <Button variant="text" onClick={() => router.push("/register")}>
            Rejestracja
          </Button>
        </Typography>
      </Paper>
    </Box>
  );
}
