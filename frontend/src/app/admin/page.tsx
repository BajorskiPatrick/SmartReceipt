"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminPanel from "@/app/components/AdminPanel";
import "@/api-client/setupAxios";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const role = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;

    // jeśli brak tokenu → login
    if (!token) {
      router.push("/login");
      return;
    }

    // jeśli nie admin → dashboard
    if (role !== "ROLE_ADMIN") {
      router.push("/dashboard");
      return;
    }
  }, [router]);

  return <AdminPanel />;
}
