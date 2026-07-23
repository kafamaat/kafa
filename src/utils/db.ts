import { SignatureRecord, UserProfile, SystemSettings, AppNotification } from '../types';

const RECORDS_KEY = 'kafa_sig_records';
const PROFILE_KEY = 'kafa_sig_profile';
const SETTINGS_KEY = 'kafa_sig_settings';
const NOTIFS_KEY = 'kafa_sig_notifications';

const SEED_RECORDS: SignatureRecord[] = [
  {
    id: 'rec-1',
    title: 'Employment Agreement - Tech Officer',
    date: '2026-07-21',
    docType: 'Local Recruitment',
    person: 'Chantha',
    responsible: 'Approved',
    createdAt: new Date(2026, 6, 21, 9, 30, 0).toISOString()
  },
  {
    id: 'rec-2',
    title: 'Expat Visa Sponsorship Documents',
    date: '2026-07-20',
    docType: 'International Recruitment',
    person: 'Samnang',
    responsible: 'Verified',
    createdAt: new Date(2026, 6, 20, 14, 15, 0).toISOString()
  },
  {
    id: 'rec-3',
    title: 'Staff Annual Compliance Guidelines',
    date: '2026-07-18',
    docType: 'Compliance',
    person: 'Rima',
    responsible: 'Checked',
    createdAt: new Date(2026, 6, 18, 11, 0, 0).toISOString()
  },
  {
    id: 'rec-4',
    title: 'July Payroll Authorization Sheet',
    date: '2026-07-15',
    docType: 'Payroll',
    person: 'Sreynhanh',
    responsible: 'Approved',
    createdAt: new Date(2026, 6, 15, 16, 45, 0).toISOString()
  },
  {
    id: 'rec-5',
    title: 'Leadership Training Program Sign-off',
    date: '2026-07-10',
    docType: 'Training & Development',
    person: 'Buntheng',
    responsible: 'Requested',
    createdAt: new Date(2026, 6, 10, 10, 20, 0).toISOString()
  },
  {
    id: 'rec-6',
    title: 'Insurance Health Benefits Renewal',
    date: '2026-07-05',
    docType: 'Compensation & Benefits (C&B)',
    person: 'Rima',
    responsible: 'Verified',
    createdAt: new Date(2026, 6, 5, 13, 10, 0).toISOString()
  },
  {
    id: 'rec-7',
    title: 'Central HR General Code of Conduct',
    date: '2026-06-25',
    docType: 'Central HR Document',
    person: 'Chantha',
    responsible: 'Approved',
    createdAt: new Date(2026, 5, 25, 15, 0, 0).toISOString()
  },
  {
    id: 'rec-8',
    title: 'Temporary Office Space Lease Sign-off',
    date: '2026-06-12',
    docType: 'Other',
    person: 'Other',
    responsible: 'Requested',
    createdAt: new Date(2026, 5, 12, 11, 40, 0).toISOString()
  }
];

export const db = {
  getRecords(): SignatureRecord[] {
    const data = localStorage.getItem(RECORDS_KEY);
    if (!data) {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(SEED_RECORDS));
      return SEED_RECORDS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_RECORDS;
    }
  },

  saveRecords(records: SignatureRecord[]): void {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  },

  getProfile(): UserProfile {
    const data = localStorage.getItem(PROFILE_KEY);
    const defaultProfile: UserProfile = {
      username: 'kafa',
      role: 'Administrator',
      avatar: ''
    };
    if (!data) {
      return defaultProfile;
    }
    try {
      return JSON.parse(data);
    } catch {
      return defaultProfile;
    }
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  },

  getSettings(): SystemSettings {
    const data = localStorage.getItem(SETTINGS_KEY);
    const defaultSettings: SystemSettings = {
      darkMode: false,
      enableNotifications: true
    };
    if (!data) {
      return defaultSettings;
    }
    try {
      return JSON.parse(data);
    } catch {
      return defaultSettings;
    }
  },

  saveSettings(settings: SystemSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  getNotifications(): AppNotification[] {
    const data = localStorage.getItem(NOTIFS_KEY);
    if (!data) {
      const defaultNotifs: AppNotification[] = [
        {
          id: 'notif-1',
          text: 'Welcome back Mr. Kafa to the Signature Tracking System!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'success'
        }
      ];
      localStorage.setItem(NOTIFS_KEY, JSON.stringify(defaultNotifs));
      return defaultNotifs;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveNotifications(notifs: AppNotification[]): void {
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
  }
};
