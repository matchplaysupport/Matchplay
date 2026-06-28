import Constants from "expo-constants";
import { z } from "zod";

/**
 * Parse a string env var as a boolean. NOTE: do not use `z.coerce.boolean()` —
 * it delegates to JS `Boolean()`, so any non-empty string (including "false")
 * becomes `true`, which made it impossible to disable mock auth via config.
 * Only the literal strings "true"/"1" are truthy here; empty/unset uses the default.
 */
const envBoolean = (defaultValue: boolean) =>
  z
    .string()
    .optional()
    .transform((value) => {
      if (value === undefined || value.trim() === "") return defaultValue;
      const normalized = value.trim().toLowerCase();
      return normalized === "true" || normalized === "1";
    });

const envSchema = z.object({
  APP_ENV: z.enum(["development", "preview", "production"]).default("development"),
  EXPO_PUBLIC_SUPABASE_URL: z.string().url().default("http://127.0.0.1:54321"),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().default("development-anon-key"),
  EXPO_PUBLIC_USE_MOCK_AUTH: envBoolean(true),
  EXPO_PUBLIC_USE_MOCK_ENTITLEMENTS: envBoolean(true),
  EXPO_PUBLIC_GOLF_COURSE_API_KEY: z.string().default(""),
  EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().default(""),
  EXPO_PUBLIC_API_URL: z.string().default("http://localhost:3000"),
});

const raw = {
  APP_ENV: process.env.APP_ENV ?? Constants.expoConfig?.extra?.APP_ENV,
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_USE_MOCK_AUTH: process.env.EXPO_PUBLIC_USE_MOCK_AUTH,
  EXPO_PUBLIC_USE_MOCK_ENTITLEMENTS: process.env.EXPO_PUBLIC_USE_MOCK_ENTITLEMENTS,
  EXPO_PUBLIC_GOLF_COURSE_API_KEY: process.env.EXPO_PUBLIC_GOLF_COURSE_API_KEY,
  EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
};

export const env = envSchema.parse(raw);
