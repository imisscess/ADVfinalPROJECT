"use client";

import { useEffect } from "react";
import { getFirebaseAnalytics, getFirebaseApp } from "@/lib/firebase";

export function FirebaseClient() {
  useEffect(() => {
    getFirebaseApp();
    void getFirebaseAnalytics();
  }, []);

  return null;
}
