export interface AppNotification {
  id: string;
  type:
    | "mutual_match"
    | "join_request"
    | "join_approval"
    | "round_verification_request"
    | "new_message"
    | "leaderboard_movement"
    | "subscription_status";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationProvider {
  list(): Promise<AppNotification[]>;
  markRead(id: string): Promise<void>;
}

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
