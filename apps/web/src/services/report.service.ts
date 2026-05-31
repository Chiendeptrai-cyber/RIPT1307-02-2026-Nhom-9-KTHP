import { http } from './http';
import type { ApiResponse } from '@equipment-mgmt/shared';
import { borrowRequestService, type BorrowRequest } from './borrow-request.service';
import { equipmentService, type Equipment } from './equipment.service';
import { userService, type User } from './user.service';

export interface RequestStatusStat {
  status: string;
  label: string;
  count: number;
  color: string;
}

export interface EquipmentUsageStat {
  id: number;
  name: string;
  totalQuantity: number;
  availableQuantity: number;
  borrowedQuantity: number;
  borrowCount: number;
  utilizationRate: number;
}

export interface MonthlyTrend {
  month: string;
  label: string;
  total: number;
  approved: number;
  rejected: number;
}

export interface TopBorrower {
  userId: number;
  fullName: string;
  email: string;
  totalRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}

export interface ReportSummary {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  borrowingRequests: number;
  returnedRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
  overdueRequests: number;
  totalEquipment: number;
  activeEquipment: number;
  maintenanceEquipment: number;
  totalStudents: number;
  activeStudents: number;
}

export interface ReportData {
  summary: ReportSummary;
  requestStatusStats: RequestStatusStat[];
  equipmentUsageStats: EquipmentUsageStat[];
  monthlyTrends: MonthlyTrend[];
  topBorrowers: TopBorrower[];
  recentRequests: BorrowRequest[];
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Chờ duyệt',  color: '#FA8C16' },
  approved:  { label: 'Đã duyệt',   color: '#0F88F2' },
  borrowing: { label: 'Đang mượn',  color: '#722ED1' },
  returned:  { label: 'Đã trả',     color: '#66BF26' },
  rejected:  { label: 'Từ chối',    color: '#CF1322' },
  cancelled: { label: 'Đã hủy',    color: '#8C8C8C' },
  overdue:   { label: 'Quá hạn',    color: '#BF0404' },
};

function getMonthLabel(yearMonth: string) {
  const [year, month] = yearMonth.split('-');
  return `Th${month}/${year}`;
}

function getLast6Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    months.push(`${y}-${m}`);
  }
  return months;
}

async function fetchAllBorrowRequests(): Promise<BorrowRequest[]> {
  const res = await borrowRequestService.listAll({ page: 1, pageSize: 1000 });
  return res.data?.items ?? [];
}

async function fetchAllEquipment(): Promise<Equipment[]> {
  const res = await equipmentService.list({ page: 1, pageSize: 1000 });
  return res.data?.items ?? [];
}

async function fetchAllStudents(): Promise<User[]> {
  const res = await userService.list({ page: 1, pageSize: 1000, role: 'student' });
  return res.data?.items ?? [];
}

function buildReportData(
  requests: BorrowRequest[],
  equipment: Equipment[],
  users: User[],
): ReportData {
  const now = new Date();

  const summary: ReportSummary = {
    totalRequests: requests.length,
    pendingRequests: requests.filter((r) => r.status === 'pending').length,
    approvedRequests: requests.filter((r) => r.status === 'approved').length,
    borrowingRequests: requests.filter((r) => r.status === 'borrowing').length,
    returnedRequests: requests.filter((r) => r.status === 'returned').length,
    rejectedRequests: requests.filter((r) => r.status === 'rejected').length,
    cancelledRequests: requests.filter((r) => r.status === 'cancelled').length,
    overdueRequests: requests.filter((r) => {
      if (r.status !== 'borrowing' && r.status !== 'approved') return false;
      return new Date(r.expectedReturnDate) < now;
    }).length,
    totalEquipment: equipment.length,
    activeEquipment: equipment.filter((e) => e.status === 'active').length,
    maintenanceEquipment: equipment.filter((e) => e.status === 'under_maintenance').length,
    totalStudents: users.length,
    activeStudents: users.filter((u) => u.status === 'active').length,
  };

  const requestStatusStats: RequestStatusStat[] = Object.entries(STATUS_META).map(
    ([status, meta]) => ({
      status,
      label: meta.label,
      color: meta.color,
      count: requests.filter((r) => r.status === status).length,
    }),
  ).filter((s) => s.count > 0);

  const equipmentUsageStats: EquipmentUsageStat[] = equipment.map((eq) => {
    const borrowCount = requests.filter(
      (r) => r.equipmentId === eq.id && ['approved', 'borrowing', 'returned'].includes(r.status),
    ).length;
    const borrowed = eq.totalQuantity - eq.availableQuantity;
    const utilizationRate =
      eq.totalQuantity > 0 ? Math.round((borrowed / eq.totalQuantity) * 100) : 0;
    return {
      id: eq.id,
      name: eq.name,
      totalQuantity: eq.totalQuantity,
      availableQuantity: eq.availableQuantity,
      borrowedQuantity: borrowed,
      borrowCount,
      utilizationRate,
    };
  }).sort((a, b) => b.utilizationRate - a.utilizationRate);

  const last6 = getLast6Months();
  const monthlyTrends: MonthlyTrend[] = last6.map((month) => {
    const inMonth = requests.filter((r) => r.createdAt.startsWith(month));
    return {
      month,
      label: getMonthLabel(month),
      total: inMonth.length,
      approved: inMonth.filter((r) => ['approved', 'borrowing', 'returned'].includes(r.status)).length,
      rejected: inMonth.filter((r) => r.status === 'rejected').length,
    };
  });

  const borrowerMap = new Map<number, TopBorrower>();
  for (const r of requests) {
    if (!borrowerMap.has(r.userId)) {
      const user = users.find((u) => u.id === r.userId);
      borrowerMap.set(r.userId, {
        userId: r.userId,
        fullName: r.userFullName ?? user?.fullName ?? `User #${r.userId}`,
        email: r.userEmail ?? user?.email ?? '',
        totalRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
      });
    }
    const entry = borrowerMap.get(r.userId)!;
    entry.totalRequests += 1;
    if (['approved', 'borrowing', 'returned'].includes(r.status)) entry.approvedRequests += 1;
    if (r.status === 'rejected') entry.rejectedRequests += 1;
  }
  const topBorrowers = [...borrowerMap.values()]
    .sort((a, b) => b.totalRequests - a.totalRequests)
    .slice(0, 10);

  const recentRequests = [...requests]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);

  return {
    summary,
    requestStatusStats,
    equipmentUsageStats,
    monthlyTrends,
    topBorrowers,
    recentRequests,
  };
}

export const reportService = {
  async getReportData(): Promise<ApiResponse<ReportData>> {
    const [requests, equipment, users] = await Promise.all([
      fetchAllBorrowRequests(),
      fetchAllEquipment(),
      fetchAllStudents(),
    ]);

    return {
      success: true,
      data: buildReportData(requests, equipment, users),
      message: 'OK',
    };
  },

<<<<<<< HEAD
  async exportRequestsCSV(options?: { from?: string; to?: string }): Promise<void> {
    const response = await http.get<ApiResponse<{ csv: string; fileName: string }>>('/reports/export', {
      params: {
        from: options?.from,
        to: options?.to,
      },
    });
=======
  async exportRequestsCSV(): Promise<void> {
    const requests = await fetchAllBorrowRequests();
    const sorted = [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
>>>>>>> ef361b6 (fix: ket noi thanh cong API)

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Không thể xuất báo cáo');
    }

<<<<<<< HEAD
    const { csv, fileName } = response.data.data;
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
=======
    const rows = sorted.map((r) => [
      r.id,
      r.userFullName ?? '',
      r.userEmail ?? '',
      r.equipmentName ?? '',
      r.quantity ?? '',
      statusLabel[r.status] ?? r.status,
      new Date(r.createdAt).toLocaleDateString('vi-VN'),
      r.expectedReturnDate,
      r.note ?? '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
>>>>>>> ef361b6 (fix: ket noi thanh cong API)
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};

export async function fetchDashboardStats() {
  const [requestsRes, equipmentRes, usersRes] = await Promise.all([
    borrowRequestService.listAll({ page: 1, pageSize: 1000 }),
    equipmentService.list({ page: 1, pageSize: 1000 }),
    userService.list({ page: 1, pageSize: 1000, role: 'student' }),
  ]);

  const requests = requestsRes.data?.items ?? [];
  const equipment = equipmentRes.data?.items ?? [];
  const users = usersRes.data?.items ?? [];
  const now = new Date();

  const pending = requests.filter((r) => r.status === 'pending');
  const borrowing = requests.filter((r) => r.status === 'borrowing');
  const overdue = requests.filter(
    (r) =>
      (r.status === 'borrowing' || r.status === 'approved') &&
      new Date(r.expectedReturnDate) < now,
  );

  return {
    pendingCount: pending.length,
    borrowingCount: borrowing.length,
    overdueCount: overdue.length,
    totalEquipment: equipment.length,
    availableEquipment: equipment.filter((e) => e.status === 'active').length,
    totalStudents: users.length,
    pendingRequests: pending
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 20),
    overdueRequests: overdue
      .sort((a, b) => a.expectedReturnDate.localeCompare(b.expectedReturnDate))
      .slice(0, 20),
  };
}
