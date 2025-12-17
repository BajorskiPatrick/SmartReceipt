"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/api-client/client";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useAuth } from "@/hooks/useAuth";

export default function AdminPanel() {
  useRequireAdmin();

  const [users, setUsers] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "ROLE_USER" });
  const [editUser, setEditUser] = useState<any | null>(null);
  const { logout } = useAuth();

  async function loadUsers() {
    try {
      const res = await api.getAllUsers();
      setUsers(res.data);
    } catch (err) {
      console.error("Błąd pobierania użytkowników", err);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate() {
    try {
      await api.createUserByAdmin(newUser);
      setNewUser({ email: "", password: "", role: "ROLE_USER" });
      loadUsers();
    } catch (err) {
      console.error("Błąd tworzenia użytkownika", err);
    }
  }

  async function handleUpdate() {
    if (!editUser) return;
    try {
      await api.updateUserByAdmin(editUser.userId, {
        email: editUser.email,
        password: editUser.password,
        role: editUser.role,
      });
      setEditUser(null);
      loadUsers();
    } catch (err) {
      console.error("Błąd edycji użytkownika", err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.deleteUserByAdmin(id);
      loadUsers();
    } catch (err) {
      console.error("Błąd usuwania użytkownika", err);
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Admin Panel
      </Typography>

      {/* Formularz dodania nowego usera */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <TextField
          label="Password"
          type="password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        />
        <Select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
        >
          <MenuItem value="ROLE_USER">User</MenuItem>
          <MenuItem value="ROLE_ADMIN">Admin</MenuItem>
        </Select>
        <Button variant="contained" onClick={handleCreate}>
          Add User
        </Button>
      </Stack>
        <Button variant="outlined" onClick={logout} sx={{ mb: 2 }}>
            logout
        </Button>

      {/* Tabela użytkowników */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.userId}>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>
                <Button onClick={() => setEditUser(u)}>Edit</Button>
                <Button color="error" onClick={() => handleDelete(u.userId)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal edycji */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Email"
            value={editUser?.email || ""}
            onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
          />
          <TextField
            label="New Password"
            type="password"
            value={editUser?.password || ""}
            onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
          />
          <Select
            value={editUser?.role || "ROLE_USER"}
            onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
          >
            <MenuItem value="ROLE_USER">User</MenuItem>
            <MenuItem value="ROLE_ADMIN">Admin</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
