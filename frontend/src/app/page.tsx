"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the login page immediately after the page is loaded
    router.push("/login");
  }, [router]);

  return null;
}
