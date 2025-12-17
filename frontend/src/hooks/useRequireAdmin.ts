import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useRequireAdmin() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "ROLE_ADMIN") {
      router.push("/"); // przekierowanie zwykłego usera
    }
  }, [router]);
}
