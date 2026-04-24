"use client";
import { createHash } from "crypto";

export const SECURITY_SETTINGS_STORAGE_KEY = "mai.security.settings.v1";
export const SECURITY_LOCKED_FLAG_KEY = "mai.security.locked.v1";

export type SecuritySettings = {
  autoLogoutMinutes: number;
  enablePinLock: boolean;
  lockOnReturn: boolean;
  pinCodeHash: string;
  securityCheckOnLoad: boolean;
};

export const defaultSecuritySettings: SecuritySettings = {
  autoLogoutMinutes: 0,
  enablePinLock: false,
  lockOnReturn: false,
  pinCodeHash: "",
  securityCheckOnLoad: true,
};

export function parseSecuritySettings(raw: string | null): SecuritySettings {
  if (!raw) {
    return defaultSecuritySettings;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SecuritySettings>;
    return {
      autoLogoutMinutes:
        typeof parsed.autoLogoutMinutes === "number"
          ? Math.max(0, Math.min(1440, Math.round(parsed.autoLogoutMinutes)))
          : 0,
      enablePinLock: Boolean(parsed.enablePinLock),
      lockOnReturn: Boolean(parsed.lockOnReturn),
      pinCodeHash:
        typeof parsed.pinCodeHash === "string" ? parsed.pinCodeHash : "",
      securityCheckOnLoad:
        typeof parsed.securityCheckOnLoad === "boolean"
          ? parsed.securityCheckOnLoad
          : true,
    };
  } catch {
    return defaultSecuritySettings;
  }
}


export function hashPinCode(pin: string): string {
  // cryptographic hashing implementation
  return createHash('sha256').update(pin).digest('hex');
}
