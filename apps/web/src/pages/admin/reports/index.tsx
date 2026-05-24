import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  BarChartOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  ReloadOutlined,
  TeamOutlined,
  ToolOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Progress,
  Row,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  reportService,
  type EquipmentUsageStat,
  type MonthlyTrend,
  type ReportData,
  type RequestStatusStat,
  type TopBorrower,
} from '../../../services/report.service';
import { SLINK_COLORS } from '../../../theme/tokens';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// ─── Shared styles ─────────────────────────────────────────────────────────────

const cardStyle: CSSProperties = {
  borderRadius: 10,
  border: `1px solid ${SLINK_COLORS.border}`,
  boxShadow: SLINK_COLORS.shadow,
};

const PAGE_SIZE = 6;
const TABLE_SCROLL_Y = 300;

// ─── Donut chart (CSS-only) ───────────────────────────────────────────────────

function DonutChart({ stats }: { stats: RequestStatusStat[] }) {
  const total = stats.reduce((s, i) => s + i.count, 0);

  const segments = useMemo(() => {
    let cum = 0;
    return stats.map((s) => {
      const pct = total > 0 ? (s.count / total) * 100 : 0;
      const start = cum;
      cum += pct;
      return { ...s, pct, start };
    });
  }, [stats, total]);

  const gradient = segments
    .map((s) => `${s.color} ${s.start.toFixed(1)}% ${(s.start + s.pct).toFixed(1)}%`)
    .join(', ');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
      {/* Donut ring */}
      <div style={{ position: 'relative', width: 148, height: 148, flexShrink: 0 }}>
        <div
          style={{
            width: 148,
            height: 148,
            borderRadius: '50%',
            background: total > 0 ? `conic-gradient(${gradient})` : SLINK_COLORS.border,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 84,
            height: 84,
            borderRadius: '50%',
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 700, color: SLINK_COLORS.textBase, lineHeight: 1 }}>
            {total}
          </Text>
          <Text type="secondary" style={{ fontSize: 10 }}>tổng</Text>
        </div>
      </div>
      {/* Legend */}
      <div style={{ flex: 1, minWidth: 150 }}>
        {segments.map((s) => (
          <div key={s.status} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <Text style={{ fontSize: 13, flex: 1 }}>{s.label}</Text>
            <Text strong style={{ fontSize: 13 }}>{s.count}</Text>
            <Text type="secondary" style={{ fontSize: 11, width: 34, textAlign: 'right' }}>
              {total > 0 ? `${s.pct.toFixed(0)}%` : '—'}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Monthly Bar Chart ────────────────────────────────────────────────────────

function MonthlyBarChart({ data }: { data: MonthlyTrend[] }) {
  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const BAR_H = 140;

  const legendItems = [
    { color: '#0F88F2', label: 'Được duyệt' },
    { color: '#CF1322', label: 'Từ chối' },
    { color: SLINK_COLORS.border, label: 'Chờ / khác' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Legend — above chart, never overlaps */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        {legendItems.map((x) => (
          <div key={x.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: x.color,
                flexShrink: 0,
              }}
            />
            <Text style={{ fontSize: 12, color: SLINK_COLORS.textSecondary }}>{x.label}</Text>
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 8,
          height: BAR_H + 36,
          paddingBottom: 36,
          position: 'relative',
        }}
      >
        {/* Y-axis grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
          <div
            key={frac}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 36 + frac * BAR_H,
              borderTop: `1px dashed ${SLINK_COLORS.border}`,
              zIndex: 0,
            }}
          />
        ))}

        {/* Bars */}
        {data.map((d) => {
          const h = maxVal > 0 ? (d.total / maxVal) * BAR_H : 0;
          const aH = maxVal > 0 ? (d.approved / maxVal) * BAR_H : 0;
          const rH = maxVal > 0 ? (d.rejected / maxVal) * BAR_H : 0;
          const restH = Math.max(h - aH, 0);

          return (
            <Tooltip
              key={d.month}
              title={
                <div style={{ lineHeight: 1.8 }}>
                  <div><Text style={{ color: '#fff', fontWeight: 600 }}>{d.label}</Text></div>
                  <div>Tổng: <b>{d.total}</b></div>
                  <div style={{ color: '#91caff' }}>Được duyệt: <b>{d.approved}</b></div>
                  <div style={{ color: '#ff7875' }}>Từ chối: <b>{d.rejected}</b></div>
                </div>
              }
            >
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  zIndex: 1,
                  position: 'relative',
                  cursor: 'default',
                }}
              >
                {/* Value label on top of bar */}
                {d.total > 0 && (
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: SLINK_COLORS.textSecondary,
                      lineHeight: 1,
                    }}
                  >
                    {d.total}
                  </Text>
                )}

                {/* Stacked bar */}
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    height: Math.max(h, d.total > 0 ? 6 : 2),
                    borderRadius: '6px 6px 0 0',
                    overflow: 'hidden',
                    transition: 'height 0.35s ease',
                    boxShadow: d.total > 0 ? '0 -1px 4px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {/* Grey: pending/other */}
                  <div
                    style={{
                      height: restH,
                      background: 'rgba(140,140,140,0.3)',
                      transition: 'height 0.35s ease',
                    }}
                  />
                  {/* Red: rejected */}
                  <div
                    style={{
                      height: rH,
                      background: '#CF1322',
                      transition: 'height 0.35s ease',
                    }}
                  />
                  {/* Blue: approved */}
                  <div
                    style={{
                      height: Math.max(aH - rH, 0),
                      background: '#0F88F2',
                      transition: 'height 0.35s ease',
                    }}
                  />
                </div>

                {/* Month label */}
                <Text
                  style={{
                    fontSize: 11,
                    color: SLINK_COLORS.textSecondary,
                    marginTop: 4,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {d.label}
                </Text>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

// ─── Summary Row Item ─────────────────────────────────────────────────────────

function SummaryRow({ label, value, color, warn }: { label: string; value: number; color: string; warn?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: `1px solid ${SLINK_COLORS.border}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {warn && <WarningOutlined style={{ color, fontSize: 12 }} />}
        <Text style={{ fontSize: 13, color: SLINK_COLORS.textSecondary }}>{label}</Text>
      </div>
      <Text strong style={{ fontSize: 15, color }}>{value}</Text>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filterRange, setFilterRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportService.getReportData();
      if (res.success && res.data) setData(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = () => {
    setExporting(true);
    try { reportService.exportRequestsCSV(); }
    finally { setTimeout(() => setExporting(false), 800); }
  };

  // ── Shared table props ──────────────────────────────────────────────────

  const tableProps = {
    size: 'small' as const,
    loading,
    pagination: {
      pageSize: PAGE_SIZE,
      size: 'small' as const,
      showSizeChanger: false,
      showTotal: (total: number) => <Text style={{ fontSize: 12 }}>{total} mục</Text>,
    },
    scroll: { y: TABLE_SCROLL_Y },
  };

  // ── Equipment columns ────────────────────────────────────────────────────

  const equipmentCols: ColumnsType<EquipmentUsageStat> = [
    {
      title: '#',
      key: 'r',
      width: 36,
      render: (_: unknown, __: unknown, i: number) => (
        <Text style={{ color: i < 3 ? SLINK_COLORS.primary : SLINK_COLORS.textSecondary, fontWeight: 600, fontSize: 12 }}>
          {i + 1}
        </Text>
      ),
    },
    { title: 'Tên thiết bị', dataIndex: 'name', key: 'name', ellipsis: true },
    {
      title: 'Tổng/Sẵn',
      key: 'qty',
      width: 90,
      render: (_: unknown, r: EquipmentUsageStat) => (
        <Text style={{ fontSize: 12 }}>
          <Text strong>{r.availableQuantity}</Text>
          <Text type="secondary">/{r.totalQuantity}</Text>
        </Text>
      ),
    },
    {
      title: 'Lượt',
      dataIndex: 'borrowCount',
      key: 'bc',
      width: 56,
      sorter: (a: EquipmentUsageStat, b: EquipmentUsageStat) => a.borrowCount - b.borrowCount,
      render: (v: number) => <Text strong style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Tỷ lệ',
      dataIndex: 'utilizationRate',
      key: 'ur',
      width: 130,
      defaultSortOrder: 'descend' as const,
      sorter: (a: EquipmentUsageStat, b: EquipmentUsageStat) => a.utilizationRate - b.utilizationRate,
      render: (rate: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Progress
            percent={rate}
            size="small"
            strokeColor={rate >= 80 ? '#CF1322' : rate >= 50 ? '#FA8C16' : '#66BF26'}
            style={{ width: 76, marginBottom: 0 }}
            format={() => null}
          />
          <Text style={{ fontSize: 11, color: SLINK_COLORS.textSecondary }}>{rate}%</Text>
        </div>
      ),
    },
  ];

  // ── Top borrower columns ─────────────────────────────────────────────────

  const borrowerCols: ColumnsType<TopBorrower> = [
    {
      title: '#',
      key: 'r',
      width: 36,
      render: (_: unknown, __: unknown, i: number) => (
        <Text strong style={{ color: i < 3 ? '#FA8C16' : SLINK_COLORS.textSecondary, fontSize: 12 }}>
          {i + 1}
        </Text>
      ),
    },
    { title: 'Sinh viên', dataIndex: 'fullName', key: 'fn', ellipsis: true },
    {
      title: 'Tổng',
      dataIndex: 'totalRequests',
      key: 'tr',
      width: 60,
      sorter: (a: TopBorrower, b: TopBorrower) => a.totalRequests - b.totalRequests,
      render: (v: number) => <Text strong style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Duyệt',
      dataIndex: 'approvedRequests',
      key: 'ar',
      width: 62,
      render: (v: number) => <Tag color="blue" style={{ fontSize: 11 }}>{v}</Tag>,
    },
    {
      title: 'Từ chối',
      dataIndex: 'rejectedRequests',
      key: 'rr',
      width: 68,
      render: (v: number) => <Tag color="red" style={{ fontSize: 11 }}>{v}</Tag>,
    },
  ];

  const s = data?.summary;

  return (
    <div style={{ padding: 24 }}>
      {/* ── Header ── */}
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Title level={4} style={{ marginBottom: 4 }}>Báo Cáo & Phân Tích</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Dữ liệu lịch sử hoạt động mượn trả — phục vụ đánh giá và báo cáo định kỳ
          </Text>
        </div>
        <Space wrap>
          <RangePicker
            placeholder={['Từ ngày', 'Đến ngày']}
            format="DD/MM/YYYY"
            onChange={(dates) => setFilterRange(dates ? [dates[0]!, dates[1]!] : null)}
            style={{ fontSize: 13 }}
          />
          <Select
            defaultValue="all"
            style={{ width: 148 }}
            options={[
              { value: 'all', label: 'Tất cả thiết bị' },
              { value: 'active', label: 'Đang hoạt động' },
              { value: 'under_maintenance', label: 'Đang bảo trì' },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Làm mới</Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            loading={exporting}
            style={{ background: SLINK_COLORS.primary, borderColor: SLINK_COLORS.primary }}
          >
            Xuất CSV
          </Button>
        </Space>
      </div>

      {/* Active filter banner */}
      {filterRange && (
        <div
          style={{
            background: 'rgba(15,136,242,0.06)',
            border: `1px solid rgba(15,136,242,0.2)`,
            borderRadius: 8,
            padding: '7px 14px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <BarChartOutlined style={{ color: SLINK_COLORS.info }} />
          <Text style={{ fontSize: 13, color: SLINK_COLORS.info }}>
            Lọc từ <b>{filterRange[0].format('DD/MM/YYYY')}</b> đến <b>{filterRange[1].format('DD/MM/YYYY')}</b>
          </Text>
          <Button size="small" type="text" onClick={() => setFilterRange(null)} style={{ marginLeft: 'auto', color: SLINK_COLORS.textSecondary }}>
            × Xóa
          </Button>
        </div>
      )}

      {loading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map((i) => (
            <Col xs={24} lg={12} key={i}>
              <Skeleton active paragraph={{ rows: 5 }} />
            </Col>
          ))}
        </Row>
      ) : (
        <>
          {/* ── Row 1: Donut (left) + Bar chart (right) — equal height ── */}
          <Row gutter={[16, 16]} align="stretch" style={{ marginBottom: 16 }}>
            <Col xs={24} lg={10}>
              <Card
                style={{ ...cardStyle, height: '100%' }}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BarChartOutlined style={{ color: SLINK_COLORS.primary }} />
                    <Text strong style={{ fontSize: 14 }}>Phân bố trạng thái</Text>
                  </div>
                }
              >
                {data?.requestStatusStats?.length ? (
                  <DonutChart stats={data.requestStatusStats} />
                ) : (
                  <Text type="secondary">Chưa có dữ liệu.</Text>
                )}
              </Card>
            </Col>
            <Col xs={24} lg={14}>
              <Card
                style={{ ...cardStyle, height: '100%' }}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BarChartOutlined style={{ color: SLINK_COLORS.info }} />
                    <Text strong style={{ fontSize: 14 }}>Xu hướng 6 tháng gần đây</Text>
                  </div>
                }
              >
                {data?.monthlyTrends && <MonthlyBarChart data={data.monthlyTrends} />}
              </Card>
            </Col>
          </Row>

          {/* ── Row 2: Equipment table (left) + Borrowers table (right) — equal height ── */}
          <Row gutter={[16, 16]} align="stretch" style={{ marginBottom: 16 }}>
            <Col xs={24} lg={12}>
              <Card
                style={{ ...cardStyle, height: '100%' }}
                bodyStyle={{ padding: 0 }}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ToolOutlined style={{ color: SLINK_COLORS.primary }} />
                    <Text strong style={{ fontSize: 14 }}>Tình trạng sử dụng thiết bị</Text>
                  </div>
                }
                extra={<Text type="secondary" style={{ fontSize: 12 }}>Sắp xếp theo tỷ lệ cao nhất</Text>}
              >
                <Table<EquipmentUsageStat>
                  {...tableProps}
                  dataSource={data?.equipmentUsageStats ?? []}
                  columns={equipmentCols}
                  rowKey="id"
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                style={{ ...cardStyle, height: '100%' }}
                bodyStyle={{ padding: 0 }}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TeamOutlined style={{ color: '#722ED1' }} />
                    <Text strong style={{ fontSize: 14 }}>Top sinh viên mượn nhiều nhất</Text>
                  </div>
                }
              >
                <Table<TopBorrower>
                  {...tableProps}
                  dataSource={data?.topBorrowers ?? []}
                  columns={borrowerCols}
                  rowKey="userId"
                />
              </Card>
            </Col>
          </Row>

          {/* ── Row 3: Summary stats panel (full width) ── */}
          <Card
            style={cardStyle}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircleOutlined style={{ color: SLINK_COLORS.success }} />
                <Text strong style={{ fontSize: 14 }}>Tổng kết kỳ</Text>
              </div>
            }
            extra={
              <Button
                type="primary"
                size="small"
                icon={<DownloadOutlined />}
                onClick={handleExport}
                loading={exporting}
                style={{ background: SLINK_COLORS.primary, borderColor: SLINK_COLORS.primary }}
              >
                Xuất CSV
              </Button>
            }
          >
            <Row gutter={[48, 0]}>
              <Col xs={24} sm={12} lg={8}>
                <SummaryRow label="Tổng yêu cầu" value={s?.totalRequests ?? 0} color={SLINK_COLORS.info} />
                <SummaryRow label="Được duyệt" value={s?.approvedRequests ?? 0} color={SLINK_COLORS.success} />
                <SummaryRow label="Đang mượn" value={s?.borrowingRequests ?? 0} color="#722ED1" />
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <SummaryRow label="Đã hoàn trả" value={s?.returnedRequests ?? 0} color="#0F88F2" />
                <SummaryRow label="Bị từ chối" value={s?.rejectedRequests ?? 0} color="#CF1322" />
                <SummaryRow label="Quá hạn" value={s?.overdueRequests ?? 0} color="#FA8C16" warn />
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <SummaryRow label="Tổng thiết bị" value={s?.totalEquipment ?? 0} color={SLINK_COLORS.primary} />
                <SummaryRow label="Đang hoạt động" value={s?.activeEquipment ?? 0} color={SLINK_COLORS.success} />
                <SummaryRow label="Đang bảo trì" value={s?.maintenanceEquipment ?? 0} color="#FA8C16" warn />
              </Col>
            </Row>
          </Card>
        </>
      )}
    </div>
  );
}

