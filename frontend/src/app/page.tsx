// src/app/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "./Dashboard";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    if (!token) router.push("/login");
  }, [router]);

  return <Dashboard />;
}
