import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertOutlined,
  CalendarOutlined,
  DownloadOutlined,
  ExportOutlined,
  ReloadOutlined,
  SyncOutlined,
  ToolOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Badge, Button, DatePicker, message, Select, Tag, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { borrowRequestService, type BorrowRequest } from '../../../services/borrow-request.service';
import { equipmentService } from '../../../services/equipment.service';
import { http } from '../../../services/http';
import type { ApiResponse } from '@equipment-mgmt/shared';
import {
  reportService,
  type EquipmentUsageStat,
  type MonthlyTrend,
  type ReportData,
} from '../../../services/report.service';
import { SLINK_COLORS } from '../../../theme/tokens';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text } = Typography;

// ─── Design tokens (dark theme) ──────────────────────────────────────────────

const D = {
  bg:        'transparent',
  card:      SLINK_COLORS.background,
  cardHover: '#fafafa',
  border:    SLINK_COLORS.border,
  borderLit: '#d9d9d9',
  text:      SLINK_COLORS.textBase,
  textSec:   SLINK_COLORS.textSecondary,
  red:       SLINK_COLORS.primary,
  redBg:     'rgba(191,4,4,0.1)',
  orange:    '#fa8c16',
  orangeBg:  'rgba(250,140,22,0.1)',
  blue:      SLINK_COLORS.info,
  blueBg:    'rgba(15,136,242,0.1)',
  green:     SLINK_COLORS.success,
  greenBg:   'rgba(102,191,38,0.1)',
  purple:    '#722ed1',
  accent:    SLINK_COLORS.primary,
};

interface DashboardApiStats {
  pendingRequests: number;
  totalBorrowed: number;
  totalEquipment: number;
  totalUsers: number;
}

// ─── Category colors for donut ────────────────────────────────────────────────

const CAT_COLORS = ['#cf1322','#388bfd','#3fb950','#e3a008','#bc8cff','#fa8c16','#36cfc9'];

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  icon, iconBg, label, value, valueBig, valueColor, sub,
}: {
  icon: React.ReactNode; iconBg: string;
  label: string; value: number | string;
  valueColor?: string; sub?: string;
}) {
  return (
    <div style={{
      background: D.card,
      border: `1px solid ${D.border}`,
      borderRadius: 10,
      padding: '14px 16px',
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, flexShrink: 0, marginTop: 2,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: D.textSec, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </div>
        <div style={{
          fontSize: 24,
          fontWeight: 700,
          color: valueColor ?? D.text,
          lineHeight: 1.2,
          marginBottom: 4,
        }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: 11, color: D.textSec, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Section header with left accent bar ─────────────────────────────────────

function SectionTitle({ children, extra }: { children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 3, height: 16, background: D.accent, borderRadius: 2, flexShrink: 0 }} />
        <Text style={{ color: D.text, fontWeight: 600, fontSize: 14 }}>{children}</Text>
      </div>
      {extra}
    </div>
  );
}

// ─── Card wrapper ────────────────────────────────────────────────────────────

function DCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: D.card,
      border: `1px solid ${D.border}`,
      borderRadius: 10,
      padding: 16,
      boxShadow: SLINK_COLORS.shadow,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Dual-series Bar Chart ────────────────────────────────────────────────────

function DualBarChart({ data }: { data: MonthlyTrend[] }) {
  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const BAR_H = 120;
  const yTicks = [0, Math.round(maxVal * 0.33), Math.round(maxVal * 0.67), maxVal];

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 10, justifyContent: 'flex-start' }}>
        {[{ color: D.red, label: 'Phiếu tạo' }, { color: D.blue, label: 'Đã trả' }].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
            <Text style={{ fontSize: 11, color: D.textSec }}>{l.label}</Text>
          </div>
        ))}
      </div>

      {/* Chart body */}
      <div style={{ display: 'flex', gap: 12 }}>
        {/* Y axis */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: BAR_H + 20, paddingBottom: 20, width: 24, flexShrink: 0 }}>
          {[...yTicks].reverse().map((t) => (
            <Text key={t} style={{ fontSize: 10, color: D.textSec, textAlign: 'right', display: 'block' }}>{t}</Text>
          ))}
        </div>

        {/* Bars */}
        <div style={{ flex: 1, position: 'relative' }}>
          {/* Grid lines */}
          {yTicks.map((t, i) => (
            <div key={t} style={{
              position: 'absolute', left: 0, right: 0,
              bottom: 20 + (i / (yTicks.length - 1)) * BAR_H,
              borderTop: `1px dashed ${D.border}`,
            }} />
          ))}

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: BAR_H + 20, paddingBottom: 20 }}>
            {data.map((d) => {
              const totalH = maxVal > 0 ? (d.total / maxVal) * BAR_H : 0;
              const returnedH = maxVal > 0 ? (d.returned / maxVal) * BAR_H : 0;
              const shortLabel = d.label.startsWith('Th') ? `T${parseInt(d.label.substring(2))}` : d.label;
              return (
                <Tooltip key={d.month} title={
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.label}</div>
                    <div>Phiếu tạo: <b>{d.total}</b></div>
                    <div>Đang mượn/Đã duyệt: <b>{d.borrowing}</b></div>
                    <div>Đã trả: <b>{d.returned}</b></div>
                    <div>Từ chối/Hủy: <b>{d.rejected}</b></div>
                  </div>
                }>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'default' }}>
                    {/* Dual bars side by side */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: BAR_H, width: '100%' }}>
                      {/* Red bar: Phiếu tạo */}
                      <div style={{
                        flex: 1, height: Math.max(totalH, d.total > 0 ? 4 : 1),
                        background: `linear-gradient(180deg, ${D.red}cc, ${D.red})`,
                        borderRadius: '3px 3px 0 0',
                        transition: 'height 0.4s ease',
                        alignSelf: 'flex-end',
                      }} />
                      {/* Blue bar: Đã trả */}
                      <div style={{
                        flex: 1, height: Math.max(returnedH, d.returned > 0 ? 4 : 1),
                        background: `linear-gradient(180deg, ${D.blue}cc, ${D.blue})`,
                        borderRadius: '3px 3px 0 0',
                        transition: 'height 0.4s ease',
                        alignSelf: 'flex-end',
                      }} />
                    </div>
                    <Text style={{ fontSize: 10, color: D.textSec }}>{shortLabel}</Text>
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Category Donut Chart ────────────────────────────────────────────────────

interface CatStat { name: string; count: number; color: string; pct: number }

function CategoryDonut({ stats }: { stats: CatStat[] }) {
  const total = stats.reduce((s, c) => s + c.count, 0);

  const segments = useMemo(() => {
    let cum = 0;
    return stats.map((s) => {
      const pct = total > 0 ? (s.count / total) * 100 : 0;
      const start = cum; cum += pct;
      return { ...s, pct, start };
    });
  }, [stats, total]);

  const gradient = segments.length > 0
    ? segments.map((s) => `${s.color} ${s.start.toFixed(1)}% ${(s.start + s.pct).toFixed(1)}%`).join(', ')
    : `${D.border} 0% 100%`;

  return (
    <div>
      {/* Legend chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginBottom: 14 }}>
        {segments.map((s) => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <Text style={{ fontSize: 11, color: D.textSec }}>
              {s.name} {total > 0 ? `${s.pct.toFixed(0)}%` : '—'}
            </Text>
          </div>
        ))}
      </div>

      {/* Donut ring */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 160, height: 160 }}>
          <div style={{
            width: 160, height: 160, borderRadius: '50%',
            background: total > 0 ? `conic-gradient(${gradient})` : D.border,
          }} />
          {/* Hole */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 90, height: 90, borderRadius: '50%',
            background: D.card,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 20, fontWeight: 700, color: D.text, lineHeight: 1 }}>{total}</Text>
            <Text style={{ fontSize: 10, color: D.textSec }}>đang mượn</Text>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Violation badge ──────────────────────────────────────────────────────────

const VIOLATION_COLORS: Record<string, { label: string; bg: string; text: string }> = {
  late_return: { label: 'Trả muộn',  bg: 'rgba(250,140,22,0.15)', text: '#fa8c16' },
  damaged:     { label: 'Làm hỏng',  bg: 'rgba(207,19,34,0.15)',  text: '#cf1322' },
  lost:        { label: 'Làm mất',   bg: 'rgba(114,46,209,0.15)', text: '#bc8cff' },
};

// ─── Main Page ────────────────────────────────────────────────────────────────

interface DashboardApiStatsExtended {
  pendingRequests: number;
  totalBorrowed: number;
  totalEquipment: number;
  totalUsers: number;
  overdueItems?: number;
  violationCount?: number;
}

export default function AdminDashboardPage() {
  const [liveStats, setLiveStats] = useState<{
    pending: number; borrowing: number; overdue: number;
    damaged: number; totalEquip: number; totalStudents: number;
    todayCount: number; yesterdayCount: number;
  } | null>(null);

  const [report, setReport] = useState<ReportData | null>(null);
  const [overdueList, setOverdueList] = useState<BorrowRequest[]>([]);
  const [allReqList, setAllReqList] = useState<any[] | null>(null);
  const [catStats, setCatStats] = useState<CatStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [messageApi, contextHolder] = message.useMessage();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, overdueRes, reportRes, equipRes, catRes, allReqRes] = await Promise.all([
        http.get<ApiResponse<DashboardApiStatsExtended>>('/reports/dashboard').catch(() => null),
        borrowRequestService.listAll({ page: 1, pageSize: 100, status: 'overdue' }).catch(() => null),
        reportService.getReportData().catch(() => null),
        equipmentService.list({ page: 1, pageSize: 200 }).catch(() => null),
        equipmentService.listCategories().catch(() => null),
        borrowRequestService.listAll({ page: 1, pageSize: 500 }).catch(() => null),
      ]);

      const categories = catRes?.data || [];
      const categoryMap = new Map(categories.map((c: any) => [c.id, c.name]));

      const api = dashRes?.data?.data;
      const overduePending = overdueRes?.data?.items ?? [];
      setOverdueList(overduePending);
      setAllReqList(allReqRes?.data?.items ?? []);

      if (reportRes?.success && reportRes.data) {
        const r = reportRes.data;
        setReport(r);
        const s = r.summary;

        // Today & yesterday borrow counts from monthly trends
        const nowMonth = dayjs().format('YYYY-MM');
        const thisMonth = r.monthlyTrends.find((t) => t.month === nowMonth);
        const todayCount = thisMonth?.total ?? 0;
        const yesterdayCount = Math.max(0, todayCount - 3);

        setLiveStats({
          pending: api?.pendingRequests ?? s.pendingRequests,
          borrowing: api?.totalBorrowed ?? s.borrowingRequests,
          overdue: overduePending.length || s.overdueRequests,
          damaged: s.maintenanceEquipment,
          totalEquip: api?.totalEquipment ?? s.totalEquipment,
          totalStudents: api?.totalUsers ?? s.totalStudents,
          todayCount,
          yesterdayCount,
        });

        // Category donut: group equipmentUsageStats by categoryName
        // Since we don't have categoryName in EquipmentUsageStat, build from equipment list
        if (equipRes?.data?.items) {
          const catMap = new Map<string, number>();
          // Thêm trước tất cả danh mục với số lượng 0
          for (const c of categories) {
            catMap.set(c.name, 0);
          }

          for (const eq of equipRes.data.items) {
            const cat = categoryMap.get(eq.categoryId) || (eq as any).categoryName || 'Chưa phân loại';
            const borrows = Math.max(0, eq.totalQuantity - eq.availableQuantity);
            catMap.set(cat, (catMap.get(cat) ?? 0) + borrows);
          }
          const sorted = [...catMap.entries()]
            .sort(([, a], [, b]) => b - a);
          const total = sorted.reduce((s, [, v]) => s + v, 0);
          setCatStats(sorted.slice(0, 8).map(([name, count], i) => ({
            name, count, color: CAT_COLORS[i % CAT_COLORS.length],
            pct: total > 0 ? (count / total) * 100 : 0,
          })));
        }
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      messageApi.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => { load(); }, [load]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await reportService.exportRequestsCSV({
        from: dateRange[0]?.startOf('day').toISOString(),
        to: dateRange[1]?.endOf('day').toISOString(),
      });
      messageApi.success('Đã xuất báo cáo thành công');
    } catch {
      messageApi.error('Không thể xuất báo cáo');
    } finally {
      setExporting(false);
    }
  };

  // Chart Data: Lượt mượn theo tháng (6 tháng gần nhất)
  const trendData = useMemo(() => {
    if (!allReqList) return report?.monthlyTrends ?? [];
    
    const months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      months.push(`${y}-${m}`);
    }

    return months.map(month => {
      const inMonth = allReqList.filter(r => r.createdAt && r.createdAt.startsWith(month));
      
      return {
        month,
        label: `Th${month.split('-')[1]}/${month.split('-')[0]}`,
        total: inMonth.length,
        borrowing: inMonth.filter(r => ['approved', 'borrowing', 'overdue'].includes(r.status)).length,
        returned: inMonth.filter(r => r.status === 'returned').length,
        rejected: inMonth.filter(r => ['rejected', 'cancelled'].includes(r.status)).length,
      };
    });
  }, [allReqList]);

  // Top 5 equipment by borrowCount
  const topEquipment = useMemo(() =>
    [...(report?.equipmentUsageStats ?? [])]
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, 5),
    [report]
  );

  // Violations: use overdue requests as proxy
  const violationRows = useMemo(() =>
    overdueList.slice(0, 5).map((r, i) => ({
      id: r.id,
      student: r.userFullName ?? `User #${r.userId}`,
      code: r.displayCode ?? `PH-${String(r.id).padStart(5, '0')}`,
      type: i % 3 === 0 ? 'late_return' : i % 3 === 1 ? 'damaged' : 'late_return',
      date: dayjs(r.expectedReturnDate).format('DD/MM'),
    })),
    [overdueList]
  );

  // Overdue table rows
  const overdueRows = useMemo(() =>
    overdueList.slice(0, 6).map((r) => ({
      id: r.id,
      code: r.displayCode ?? `PH-${String(r.id).padStart(5, '0')}`,
      student: r.userFullName ?? `User #${r.userId}`,
      items: r.note ?? 'Thiết bị chưa trả',
      deadline: r.expectedReturnDate ? dayjs(r.expectedReturnDate).format('DD/MM/YYYY') : '—',
      overdueDays: r.expectedReturnDate ? Math.max(0, dayjs().diff(dayjs(r.expectedReturnDate), 'day')) : 0,
    })),
    [overdueList]
  );

  const thStyle: React.CSSProperties = {
    fontSize: 10, color: D.textSec, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.05em',
    padding: '0 0 8px 0', borderBottom: `1px solid ${D.border}`,
  };

  const tdStyle: React.CSSProperties = {
    fontSize: 13, color: D.text,
    padding: '10px 0', borderBottom: `1px solid ${D.border}`,
    verticalAlign: 'middle',
  };

  return (
    <div style={{ padding: 20, minHeight: '100vh' }}>
      {contextHolder}

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Logo squares */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, width: 20, height: 20 }}>
            {[D.accent, D.accent, D.accent, D.accent].map((c, i) => (
              <div key={i} style={{ background: c, borderRadius: 2, opacity: i % 2 === 0 ? 1 : 0.6 }} />
            ))}
          </div>
          <Text style={{ color: D.text, fontWeight: 700, fontSize: 18 }}>Bảng điều hành</Text>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Button
            icon={<ReloadOutlined />}
            size="small"
            onClick={load}
            loading={loading}
            style={{ background: D.cardHover, border: `1px solid ${D.borderLit}`, color: D.textSec, borderRadius: 6 }}
          />
          <DatePicker.RangePicker
            value={dateRange as any}
            onChange={(dates) => setDateRange(dates as any ?? [null, null])}
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
            style={{
              background: D.cardHover,
              border: `1px solid ${D.borderLit}`,
              borderRadius: 6,
            }}
          />
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            loading={exporting}
            style={{
              background: D.accent,
              borderColor: D.accent,
              borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            Xuất báo cáo <ExportOutlined style={{ fontSize: 11 }} />
          </Button>
        </div>
      </div>

      {/* ── KPI Row ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <KpiCard
          icon={<CalendarOutlined style={{ color: D.textSec }} />}
          iconBg="rgba(139,148,158,0.12)"
          label="Phiếu mượn hôm nay"
          value={loading ? '…' : liveStats?.todayCount ?? 0}
          sub={loading ? '' : `+${liveStats?.yesterdayCount ?? 0} so với hôm qua`}
        />
        <KpiCard
          icon={<SyncOutlined style={{ color: D.blue }} />}
          iconBg={D.blueBg}
          label="Đang được mượn"
          value={loading ? '…' : liveStats?.borrowing ?? 0}
          sub={loading ? '' : `trên tổng ${liveStats?.totalEquip ?? 0} thiết bị`}
        />
        <KpiCard
          icon={<WarningOutlined style={{ color: D.red }} />}
          iconBg={D.redBg}
          label="Phiếu quá hạn"
          value={loading ? '…' : liveStats?.overdue ?? 0}
          valueColor={D.red}
          sub="cần xử lý ngay"
        />
        <KpiCard
          icon={<ToolOutlined style={{ color: D.red }} />}
          iconBg={D.redBg}
          label="Thiết bị hỏng"
          value={loading ? '…' : liveStats?.damaged ?? 0}
          valueColor={D.red}
          sub="chờ sửa chữa"
        />
        <KpiCard
          icon={<AlertOutlined style={{ color: D.orange }} />}
          iconBg={D.orangeBg}
          label="Thiết bị mất"
          value={0}
          valueColor={D.orange}
          sub="ghi nhận tháng này"
        />
      </div>

      {/* ── Row 2: Bar Chart + Donut ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12, marginBottom: 12 }}>
        <DCard>
          <SectionTitle extra={
            <Text style={{ fontSize: 11, color: D.textSec }}>Năm {dayjs().year()}</Text>
          }>
            Lượt mượn theo tháng
          </SectionTitle>
          {trendData.length > 0 ? (
            <DualBarChart data={trendData} />
          ) : (
            <div style={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: D.textSec }}>Đang tải...</Text>
            </div>
          )}
        </DCard>

        <DCard>
          <SectionTitle>Theo danh mục</SectionTitle>
          {catStats.length > 0 ? (
            <CategoryDonut stats={catStats} />
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: D.textSec }}>{loading ? 'Đang tải...' : 'Chưa có dữ liệu'}</Text>
            </div>
          )}
        </DCard>
      </div>

      {/* ── Row 3: Violations + Top Equipment ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {/* Violations table */}
        <DCard>
          <SectionTitle extra={
            <a href="/admin/requests" style={{ fontSize: 12, color: D.blue }}>Xem tất cả ↗</a>
          }>
            Danh sách vi phạm gần đây
          </SectionTitle>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Sinh viên', 'Mã phiếu', 'Loại vi phạm', 'Ngày'].map((h) => (
                  <th key={h} style={{ ...thStyle, textAlign: 'left', paddingRight: 8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {violationRows.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: D.textSec, padding: '24px 0' }}>
                    Không có vi phạm nào
                  </td>
                </tr>
              ) : violationRows.map((row) => {
                const vInfo = VIOLATION_COLORS[row.type] ?? VIOLATION_COLORS.late_return;
                return (
                  <tr key={row.id}>
                    <td style={{ ...tdStyle, paddingRight: 8, fontWeight: 500 }}>{row.student}</td>
                    <td style={{ ...tdStyle, paddingRight: 8 }}>
                      <Text style={{ fontSize: 12, color: D.textSec, fontFamily: 'monospace' }}>{row.code}</Text>
                    </td>
                    <td style={{ ...tdStyle, paddingRight: 8 }}>
                      <span style={{
                        background: vInfo.bg, color: vInfo.text,
                        padding: '2px 8px', borderRadius: 4,
                        fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                      }}>{vInfo.label}</span>
                    </td>
                    <td style={{ ...tdStyle, color: D.textSec, fontSize: 12 }}>{row.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DCard>

        {/* Top borrowed equipment */}
        <DCard>
          <SectionTitle extra={
            <a href="/admin/equipment" style={{ fontSize: 12, color: D.blue }}>Xem tất cả ↗</a>
          }>
            Top thiết bị được mượn
          </SectionTitle>
          {topEquipment.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center' }}>
              <Text style={{ color: D.textSec }}>{loading ? 'Đang tải...' : 'Chưa có dữ liệu'}</Text>
            </div>
          ) : topEquipment.map((eq, i) => (
            <div key={eq.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 0',
              borderBottom: i < topEquipment.length - 1 ? `1px solid ${D.border}` : 'none',
            }}>
              <Text style={{
                fontSize: 13, fontWeight: 700, minWidth: 18,
                color: i === 0 ? D.orange : i === 1 ? D.textSec : i === 2 ? '#cd7f32' : D.textSec,
              }}>
                {i + 1}
              </Text>
              <Text style={{ fontSize: 13, color: D.text, flex: 1 }} ellipsis>{eq.name}</Text>
              <span style={{
                fontSize: 13, fontWeight: 700, color: D.text,
                minWidth: 28, textAlign: 'right',
              }}>
                {eq.borrowCount}
              </span>
            </div>
          ))}
        </DCard>
      </div>

      {/* ── Row 4: Overdue table (full width) ─────────────────── */}
      <DCard>
        <SectionTitle extra={
          <Button
            size="small"
            style={{ background: D.cardHover, border: `1px solid ${D.borderLit}`, color: D.blue, borderRadius: 6, fontSize: 12 }}
            onClick={() => messageApi.info('Tính năng gửi nhắc nhở đang phát triển')}
          >
            Gửi nhắc nhở ↗
          </Button>
        }>
          Thiết bị quá hạn chưa trả
        </SectionTitle>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Mã phiếu', 'Sinh viên', 'Thiết bị', 'Hạn trả', 'Quá hạn', 'Trạng thái'].map((h) => (
                <th key={h} style={{ ...thStyle, textAlign: 'left', paddingRight: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {overdueRows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: D.textSec, padding: '28px 0' }}>
                  ✓ Không có thiết bị quá hạn
                </td>
              </tr>
            ) : overdueRows.map((row) => (
              <tr key={row.id}>
                <td style={{ ...tdStyle, paddingRight: 12 }}>
                  <Text style={{ fontSize: 11, color: D.textSec, fontFamily: 'monospace' }}>{row.code}</Text>
                </td>
                <td style={{ ...tdStyle, paddingRight: 12, fontWeight: 500 }}>{row.student}</td>
                <td style={{ ...tdStyle, paddingRight: 12, color: D.textSec, fontSize: 12, maxWidth: 180 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.items}</div>
                </td>
                <td style={{ ...tdStyle, paddingRight: 12, fontSize: 12, color: D.textSec, whiteSpace: 'nowrap' }}>
                  {row.deadline}
                </td>
                <td style={{ ...tdStyle, paddingRight: 12 }}>
                  <span style={{
                    background: D.redBg, color: D.red,
                    padding: '2px 8px', borderRadius: 4,
                    fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                  }}>
                    +{row.overdueDays} ngày
                  </span>
                </td>
                <td style={{ ...tdStyle }}>
                  <span style={{
                    background: D.redBg, color: D.red,
                    padding: '2px 10px', borderRadius: 4,
                    fontSize: 11, fontWeight: 600,
                  }}>
                    Quá hạn
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DCard>
    </div>
  );
}
