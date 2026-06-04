import { http } from './http';
import type { ApiResponse } from '@equipment-mgmt/shared';

// Giữ nguyên các định nghĩa Interface để giao diện không bị lỗi đỏ
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
  recentRequests: any[];
}

export const reportService = {
  async getReportData(): Promise<ApiResponse<ReportData>> {
    // Gọi API lấy toàn bộ dữ liệu thống kê từ Backend
    const response = await http.get('/reports/dashboard');
    return response.data;
  },

  async exportRequestsCSV(): Promise<void> {
    // Gọi API Backend để tải file CSV về máy
    const response = await http.get('/reports/export', { responseType: 'blob' });
    
    // Logic tải file của trình duyệt
    const url = URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `bao-cao-muon-thiet-bi-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },
};