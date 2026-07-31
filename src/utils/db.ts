import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { firestore } from './firebase';
import { SignatureRecord, UserProfile, SystemSettings, AppNotification } from '../types';

export const SIGNATURE_TITLES = [
  'Manpower Request in Plan',
  'Manpower Request Out of Plan',
  'Exit Interview Form',
  'Exit Clearance Form',
  'Overtime Form',
  'Undertime Form',
  'Leave Form',
  'Warning Letter',
  'Termination Letter',
  'Movement Letter',
  'Training Request Form',
  'Training Evaluation Form',
  'Evaluation Form',
  'Payroll Sheet',
  '13th Month Pay',
  'Seniority Pay',
  'Bonuses',
  'Miscellaneous Payments',
  'Employee Loan Form',
  'Payslip',
  'Resignation Letter',
  'Resignation Acceptance Letter',
  'End of Service Letter',
  'Indemnity Letter'
];

export const THEME_COLORS = [
  { value: 'ocean', label: 'Ocean', bg: '#1C3150', text: '#F8D9CD' },
  { value: 'emerald', label: 'Emerald', bg: '#064E3B', text: '#ECFDF5' },
  { value: 'royal', label: 'Royal', bg: '#1E3A5F', text: '#E0E7FF' },
  { value: 'warmth', label: 'Warmth', bg: '#5C4033', text: '#FFF8F0' },
  { value: 'midnight', label: 'Midnight', bg: '#0F172A', text: '#E2E8F0' },
  { value: 'forest', label: 'Forest', bg: '#14532D', text: '#F0FDF4' },
  { value: 'slate', label: 'Slate', bg: '#1E293B', text: '#F1F5F9' },
  { value: 'rosewood', label: 'Rosewood', bg: '#4C0519', text: '#FFF1F2' },
  { value: 'amber', label: 'Amber', bg: '#451A03', text: '#FFFBEB' },
  { value: 'teal', label: 'Teal', bg: '#134E4A', text: '#F0FDFA' },
  { value: 'violet', label: 'Violet', bg: '#2E1065', text: '#F5F3FF' },
  { value: 'coral', label: 'Coral', bg: '#7F1D1D', text: '#FFF5F5' },
  { value: 'graphite', label: 'Graphite', bg: '#1F2937', text: '#F9FAFB' },
  { value: 'azure', label: 'Azure', bg: '#1E3A8A', text: '#EFF6FF' },
  { value: 'sakura', label: 'Sakura', bg: '#831843', text: '#FDF2F8' }
];

export const ACCENT_COLORS = [
  { value: 'blue', label: 'Blue', hex: '#3B82F6' },
  { value: 'green', label: 'Green', hex: '#10B981' },
  { value: 'purple', label: 'Purple', hex: '#8B5CF6' },
  { value: 'orange', label: 'Orange', hex: '#F59E0B' },
  { value: 'pink', label: 'Pink', hex: '#EC4899' },
  { value: 'cyan', label: 'Cyan', hex: '#06B6D4' },
  { value: 'red', label: 'Red', hex: '#EF4444' },
  { value: 'indigo', label: 'Indigo', hex: '#6366F1' },
  { value: 'teal', label: 'Teal', hex: '#14B8A6' },
  { value: 'rose', label: 'Rose', hex: '#F43F5E' },
  { value: 'amber', label: 'Amber', hex: '#F59E0B' }
];

const RECORDS_COL = 'kafa_records';
const SETTINGS_KEY = 'kafa_sig_settings';
const NOTIFS_KEY = 'kafa_sig_notifications';
const PROFILE_KEY = 'kafa_sig_profile';

const SEED_RECORDS: SignatureRecord[] = [
  { id: 'rec-1', title: 'Employment Agreement - Tech Officer', description: 'Employment agreement for technical officer position', date: '2026-07-21', docType: 'Local Recruitment', person: 'Chantha', responsible: 'Approved', createdAt: new Date(2026, 6, 21, 9, 30, 0).toISOString() },
  { id: 'rec-2', title: 'Expat Visa Sponsorship Documents', description: 'Visa sponsorship paperwork for expatriate employee', date: '2026-07-20', docType: 'International Recruitment', person: 'Samnang', responsible: 'Verified', createdAt: new Date(2026, 6, 20, 14, 15, 0).toISOString() },
  { id: 'rec-3', title: 'Staff Annual Compliance Guidelines', description: 'Annual compliance guidelines for all staff members', date: '2026-07-18', docType: 'Compliance', person: 'Rima', responsible: 'Checked', createdAt: new Date(2026, 6, 18, 11, 0, 0).toISOString() },
  { id: 'rec-4', title: 'July Payroll Authorization Sheet', description: 'Payroll authorization for the month of July', date: '2026-07-15', docType: 'Payroll', person: 'Sreynhanh', responsible: 'Approved', createdAt: new Date(2026, 6, 15, 16, 45, 0).toISOString() },
  { id: 'rec-5', title: 'Leadership Training Program Sign-off', description: 'Sign-off for leadership training program', date: '2026-07-10', docType: 'Training & Development', person: 'Buntheng', responsible: 'Requested', createdAt: new Date(2026, 6, 10, 10, 20, 0).toISOString() },
  { id: 'rec-6', title: 'Insurance Health Benefits Renewal', description: 'Renewal of health insurance benefits', date: '2026-07-05', docType: 'Compensation & Benefits (C&B)', person: 'Rima', responsible: 'Verified', createdAt: new Date(2026, 6, 5, 13, 10, 0).toISOString() },
  { id: 'rec-7', title: 'Central HR General Code of Conduct', description: 'Central HR code of conduct document', date: '2026-06-25', docType: 'Central HR Document', person: 'Chantha', responsible: 'Approved', createdAt: new Date(2026, 5, 25, 15, 0, 0).toISOString() },
  { id: 'rec-8', title: 'Temporary Office Space Lease Sign-off', description: 'Lease sign-off for temporary office space', date: '2026-06-12', docType: 'Other', person: 'Other', responsible: 'Requested', createdAt: new Date(2026, 5, 12, 11, 40, 0).toISOString() }
];

const DEFAULT_PROFILE: UserProfile = { username: 'kafa', role: 'Administrator', avatar: '' };
const DEFAULT_SETTINGS: SystemSettings = { darkMode: false, enableNotifications: true, themeColor: 'ocean', accentColor: 'blue' };
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

// Track whether we've already seeded so we don't re-seed after a deliberate clear
let hasSeeded = false;

export function subscribeRecords(callback: (records: SignatureRecord[]) => void): Unsubscribe {
  const colRef = collection(firestore, RECORDS_COL);

  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !hasSeeded) {
      // First load and no data yet — seed Firestore with default records
      hasSeeded = true;
      const batch = writeBatch(firestore);
      SEED_RECORDS.forEach((rec) => {
        batch.set(doc(colRef, rec.id), rec);
      });
      await batch.commit();
      // onSnapshot will fire again after seeding
      return;
    }

    hasSeeded = true;

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

  const existingSnap = await getDocs(colRef);
  const existingIds = new Set<string>();
  existingSnap.forEach((d) => existingIds.add(d.id));

  const newIds = new Set(records.map((r) => r.id));
  const batch = writeBatch(firestore);

  records.forEach((rec) => {
    batch.set(doc(colRef, rec.id), rec);
  });

  existingIds.forEach((id) => {
    if (!newIds.has(id)) {
      batch.delete(doc(colRef, id));
    }
  });

  await batch.commit();
  writeLocal('kafa_sig_records_cache', records);
}

export async function clearAllRecords(): Promise<void> {
  const colRef = collection(firestore, RECORDS_COL);
  const snapshot = await getDocs(colRef);

  if (snapshot.empty) {
    writeLocal('kafa_sig_records_cache', []);
    return;
  }

  // Firestore batches support max 500 ops; chunk if needed
  const allDocs = snapshot.docs;
  for (let i = 0; i < allDocs.length; i += 500) {
    const batch = writeBatch(firestore);
    allDocs.slice(i, i + 500).forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
  }

  writeLocal('kafa_sig_records_cache', []);
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
