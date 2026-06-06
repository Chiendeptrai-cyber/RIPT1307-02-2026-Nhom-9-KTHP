import { SystemLogAction, type SystemLogCategory } from '@equipment-mgmt/shared';

/* ─── Types ──────────────────────────────────────────────── */
export interface MockSystemLog {
  id: number;
  code: string; // LOG-D001, LOG-D002, …
  timestamp: string;
  adminId: number;
  adminName: string;
  action: SystemLogAction;
  category: SystemLogCategory;
  /** ID of the entity being acted on (request, equipment, user…) */
  targetId: number | string;
  /** Human-readable label shown in the table (ma phieu, ma thiet bi, ten sv…) */
  targetLabel: string;
  /** Arbitrary payload – keys depend on the action type */
  details: Record<string, string | number | undefined>;
}

const STORAGE_KEY = 'equipment_mgmt_mock_system_logs';

/* ─── Helpers ─────────────────────────────────────────────── */
function hasStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function writeJson(key: string, value: unknown) {
  if (!hasStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function nextLogCode(logs: MockSystemLog[]): string {
  const maxNum = logs.reduce((max, log) => {
    const m = log.code.match(/^LOG-D(\d+)$/);
    return m ? Math.max(max, parseInt(m[1], 10)) : max;
  }, 0);
  return `LOG-D${String(maxNum + 1).padStart(3, '0')}`;
}

/* ─── Public API ──────────────────────────────────────────── */

export function readSystemLogs(category?: SystemLogCategory): MockSystemLog[] {
  if (!hasStorage()) return [];
  ensureSystemLogsSeeded();
  const all = safeParse<MockSystemLog[]>(window.localStorage.getItem(STORAGE_KEY), []);
  return category ? all.filter((l) => l.category === category) : all;
}

export function writeSystemLogs(logs: MockSystemLog[]) {
  writeJson(STORAGE_KEY, logs);
}

export function createSystemLog(
  input: Omit<MockSystemLog, 'id' | 'code' | 'timestamp'>,
): MockSystemLog {
  const existing = readSystemLogs();
  const log: MockSystemLog = {
    ...input,
    id: existing.reduce((m, l) => Math.max(m, l.id), 0) + 1,
    code: nextLogCode(existing),
    timestamp: new Date().toISOString(),
  };
  writeSystemLogs([log, ...existing]);
  return log;
}

/* ─── Seed data ───────────────────────────────────────────── */

const now = new Date();
const iso = (daysAgo: number, hours = 9, mins = 0) => {
  const d = new Date(now.getTime() - daysAgo * 86_400_000);
  d.setHours(hours, mins, 0, 0);
  return d.toISOString();
};

const seedLogs: MockSystemLog[] = [
  // ── Approval logs ──
  {
    id: 1, code: 'LOG-D001', timestamp: iso(7, 9, 14),
    adminId: 100, adminName: 'Khoa',
    action: SystemLogAction.APPROVE_REQUEST, category: 'approval',
    targetId: 'PH-20250520-00001', targetLabel: 'PH-20250520-00001',
    details: { studentName: 'Nguyen Van An', actionLabel: 'Duyet' },
  },
  {
    id: 2, code: 'LOG-D002', timestamp: iso(6, 10, 30),
    adminId: 101, adminName: 'Nam',
    action: SystemLogAction.REJECT_REQUEST, category: 'approval',
    targetId: 'PH-20250519-00004', targetLabel: 'PH-20250519-00004',
    details: { studentName: 'Le Minh Chau', actionLabel: 'Tu choi', reason: 'Thiet bi khong con san' },
  },
  {
    id: 3, code: 'LOG-D003', timestamp: iso(5, 14, 22),
    adminId: 100, adminName: 'Khoa',
    action: SystemLogAction.APPROVE_REQUEST, category: 'approval',
    targetId: 'PH-20250520-00002', targetLabel: 'PH-20250520-00002',
    details: { studentName: 'Tran Thi Binh', actionLabel: 'Duyet' },
  },
  {
    id: 4, code: 'LOG-D004', timestamp: iso(3, 8, 45),
    adminId: 101, adminName: 'Nam',
    action: SystemLogAction.CANCEL_REQUEST, category: 'approval',
    targetId: 'PH-20250518-00003', targetLabel: 'PH-20250518-00003',
    details: { studentName: 'Pham Quoc Dung', actionLabel: 'Huy' },
  },
  // ── Equipment logs ──
  {
    id: 5, code: 'LOG-D005', timestamp: iso(4, 11, 0),
    adminId: 100, adminName: 'Khoa',
    action: SystemLogAction.UPDATE_EQUIPMENT, category: 'equipment',
    targetId: 1, targetLabel: 'TB-001 · May chieu Epson EB-X41',
    details: { equipmentCode: 'TB-001', equipmentName: 'May chieu Epson EB-X41', field: 'totalQuantity', oldValue: '6', newValue: '8' },
  },
  {
    id: 6, code: 'LOG-D006', timestamp: iso(2, 15, 30),
    adminId: 101, adminName: 'Nam',
    action: SystemLogAction.UPDATE_EQUIPMENT, category: 'equipment',
    targetId: 2, targetLabel: 'TB-002 · Laptop Dell Latitude 5420',
    details: { equipmentCode: 'TB-002', equipmentName: 'Laptop Dell Latitude 5420', field: 'name', oldValue: 'Laptop Dell 5420', newValue: 'Laptop Dell Latitude 5420' },
  },
  {
    id: 7, code: 'LOG-D007', timestamp: iso(1, 9, 10),
    adminId: 100, adminName: 'Khoa',
    action: SystemLogAction.UPDATE_EQUIPMENT, category: 'equipment',
    targetId: 5, targetLabel: 'TB-005 · Bo phat WiFi TP-Link Archer C6',
    details: { equipmentCode: 'TB-005', equipmentName: 'Bo phat WiFi TP-Link Archer C6', field: 'status', oldValue: 'active', newValue: 'under_maintenance' },
  },
  // ── Account logs ──
  {
    id: 8, code: 'LOG-D008', timestamp: iso(6, 16, 0),
    adminId: 100, adminName: 'Khoa',
    action: SystemLogAction.LOCK_ACCOUNT, category: 'account',
    targetId: 4, targetLabel: 'Pham Quoc Dung',
    details: { studentName: 'Pham Quoc Dung', actionLabel: 'Khoa', reason: 'Vi pham noi quy muon thiet bi' },
  },
  {
    id: 9, code: 'LOG-D009', timestamp: iso(3, 10, 20),
    adminId: 101, adminName: 'Nam',
    action: SystemLogAction.UNLOCK_ACCOUNT, category: 'account',
    targetId: 3, targetLabel: 'Le Minh Chau',
    details: { studentName: 'Le Minh Chau', actionLabel: 'Mo khoa', reason: 'Da hoan thanh xu ly vi pham' },
  },
  // ── Stock logs ──
  {
    id: 10, code: 'LOG-D010', timestamp: iso(8, 8, 0),
    adminId: 100, adminName: 'Khoa',
    action: SystemLogAction.STOCK_IMPORT, category: 'stock',
    targetId: 1, targetLabel: 'TB-001 · May chieu Epson EB-X41',
    details: { equipmentCode: 'TB-001', equipmentName: 'May chieu Epson EB-X41', operationLabel: 'Nhap them', quantityChange: '+2', oldAvailable: '3', newAvailable: '5' },
  },
  {
    id: 11, code: 'LOG-D011', timestamp: iso(5, 13, 45),
    adminId: 101, adminName: 'Nam',
    action: SystemLogAction.STOCK_MARK_DAMAGED, category: 'stock',
    targetId: 3, targetLabel: 'TB-003 · Micro khong day Shure BLX24',
    details: { equipmentCode: 'TB-003', equipmentName: 'Micro khong day Shure BLX24', operationLabel: 'Ghi nhan hong', quantityChange: '-1', oldAvailable: '3', newAvailable: '2' },
  },
  {
    id: 12, code: 'LOG-D012', timestamp: iso(2, 17, 30),
    adminId: 100, adminName: 'Khoa',
    action: SystemLogAction.STOCK_ADJUSTMENT, category: 'stock',
    targetId: 4, targetLabel: 'TB-004 · Camera Logitech C920',
    details: { equipmentCode: 'TB-004', equipmentName: 'Camera Logitech C920', operationLabel: 'Dieu chinh truc tiep', quantityChange: '+1', oldAvailable: '0', newAvailable: '1' },
  },
  {
    id: 13, code: 'LOG-D013', timestamp: iso(1, 11, 15),
    adminId: 101, adminName: 'Nam',
    action: SystemLogAction.STOCK_MARK_LOST, category: 'stock',
    targetId: 2, targetLabel: 'TB-002 · Laptop Dell Latitude 5420',
    details: { equipmentCode: 'TB-002', equipmentName: 'Laptop Dell Latitude 5420', operationLabel: 'Ghi nhan mat', quantityChange: '-1', oldAvailable: '7', newAvailable: '6' },
  },
];

export function ensureSystemLogsSeeded() {
  if (!hasStorage()) return;
  if (!window.localStorage.getItem(STORAGE_KEY)) {
    writeJson(STORAGE_KEY, seedLogs);
  }
}
