"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The analyze page has been merged into the home screen.
// Redirect anyone who lands here back to home.
export default function AnalyzeRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/"); }, [router]);
  return null;
}
