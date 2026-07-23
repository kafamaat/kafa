import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { firestore } from './firebase';
import { SignatureRecord, UserProfile, SystemSettings, AppNotification } from '../types';

const RECORDS_COL = 'kafa_records';
const SETTINGS_KEY = 'kafa_sig_settings';
const NOTIFS_KEY = 'kafa_sig_notifications';
const PROFILE_KEY = 'kafa_sig_profile';

const SEED_RECORDS: SignatureRecord[] = [
  { id: 'rec-1', title: 'Employment Agreement - Tech Officer', date: '2026-07-21', docType: 'Local Recruitment', person: 'Chantha', responsible: 'Approved', createdAt: new Date(2026, 6, 21, 9, 30, 0).toISOString() },
  { id: 'rec-2', title: 'Expat Visa Sponsorship Documents', date: '2026-07-20', docType: 'International Recruitment', person: 'Samnang', responsible: 'Verified', createdAt: new Date(2026, 6, 20, 14, 15, 0).toISOString() },
  { id: 'rec-3', title: 'Staff Annual Compliance Guidelines', date: '2026-07-18', docType: 'Compliance', person: 'Rima', responsible: 'Checked', createdAt: new Date(2026, 6, 18, 11, 0, 0).toISOString() },
  { id: 'rec-4', title: 'July Payroll Authorization Sheet', date: '2026-07-15', docType: 'Payroll', person: 'Sreynhanh', responsible: 'Approved', createdAt: new Date(2026, 6, 15, 16, 45, 0).toISOString() },
  { id: 'rec-5', title: 'Leadership Training Program Sign-off', date: '2026-07-10', docType: 'Training & Development', person: 'Buntheng', responsible: 'Requested', createdAt: new Date(2026, 6, 10, 10, 20, 0).toISOString() },
  { id: 'rec-6', title: 'Insurance Health Benefits Renewal', date: '2026-07-05', docType: 'Compensation & Benefits (C&B)', person: 'Rima', responsible: 'Verified', createdAt: new Date(2026, 6, 5, 13, 10, 0).toISOString() },
  { id: 'rec-7', title: 'Central HR General Code of Conduct', date: '2026-06-25', docType: 'Central HR Document', person: 'Chantha', responsible: 'Approved', createdAt: new Date(2026, 5, 25, 15, 0, 0).toISOString() },
  { id: 'rec-8', title: 'Temporary Office Space Lease Sign-off', date: '2026-06-12', docType: 'Other', person: 'Other', responsible: 'Requested', createdAt: new Date(2026, 5, 12, 11, 40, 0).toISOString() }
];

const DEFAULT_PROFILE: UserProfile = { username: 'kafa', role: 'Administrator', avatar: '' };
const DEFAULT_SETTINGS: SystemSettings = { darkMode: false, enableNotifications: true };
const DEFAULT_NOTIFS: AppNotification[] = [
  { id: 'notif-1', text: 'Welcome back Mr. Kafa to the Signature Tracking System!', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'success' }
];

// ---- Local cache helpers (for offline fallback) ----

function readLocal<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded — silently ignore
  }
}

// ---- Firestore Records (real-time) ----

export function subscribeRecords(callback: (records: SignatureRecord[]) => void): Unsubscribe {
  const colRef = collection(firestore, RECORDS_COL);

  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      // First load — seed Firestore with default records
      const batch = writeBatch(firestore);
      SEED_RECORDS.forEach((rec) => {
        batch.set(doc(colRef, rec.id), rec);
      });
      await batch.commit();
      // onSnapshot will fire again after seeding
      return;
    }

    const records: SignatureRecord[] = [];
    snapshot.forEach((d) => {
      records.push(d.data() as SignatureRecord);
    });

    // Keep a local copy as offline cache
    writeLocal('kafa_sig_records_cache', records);
    callback(records);
  }, (error) => {
    console.warn('Firestore snapshot error, falling back to local cache:', error);
    const cached = readLocal<SignatureRecord[]>('kafa_sig_records_cache', SEED_RECORDS);
    callback(cached);
  });
}

export async function saveRecords(records: SignatureRecord[]): Promise<void> {
  const colRef = collection(firestore, RECORDS_COL);

  // Build a map of what currently exists in Firestore so we can diff
  const existingSnap = await getDocs(colRef);
  const existingIds = new Set<string>();
  existingSnap.forEach((d) => existingIds.add(d.id));

  const newIds = new Set(records.map((r) => r.id));
  const batch = writeBatch(firestore);

  // Upsert every record in the list
  records.forEach((rec) => {
    batch.set(doc(colRef, rec.id), rec);
  });

  // Delete records that were removed locally
  existingIds.forEach((id) => {
    if (!newIds.has(id)) {
      batch.delete(doc(colRef, id));
    }
  });

  await batch.commit();
  writeLocal('kafa_sig_records_cache', records);
}

// ---- Local-only data (Profile, Settings, Notifications) ----

export const db = {
  getProfile(): UserProfile {
    return readLocal<UserProfile>(PROFILE_KEY, DEFAULT_PROFILE);
  },

  saveProfile(profile: UserProfile): void {
    writeLocal(PROFILE_KEY, profile);
  },

  getSettings(): SystemSettings {
    return readLocal<SystemSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  },

  saveSettings(settings: SystemSettings): void {
    writeLocal(SETTINGS_KEY, settings);
  },

  getNotifications(): AppNotification[] {
    return readLocal<AppNotification[]>(NOTIFS_KEY, DEFAULT_NOTIFS);
  },

  saveNotifications(notifs: AppNotification[]): void {
    writeLocal(NOTIFS_KEY, notifs);
  }
};
