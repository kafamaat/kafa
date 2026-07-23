export interface SignatureRecord {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  docType: string;
  person: string;
  createdAt: string; // Timestamp string
}

export interface AppNotification {
  id: string;
  text: string;
  time: string;
  type: 'success' | 'info' | 'warning' | 'danger';
}

export interface UserProfile {
  username: string;
  role: string;
  avatar: string; // Base64 image
}

export interface SystemSettings {
  darkMode: boolean;
  enableNotifications: boolean;
}
