import Constants from "expo-constants";
import { z } from "zod";

const envSchema = z.object({
  APP_ENV: z.enum(["development", "preview", "production"]).default("development"),
  EXPO_PUBLIC_SUPABASE_URL: z.string().url().default("http://127.0.0.1:54321"),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().default("development-anon-key"),
  EXPO_PUBLIC_USE_MOCK_AUTH: z.coerce.boolean().default(true),
  EXPO_PUBLIC_USE_MOCK_ENTITLEMENTS: z.coerce.boolean().default(true),
  EXPO_PUBLIC_GOLF_COURSE_API_KEY: z.string().default(""),
});

const raw = {
  APP_ENV: process.env.APP_ENV ?? Constants.expoConfig?.extra?.APP_ENV,
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_USE_MOCK_AUTH: process.env.EXPO_PUBLIC_USE_MOCK_AUTH,
  EXPO_PUBLIC_USE_MOCK_ENTITLEMENTS: process.env.EXPO_PUBLIC_USE_MOCK_ENTITLEMENTS,
  EXPO_PUBLIC_GOLF_COURSE_API_KEY: process.env.EXPO_PUBLIC_GOLF_COURSE_API_KEY,
};

export const env = envSchema.parse(raw);
