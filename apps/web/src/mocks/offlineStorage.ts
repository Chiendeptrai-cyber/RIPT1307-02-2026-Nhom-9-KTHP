import type { ApiResponse, PaginatedResponse } from '@equipment-mgmt/shared';

export interface MockEquipment {
  id: number;
  name: string;
  categoryId: number;
  totalQuantity: number;
  availableQuantity: number;
  status: string;
  description?: string;
}

export interface MockBorrowRequest {
  id: number;
  userId: number;
  equipmentId: number;
  quantity: number;
  status: string;
  expectedReturnDate: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  userFullName?: string;
  userEmail?: string;
  equipmentName?: string;
  rejectReason?: string;
}

export interface MockNotification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface MockUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export const OFFLINE_STORAGE_KEYS = {
  equipment: 'equipment_mgmt_mock_equipment',
  borrowRequests: 'equipment_mgmt_mock_borrow_requests',
  notifications: 'equipment_mgmt_mock_notifications',
  users: 'equipment_mgmt_mock_users',
} as const;

const now = new Date();
const isoDaysAgo = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();
const dateDaysAhead = (days: number) => new Date(now.getTime() + days * 86400000).toISOString().slice(0, 10);

const seedEquipment: MockEquipment[] = [
  {
    id: 1,
    name: 'May chieu Epson EB-X41',
    categoryId: 1,
    totalQuantity: 8,
    availableQuantity: 5,
    status: 'active',
    description: 'May chieu phong hoc, do sang 3600 lumens.',
  },
  {
    id: 2,
    name: 'Laptop Dell Latitude 5420',
    categoryId: 1,
    totalQuantity: 12,
    availableQuantity: 7,
    status: 'active',
    description: 'Laptop cau hinh Core i5, RAM 16GB dung cho thuc hanh.',
  },
  {
    id: 3,
    name: 'Micro khong day Shure BLX24',
    categoryId: 2,
    totalQuantity: 6,
    availableQuantity: 2,
    status: 'active',
    description: 'Bo micro khong day dung cho hoi truong va lop hoc lon.',
  },
  {
    id: 4,
    name: 'Camera Logitech C920',
    categoryId: 3,
    totalQuantity: 10,
    availableQuantity: 0,
    status: 'active',
    description: 'Webcam Full HD phuc vu hoc truc tuyen.',
  },
  {
    id: 5,
    name: 'Bo phat WiFi TP-Link Archer C6',
    categoryId: 4,
    totalQuantity: 5,
    availableQuantity: 1,
    status: 'under_maintenance',
    description: 'Thiet bi mang dang bao tri dinh ky.',
  },
];

const seedBorrowRequests: MockBorrowRequest[] = [
  {
    id: 1,
    userId: 1,
    equipmentId: 1,
    quantity: 1,
    status: 'pending',
    expectedReturnDate: dateDaysAhead(5),
    note: 'Muon de thuyet trinh do an mon hoc.',
    createdAt: isoDaysAgo(1),
    updatedAt: isoDaysAgo(1),
    userFullName: 'Nguyen Van An',
    userEmail: 'an.nguyen@student.ptit.edu.vn',
    equipmentName: 'May chieu Epson EB-X41',
  },
  {
    id: 2,
    userId: 1,
    equipmentId: 2,
    quantity: 2,
    status: 'approved',
    expectedReturnDate: dateDaysAhead(7),
    note: 'Nhom can laptop de demo san pham.',
    createdAt: isoDaysAgo(3),
    updatedAt: isoDaysAgo(2),
    userFullName: 'Nguyen Van An',
    userEmail: 'an.nguyen@student.ptit.edu.vn',
    equipmentName: 'Laptop Dell Latitude 5420',
  },
  {
    id: 3,
    userId: 2,
    equipmentId: 3,
    quantity: 1,
    status: 'borrowing',
    expectedReturnDate: dateDaysAhead(2),
    note: 'Su dung cho su kien cau lac bo.',
    createdAt: isoDaysAgo(4),
    updatedAt: isoDaysAgo(3),
    userFullName: 'Tran Thi Binh',
    userEmail: 'binh.tran@student.ptit.edu.vn',
    equipmentName: 'Micro khong day Shure BLX24',
  },
  {
    id: 4,
    userId: 3,
    equipmentId: 4,
    quantity: 1,
    status: 'rejected',
    expectedReturnDate: dateDaysAhead(4),
    note: 'Muon webcam de phong van online.',
    createdAt: isoDaysAgo(5),
    updatedAt: isoDaysAgo(4),
    userFullName: 'Le Minh Chau',
    userEmail: 'chau.le@student.ptit.edu.vn',
    equipmentName: 'Camera Logitech C920',
    rejectReason: 'Thiet bi hien khong con san.',
  },
];

const seedNotifications: MockNotification[] = [
  {
    id: 1,
    userId: 1,
    type: 'new_request',
    title: 'Yeu cau moi da duoc tao',
    message: 'Yeu cau muon May chieu Epson EB-X41 cua ban dang cho duyet.',
    isRead: false,
    createdAt: isoDaysAgo(1),
  },
  {
    id: 2,
    userId: 1,
    type: 'approved',
    title: 'Yeu cau da duoc duyet',
    message: 'Yeu cau muon Laptop Dell Latitude 5420 da duoc quan tri vien duyet.',
    isRead: false,
    createdAt: isoDaysAgo(2),
  },
  {
    id: 3,
    userId: 1,
    type: 'due_reminder',
    title: 'Sap den han tra thiet bi',
    message: 'Vui long kiem tra lai lich tra thiet bi trong lich su yeu cau.',
    isRead: true,
    createdAt: isoDaysAgo(6),
  },
  {
    id: 4,
    userId: 2,
    type: 'checkout_confirmed',
    title: 'Da ban giao thiet bi',
    message: 'Micro khong day Shure BLX24 da duoc ban giao thanh cong.',
    isRead: false,
    createdAt: isoDaysAgo(3),
  },
];

const seedUsers: MockUser[] = [
  {
    id: 1,
    fullName: 'Nguyen Van An',
    email: 'an.nguyen@student.ptit.edu.vn',
    role: 'student',
    status: 'active',
    createdAt: isoDaysAgo(20),
  },
  {
    id: 2,
    fullName: 'Tran Thi Binh',
    email: 'binh.tran@student.ptit.edu.vn',
    role: 'student',
    status: 'active',
    createdAt: isoDaysAgo(18),
  },
  {
    id: 3,
    fullName: 'Le Minh Chau',
    email: 'chau.le@student.ptit.edu.vn',
    role: 'student',
    status: 'borrow_blocked',
    createdAt: isoDaysAgo(14),
  },
  {
    id: 4,
    fullName: 'Pham Quoc Dung',
    email: 'dung.pham@student.ptit.edu.vn',
    role: 'student',
    status: 'locked',
    createdAt: isoDaysAgo(9),
  },
  {
    id: 5,
    fullName: 'Hoang Thu Ha',
    email: 'ha.hoang@student.ptit.edu.vn',
    role: 'student',
    status: 'active',
    createdAt: isoDaysAgo(5),
  },
];

function hasStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!hasStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function ensureMockDataSeeded() {
  if (!hasStorage()) return;

  if (!window.localStorage.getItem(OFFLINE_STORAGE_KEYS.equipment)) {
    writeJson(OFFLINE_STORAGE_KEYS.equipment, seedEquipment);
  }
  if (!window.localStorage.getItem(OFFLINE_STORAGE_KEYS.borrowRequests)) {
    writeJson(OFFLINE_STORAGE_KEYS.borrowRequests, seedBorrowRequests);
  }
  if (!window.localStorage.getItem(OFFLINE_STORAGE_KEYS.notifications)) {
    writeJson(OFFLINE_STORAGE_KEYS.notifications, seedNotifications);
  }
  if (!window.localStorage.getItem(OFFLINE_STORAGE_KEYS.users)) {
    writeJson(OFFLINE_STORAGE_KEYS.users, seedUsers);
  }
}

export function readCollection<T>(key: string, fallback: T[] = []): T[] {
  if (!hasStorage()) return fallback;
  ensureMockDataSeeded();
  return safeParse<T[]>(window.localStorage.getItem(key), fallback);
}

export function writeCollection<T>(key: string, items: T[]) {
  writeJson(key, items);
}

export function nextId(items: Array<{ id: number }>) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

export function paginate<T>(items: T[], page = 1, pageSize = 10): PaginatedResponse<T> {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const start = (safePage - 1) * safePageSize;

  return {
    items: items.slice(start, start + safePageSize),
    total: items.length,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(items.length / safePageSize)),
  };
}

export function apiSuccess<T>(data: T, message = 'OK'): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function createNotification(input: Omit<MockNotification, 'id' | 'createdAt' | 'isRead'> & {
  createdAt?: string;
  isRead?: boolean;
}) {
  const notifications = readCollection<MockNotification>(OFFLINE_STORAGE_KEYS.notifications);
  const notification: MockNotification = {
    ...input,
    id: nextId(notifications),
    isRead: input.isRead ?? false,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };

  writeCollection(OFFLINE_STORAGE_KEYS.notifications, [notification, ...notifications]);
  return notification;
}
