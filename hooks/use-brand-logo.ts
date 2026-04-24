"use client";

import { useEffect, useState } from "react";
import { setClientPreferenceCookie } from "@/lib/client-preferences";

export const BRAND_LOGO_STORAGE_KEY = "mai.brand_logo.v1";
export const BRAND_LOGO_COOKIE_NAME = "mai_brand_logo";
export const DEFAULT_BRAND_LOGO = "/images/logo.png";

export function useBrandLogo() {
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const savedLogo = window.localStorage.getItem(BRAND_LOGO_STORAGE_KEY);
      if (savedLogo) return savedLogo;

      const cookies = document.cookie.split("; ");
      const logoCookie = cookies.find((row) => row.startsWith(`${BRAND_LOGO_COOKIE_NAME}=`));
      if (logoCookie) {
        return decodeURIComponent(logoCookie.split("=")[1]);
      }
    }
    return DEFAULT_BRAND_LOGO;
  });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);

    const syncLogo = () => {
      const savedLogo = window.localStorage.getItem(BRAND_LOGO_STORAGE_KEY);
      if (savedLogo) {
        setLogoUrl(savedLogo);
      } else {
        setLogoUrl(DEFAULT_BRAND_LOGO);
      }
    };

    window.addEventListener("storage", syncLogo);
    return () => {
      window.removeEventListener("storage", syncLogo);
    };
  }, []);

  const updateLogo = (newLogoUrl: string) => {
    setLogoUrl(newLogoUrl);
    window.localStorage.setItem(BRAND_LOGO_STORAGE_KEY, newLogoUrl);
    setClientPreferenceCookie(BRAND_LOGO_COOKIE_NAME, newLogoUrl);

    // Dispatch a custom event to update instances that might not be catching the storage event (same window)
    window.dispatchEvent(new Event("storage"));
  };

  return {
    isHydrated,
    logoUrl,
    updateLogo,
  };
}
