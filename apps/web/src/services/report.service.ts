import type { ApiResponse } from '@equipment-mgmt/shared';
import {
  OFFLINE_STORAGE_KEYS,
  apiSuccess,
  readCollection,
  type MockBorrowRequest,
  type MockEquipment,
  type MockUser,
} from '../mocks/offlineStorage';

// ─── Types ────────────────────────────────────────────────────────────────────

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
  utilizationRate: number; // 0-100
}

export interface MonthlyTrend {
  month: string;   // 'YYYY-MM'
  label: string;   // 'Th01/2025'
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
  recentRequests: MockBorrowRequest[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Service ──────────────────────────────────────────────────────────────────

export const reportService = {
  async getReportData(): Promise<ApiResponse<ReportData>> {
    const requests = readCollection<MockBorrowRequest>(OFFLINE_STORAGE_KEYS.borrowRequests);
    const equipment = readCollection<MockEquipment>(OFFLINE_STORAGE_KEYS.equipment);
    const users = readCollection<MockUser>(OFFLINE_STORAGE_KEYS.users);

    const now = new Date();

    // ── Summary ──────────────────────────────────────────────────────────────
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
      totalStudents: users.filter((u) => u.role === 'student').length,
      activeStudents: users.filter((u) => u.role === 'student' && u.status === 'active').length,
    };

    // ── Request status stats (for pie/bar chart) ──────────────────────────────
    const requestStatusStats: RequestStatusStat[] = Object.entries(STATUS_META).map(
      ([status, meta]) => ({
        status,
        label: meta.label,
        color: meta.color,
        count: requests.filter((r) => r.status === status).length,
      }),
    ).filter((s) => s.count > 0);

    // ── Equipment usage stats ─────────────────────────────────────────────────
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

    // ── Monthly trends (last 6 months) ────────────────────────────────────────
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

    // ── Top borrowers ─────────────────────────────────────────────────────────
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

    // ── Recent 10 requests ────────────────────────────────────────────────────
    const recentRequests = [...requests]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 10);

    return apiSuccess(
      { summary, requestStatusStats, equipmentUsageStats, monthlyTrends, topBorrowers, recentRequests },
      'OK',
    );
  },

  /** Xuất CSV từ dữ liệu yêu cầu */
  exportRequestsCSV(): void {
    const requests = readCollection<MockBorrowRequest>(OFFLINE_STORAGE_KEYS.borrowRequests);
    const sorted = [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const headers = ['ID', 'Sinh viên', 'Email', 'Thiết bị', 'Số lượng', 'Trạng thái', 'Ngày gửi', 'Hạn trả', 'Ghi chú'];
    const statusLabel: Record<string, string> = {
      pending: 'Chờ duyệt', approved: 'Đã duyệt', borrowing: 'Đang mượn',
      returned: 'Đã trả', rejected: 'Từ chối', cancelled: 'Đã hủy', overdue: 'Quá hạn',
    };

    const rows = sorted.map((r) => [
      r.id,
      r.userFullName ?? '',
      r.userEmail ?? '',
      r.equipmentName ?? '',
      r.quantity,
      statusLabel[r.status] ?? r.status,
      new Date(r.createdAt).toLocaleDateString('vi-VN'),
      r.expectedReturnDate,
      r.note ?? '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const bom = '\uFEFF'; // UTF-8 BOM for Excel
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bao-cao-muon-thiet-bi-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },
};
