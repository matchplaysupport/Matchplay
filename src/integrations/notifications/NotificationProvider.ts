import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { supabase } from "@/lib/supabase";
import { env } from "@/lib/env";

export interface AppNotification {
  id: string;
  type:
    | "mutual_match"
    | "join_request"
    | "join_approval"
    | "round_verification_request"
    | "new_message"
    | "leaderboard_movement"
    | "subscription_status"
    | "slot_alert"
    | "system";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationProvider {
  list(): Promise<AppNotification[]>;
  markRead(id: string): Promise<void>;
}

/** Mock-mode provider — a seeded in-memory notification for local dev. */
export class LocalNotificationProvider implements NotificationProvider {
  private notifications: AppNotification[] = [
    {
      id: "notif-1",
      type: "join_request",
      title: "Open game request",
      body: "Maya asked to join your Riverbend tee time.",
      read: false,
      createdAt: new Date().toISOString(),
    },
  ];

  async list() {
    return Promise.resolve(this.notifications);
  }

  async markRead(id: string) {
    this.notifications = this.notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification,
    );
    return Promise.resolve();
  }
}

/** Live provider — reads the golfer's notifications from Supabase. RLS scopes
 *  rows to the authenticated user. */
export class SupabaseNotificationProvider implements NotificationProvider {
  async list(): Promise<AppNotification[]> {
    const { data, error } = await supabase
      .from("notifications")
      .select("id, type, title, body, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id as string,
      type: (row.type as AppNotification["type"]) ?? "system",
      title: row.title as string,
      body: row.body as string,
      read: row.read_at != null,
      createdAt: row.created_at as string,
    }));
  }

  async markRead(id: string): Promise<void> {
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
  }
}

/** Picks the provider for the current run mode. */
export function getNotificationProvider(): NotificationProvider {
  return env.EXPO_PUBLIC_USE_MOCK_AUTH
    ? new LocalNotificationProvider()
    : new SupabaseNotificationProvider();
}

/**
 * Request push permission, fetch the Expo push token, and persist it so the
 * server can deliver slot alerts to this device. No-op in mock mode. Safe to
 * call repeatedly (token is upserted). Returns the token, or null if unavailable.
 */
export async function registerForPushNotifications(profileId: string): Promise<string | null> {
  if (env.EXPO_PUBLIC_USE_MOCK_AUTH || !profileId) return null;

  try {
    const existing = await Notifications.getPermissionsAsync();
    let granted = existing.granted;
    if (!granted) {
      const requested = await Notifications.requestPermissionsAsync();
      granted = requested.granted;
    }
    if (!granted) return null;

    const projectId =
      (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId ??
      (Constants as { easConfig?: { projectId?: string } }).easConfig?.projectId;

    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token = tokenResponse.data;

    await supabase
      .from("device_push_tokens")
      .upsert(
        { profile_id: profileId, token, platform: Platform.OS, updated_at: new Date().toISOString() },
        { onConflict: "token" },
      );

    return token;
  } catch {
    return null;
  }
}
