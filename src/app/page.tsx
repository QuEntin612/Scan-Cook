"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Questionnaire from "@/components/questionnaire/Questionnaire";
import { DEFAULT_PROFILE } from "@/lib/profile";
import { useProfile } from "@/lib/useProfile";

// Accueil : questionnaire la première fois, sinon on va directement au scan.
export default function Home() {
  const router = useRouter();
  const { ready, profile } = useProfile();

  useEffect(() => {
    if (ready && profile) router.replace("/scan");
  }, [ready, profile, router]);

  if (!ready || profile) return <p className="muted loading">Chargement…</p>;
  return <Questionnaire initial={DEFAULT_PROFILE} isEdit={false} />;
}
