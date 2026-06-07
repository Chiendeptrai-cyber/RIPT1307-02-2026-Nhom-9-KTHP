import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from 'antd/es/table';
import {
  DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined,
  ToolOutlined, ImportOutlined, WarningOutlined, QuestionCircleOutlined,
  SwapOutlined, ApartmentOutlined, ReloadOutlined, PictureOutlined, LinkOutlined,
} from '@ant-design/icons';
import { equipmentService, type Equipment, type StockAdjustType } from '../../../services/equipment.service';
import { SLINK_COLORS } from '../../../theme/tokens';
import { SystemLogAction } from '@equipment-mgmt/shared';
import { createSystemLog } from '../../../mocks/systemLogStore';
import { idBadgeStyle } from '@/utils/format';

const { Title, Text } = Typography;
const { TextArea } = Input;

/* ─── Status config ───────────────────────────────────────── */
const STATUS_CFG: Record<string, { label: string; color: string; badge: 'success' | 'warning' | 'error' | 'default' | 'processing' }> = {
  active:            { label: 'Hoạt động',       color: 'green',   badge: 'success' },
  under_maintenance: { label: 'Sửa chữa',        color: 'orange',  badge: 'warning' },
  damaged:           { label: 'Hỏng',            color: 'red',     badge: 'error' },
  discontinued:      { label: 'Ngừng sử dụng',  color: 'default', badge: 'default' },
};

interface EquipmentFormValues {
  name: string;
  categoryId: number;
  totalQuantity: number;
  status?: string;
  description?: string;
  imageUrl?: string;
}

const TRANSITIONS: Record<string, { value: string; label: string; danger?: boolean }[]> = {
  active:            [{ value: 'under_maintenance', label: 'Chuyển sang Sửa chữa' }, { value: 'damaged', label: 'Ghi nhận Hỏng', danger: true }],
  under_maintenance: [{ value: 'active', label: 'Đã sửa xong → Hoạt động' }, { value: 'discontinued', label: 'Ngừng sử dụng', danger: true }],
  damaged:           [{ value: 'under_maintenance', label: 'Đưa đi sửa chữa' }, { value: 'discontinued', label: 'Ngừng sử dụng', danger: true }],
  discontinued:      [],
};

const ADJUST_TYPES: { value: StockAdjustType; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  { value: 'import',      label: 'Nhập thêm',              desc: 'Tăng tổng và sẵn sàng',              icon: <ImportOutlined />,       color: '#389e0d' },
  { value: 'mark_damaged',label: 'Ghi nhận hỏng',          desc: 'Giảm sẵn sàng, tổng không đổi',     icon: <WarningOutlined />,      color: '#fa8c16' },
  { value: 'mark_lost',   label: 'Ghi nhận mất',           desc: 'Giảm tổng và sẵn sàng vĩnh viễn',   icon: <QuestionCircleOutlined />,color: '#ff4d4f' },
  { value: 'adjustment',  label: 'Điều chỉnh trực tiếp',   desc: 'Đặt giá trị tổng/sẵn sàng mới',     icon: <ApartmentOutlined />,    color: '#1677ff' },
];

export default function AdminEquipmentPage() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const [formModal, setFormModal] = useState<{ open: boolean; record?: Equipment }>({ open: false });
  const [formLoading, setFormLoading] = useState(false);
  const [infoForm] = Form.useForm();
  const [imagePreview, setImagePreview] = useState<string>('');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  const [stockModal, setStockModal] = useState<{ open: boolean; record?: Equipment }>({ open: false });
  const [adjustType, setAdjustType] = useState<StockAdjustType>('import');
  const [stockForm] = Form.useForm();
  const [stockLoading, setStockLoading] = useState(false);

  const [statusModal, setStatusModal] = useState<{ open: boolean; record?: Equipment }>({ open: false });
  const [newStatus, setNewStatus] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const load = useCallback(async (p = 1) => {
    setLoading(true); setError(null);
    try {
      const res = await equipmentService.list({ page: p, pageSize: 15, search: search || undefined, status: statusFilter });
      if (res.success && res.data) { setItems(res.data.items); setTotal(res.data.total); setPage(p); }
    } catch (e: any) { setError(e?.message ?? 'Không thể tải danh sách'); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(1), 300);
  }, [search, statusFilter, load]);

  useEffect(() => {
    equipmentService.listCategories()
      .then((res) => { if (res.success && res.data) setCategories(res.data); })
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) { message.warning('Vui lòng nhập tên loại thiết bị'); return; }
    setAddingCategory(true);
    try {
      const res = await equipmentService.createCategory({ name: newCategoryName.trim() });
      if (res.success && res.data) {
        const newCat = { id: res.data.id, name: res.data.name };
        setCategories((prev) => [...prev, newCat]);
        infoForm.setFieldValue('categoryId', res.data.id);
        setNewCategoryName('');
        message.success(`Đã thêm loại thiết bị: ${res.data.name}`);
      } else {
        message.error(res.message || 'Không thể tạo loại thiết bị');
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra');
    } finally { setAddingCategory(false); }
  };

  const openCreate = () => { setFormModal({ open: true }); infoForm.resetFields(); setImagePreview(''); };
  const openEdit = (r: Equipment) => {
    setFormModal({ open: true, record: r });
    setImagePreview(r.imageUrl || '');
    infoForm.setFieldsValue({
      name: r.name,
      description: r.description,
      totalQuantity: r.totalQuantity,
      categoryId: (r as any).categoryId ?? undefined,
      status: r.status,
      imageUrl: r.imageUrl || '',
    });
  };

  const handleFormSubmit = async (values: any) => {
    setFormLoading(true);
    try {
      if (formModal.record) {
        const old = formModal.record;
        await equipmentService.update(old.id, {
          name: values.name,
          description: values.description,
          imageUrl: values.imageUrl || null,
        });
        const changedFields: string[] = [];
        if (values.name !== old.name) changedFields.push('name');
        if (values.description !== old.description) changedFields.push('description');
        if (changedFields.length > 0) {
          createSystemLog({
            adminId: 100, adminName: 'Admin',
            action: SystemLogAction.UPDATE_EQUIPMENT, category: 'equipment',
            targetId: old.id, targetLabel: `TB-${String(old.id).padStart(3, '0')} · ${values.name}`,
            details: {
              equipmentCode: `TB-${String(old.id).padStart(3, '0')}`,
              equipmentName: values.name,
              field: changedFields[0],
              oldValue: changedFields[0] === 'name' ? old.name : (old as any).description ?? '',
              newValue: changedFields[0] === 'name' ? values.name : values.description ?? '',
            },
          });
        }
        message.success('Cập nhật thông tin thiết bị thành công');
      } else {
        await equipmentService.create({
          name: values.name,
          totalQuantity: Number(values.totalQuantity),
          description: values.description,
          categoryId: values.categoryId,
          status: values.status ?? 'active',
          imageUrl: values.imageUrl || null,
        });
        message.success('Thêm thiết bị thành công');
      }
      setFormModal({ open: false }); load(page);
    } catch (e: any) { message.error(e?.message ?? 'Có lỗi xảy ra'); }
    finally { setFormLoading(false); }
  };

  const openStock = (r: Equipment) => { setStockModal({ open: true, record: r }); setAdjustType('import'); stockForm.resetFields(); };

  const handleStockSubmit = async (values: any) => {
    if (!stockModal.record) return;
    setStockLoading(true);
    try {
      await equipmentService.stockAdjustment(stockModal.record.id, {
        type: adjustType,
        quantity: values.quantity ? Number(values.quantity) : undefined,
        note: values.note,
        newTotalQuantity: values.newTotalQuantity ? Number(values.newTotalQuantity) : undefined,
        newAvailableQuantity: values.newAvailableQuantity ? Number(values.newAvailableQuantity) : undefined,
        reason: values.reason,
      });
      const actionMap: Record<string, SystemLogAction> = {
        import: SystemLogAction.STOCK_IMPORT,
        mark_damaged: SystemLogAction.STOCK_MARK_DAMAGED,
        mark_lost: SystemLogAction.STOCK_MARK_LOST,
        adjustment: SystemLogAction.STOCK_ADJUSTMENT,
      };
      const opLabelMap: Record<string, string> = {
        import: 'Nhap them', mark_damaged: 'Ghi nhan hong',
        mark_lost: 'Ghi nhan mat', adjustment: 'Dieu chinh truc tiep',
      };
      const rec = stockModal.record!;
      createSystemLog({
        adminId: 100, adminName: 'Admin',
        action: actionMap[adjustType] ?? SystemLogAction.STOCK_ADJUSTMENT,
        category: 'stock',
        targetId: rec.id, targetLabel: `TB-${String(rec.id).padStart(3, '0')} · ${rec.name}`,
        details: {
          equipmentCode: `TB-${String(rec.id).padStart(3, '0')}`,
          equipmentName: rec.name,
          operationLabel: opLabelMap[adjustType] ?? adjustType,
          quantityChange: values.quantity ? `+${values.quantity}` : '—',
          oldAvailable: String(rec.availableQuantity),
          newAvailable: values.newAvailableQuantity ? String(values.newAvailableQuantity) : '—',
        },
      });
      message.success('Cập nhật kho thành công');
      setStockModal({ open: false }); load(page);
    } catch (e: any) { message.error(e?.message ?? 'Cập nhật kho thất bại'); }
    finally { setStockLoading(false); }
  };

  const openStatus = (r: Equipment) => { setStatusModal({ open: true, record: r }); setNewStatus(''); };

  const handleStatusChange = async () => {
    if (!statusModal.record || !newStatus) return;
    setStatusLoading(true);
    try {
      await equipmentService.changeStatus(statusModal.record.id, newStatus);
      const rec = statusModal.record!;
      createSystemLog({
        adminId: 100, adminName: 'Admin',
        action: SystemLogAction.STOCK_STATUS_CHANGE, category: 'stock',
        targetId: rec.id, targetLabel: `TB-${String(rec.id).padStart(3, '0')} · ${rec.name}`,
        details: {
          equipmentCode: `TB-${String(rec.id).padStart(3, '0')}`,
          equipmentName: rec.name,
          operationLabel: 'Chuyen trang thai',
          oldStatus: rec.status,
          newStatus: newStatus,
        },
      });
      message.success('Chuyển trạng thái thành công');
      setStatusModal({ open: false }); load(page);
    } catch (e: any) { message.error(e?.message ?? 'Chuyển trạng thái thất bại'); }
    finally { setStatusLoading(false); }
  };

  const handleDelete = (r: Equipment) => {
    const hasStock = r.availableQuantity > 0;
    Modal.confirm({
      title: 'Xóa thiết bị',
      icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa <strong>"{r.name}"</strong>?</p>
          {hasStock && (
            <Alert
              type="warning"
              showIcon
              message={`Còn ${r.availableQuantity} thiết bị đang trong kho. Dữ liệu lịch sử mượn trả vẫn được giữ nguyên.`}
              style={{ marginTop: 8 }}
            />
          )}
          <p style={{ color: '#8c8c8c', marginTop: 8, fontSize: 12 }}>
            Xóa mềm — dữ liệu vật lý vẫn còn, thiết bị ẩn khỏi tất cả giao diện.
          </p>
        </div>
      ),
      okText: 'Xác nhận xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await equipmentService.remove(r.id);
          message.success('Đã xóa thiết bị');
          load(page);
        } catch (e: any) { message.error(e?.message ?? 'Xóa thất bại'); }
      },
    });
  };

  const columns: ColumnsType<Equipment> = [
    {
      title: 'Mã thiết bị',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: number) => (
        <span style={idBadgeStyle}>
          EQ-{String(id).padStart(4, '0')}
        </span>
      ),
    },
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 72,
      render: (imageUrl?: string) => (
        <div style={{ width: 48, height: 48, borderRadius: 6, overflow: 'hidden', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e8e8e8' }}>
          {imageUrl ? (
            <img src={imageUrl} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <PictureOutlined style={{ fontSize: 18, color: '#bbb' }} />
          )}
        </div>
      ),
    },
    {
      title: 'Tên thiết bị',
      dataIndex: 'name',
      key: 'name',
      render: (name, r) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{name}</Text>
          {r.description && <><br /><Text type="secondary" style={{ fontSize: 12 }}>{r.description}</Text></>}
        </div>
      ),
    },
    {
      title: 'Loại thiết bị',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (categoryName?: string) => (
        <Tag color="cyan" style={{ borderRadius: 4, fontWeight: 500 }}>
          {categoryName || 'Chung'}
        </Tag>
      ),
    },
    {
      title: 'Số lượng kho',
      key: 'qty',
      width: 180,
      render: (_, r) => {
        const borrowing = r.totalQuantity - r.availableQuantity;
        return (
          <div style={{ fontSize: 12 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <span><Text type="secondary">Tổng:</Text> <Text strong>{r.totalQuantity}</Text></span>
              <span><Text type="secondary">Sẵn sàng:</Text> <Text strong style={{ color: r.availableQuantity > 0 ? '#389e0d' : '#ff4d4f' }}>{r.availableQuantity}</Text></span>
            </div>
            {borrowing > 0 && <div style={{ color: '#722ed1', marginTop: 2 }}>Đang mượn: {borrowing}</div>}
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 140,
      render: (s: string) => {
        const cfg = STATUS_CFG[s] ?? { label: s, color: 'default', badge: 'default' };
        return <Badge status={cfg.badge} text={<Tag color={cfg.color} style={{ margin: 0 }}>{cfg.label}</Tag>} />;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 240,
      render: (_, r) => {
        const canBorrow = r.status === 'active';
        const transitions = TRANSITIONS[r.status] ?? [];
        return (
          <Space size={4} wrap>
            <Tooltip title="Sửa thông tin">
              <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>Sửa</Button>
            </Tooltip>
            <Tooltip title="Cập nhật số lượng kho">
              <Button size="small" icon={<ImportOutlined />} onClick={() => openStock(r)}
                style={{ color: '#1677ff', borderColor: '#1677ff' }}>Kho</Button>
            </Tooltip>
            {transitions.length > 0 && (
              <Tooltip title="Chuyển trạng thái">
                <Button size="small" icon={<SwapOutlined />} onClick={() => openStatus(r)}
                  style={{ color: '#722ed1', borderColor: '#722ed1' }}>Trạng thái</Button>
              </Tooltip>
            )}
            <Tooltip title={canBorrow ? 'Xóa thiết bị' : 'Không thể xóa khi đang mượn'}>
              <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r)}>Xóa</Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24, background: SLINK_COLORS.surface, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <ToolOutlined style={{ fontSize: 22, color: SLINK_COLORS.primary }} />
        <Title level={4} style={{ margin: 0 }}>Quản lý kho thiết bị</Title>
        <Button size="small" icon={<ReloadOutlined />} onClick={() => load(page)} style={{ marginLeft: 'auto' }}>Làm mới</Button>
      </div>

      {error && <Alert type="error" message={error} closable style={{ marginBottom: 16 }} />}

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: SLINK_COLORS.shadow, border: `1px solid ${SLINK_COLORS.border}`, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${SLINK_COLORS.border}`, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <Space wrap>
            <Input placeholder="Tìm thiết bị..." prefix={<SearchOutlined />} value={search}
              onChange={e => setSearch(e.target.value)} style={{ width: 220 }} allowClear />
            <Select allowClear placeholder="Lọc trạng thái" style={{ width: 160 }} onChange={setStatusFilter}
              options={Object.entries(STATUS_CFG).map(([k, v]) => ({ value: k, label: v.label }))} />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}
            style={{ background: SLINK_COLORS.primary }}>Thêm thiết bị</Button>
        </div>

        {loading ? <div style={{ padding: 24 }}><Skeleton active paragraph={{ rows: 8 }} /></div> : (
          <Table<Equipment>
            dataSource={items} columns={columns} rowKey="id"
            pagination={{ current: page, total, pageSize: 15, onChange: load, showTotal: c => `${c} thiết bị`, showSizeChanger: false, style: { padding: '12px 20px' } }}
            size="middle"
            locale={{ emptyText: 'Không có thiết bị nào' }}
          />
        )}
      </div>

      {/* ── Modal: Thêm/Sửa thông tin ─────────────────────── */}
      <Modal
        open={formModal.open}
        title={formModal.record ? `Sửa thông tin — ${formModal.record.name}` : 'Thêm thiết bị mới'}
        okText={formModal.record ? 'Lưu thay đổi' : 'Thêm mới'}
        cancelText="Hủy"
        onOk={() => infoForm.submit()}
        onCancel={() => setFormModal({ open: false })}
        confirmLoading={formLoading}
        destroyOnClose
      >
        <Form form={infoForm} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item name="name" label="Tên thiết bị" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="Ví dụ: Máy chiếu Epson EB-X41" />
          </Form.Item>
          <Form.Item name="categoryId" label="Loại thiết bị" rules={[{ required: true, message: 'Vui lòng chọn loại thiết bị' }]}> 
            <Select
              placeholder="Chọn loại thiết bị"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Space style={{ padding: '0 8px 4px', display: 'flex', width: '100%' }}>
                    <Input
                      placeholder="Tên loại mới..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      style={{ flex: 1 }}
                    />
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={handleAddCategory}
                      loading={addingCategory}
                      style={{ background: SLINK_COLORS.primary }}
                    >
                      Thêm
                    </Button>
                  </Space>
                </>
              )}
            />
          </Form.Item>
          <Form.Item name="totalQuantity" label="Tổng số lượng" rules={[{ required: true, message: 'Nhập số lượng' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" initialValue="active">
            <Select options={[{ value: 'active', label: 'Hoạt động' }, { value: 'under_maintenance', label: 'Bảo trì' }]} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} maxLength={200} showCount />
          </Form.Item>
          <Form.Item
            name="imageUrl"
            label={<span><LinkOutlined style={{ marginRight: 4 }} />Link ảnh thiết bị</span>}
            extra="Dán link ảnh từ internet (Google Images, Wikipedia, ...). Ảnh sẽ hiển thị trên trang danh sách thiết bị."
          >
            <Input
              prefix={<PictureOutlined style={{ color: '#bbb' }} />}
              placeholder="https://example.com/image.jpg"
              allowClear
              onChange={(e) => setImagePreview(e.target.value)}
            />
          </Form.Item>
          {imagePreview && (
            <div style={{
              marginBottom: 16, padding: 10, border: '1px dashed #d9d9d9',
              borderRadius: 8, background: '#fafafa', textAlign: 'center',
            }}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 6 }}>Xem trước ảnh:</Text>
              <img
                src={imagePreview}
                alt="preview"
                style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain', borderRadius: 4 }}
                onError={(e) => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
        </Form>
      </Modal>

      {/* ── Modal: Cập nhật kho ────────────────────────────── */}
      <Modal
        open={stockModal.open}
        title={<Space><ImportOutlined style={{ color: '#1677ff' }} /><span>Cập nhật kho — {stockModal.record?.name}</span></Space>}
        okText="Xác nhận"
        cancelText="Hủy"
        onOk={() => stockForm.submit()}
        onCancel={() => setStockModal({ open: false })}
        confirmLoading={stockLoading}
        destroyOnClose
        width={520}
      >
        {stockModal.record && (
          <>
            <Descriptions size="small" bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Tổng">{stockModal.record.totalQuantity}</Descriptions.Item>
              <Descriptions.Item label="Sẵn sàng">{stockModal.record.availableQuantity}</Descriptions.Item>
              <Descriptions.Item label="Đang mượn">{stockModal.record.totalQuantity - stockModal.record.availableQuantity}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái"><Tag color={STATUS_CFG[stockModal.record.status]?.color}>{STATUS_CFG[stockModal.record.status]?.label}</Tag></Descriptions.Item>
            </Descriptions>

            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Loại điều chỉnh:</Text>
              <Radio.Group value={adjustType} onChange={e => { setAdjustType(e.target.value); stockForm.resetFields(); }} style={{ width: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {ADJUST_TYPES.map(t => (
                    <Radio.Button key={t.value} value={t.value}
                      style={{ height: 'auto', padding: '8px 12px', width: '100%', textAlign: 'left', borderRadius: 6, marginBottom: 4 }}>
                      <Space>
                        <span style={{ color: t.color }}>{t.icon}</span>
                        <span>
                          <Text strong>{t.label}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 11 }}>{t.desc}</Text>
                        </span>
                      </Space>
                    </Radio.Button>
                  ))}
                </Space>
              </Radio.Group>
            </div>

            <Divider />

            <Form form={stockForm} layout="vertical" onFinish={handleStockSubmit}>
              {adjustType !== 'adjustment' ? (
                <>
                  <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, message: 'Nhập số lượng' }]}>
                    <InputNumber min={1} style={{ width: '100%' }}
                      max={adjustType === 'import' ? undefined : stockModal.record.availableQuantity}
                      placeholder={`Tối đa: ${stockModal.record.availableQuantity} (sẵn sàng)`} />
                  </Form.Item>
                  <Form.Item name="note" label="Ghi chú / Nguồn gốc">
                    <TextArea rows={2} maxLength={200} showCount placeholder="Ghi chú lý do, nguồn gốc..." />
                  </Form.Item>
                </>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Form.Item name="newTotalQuantity" label="Tổng số lượng mới" initialValue={stockModal.record.totalQuantity}>
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="newAvailableQuantity" label="Số lượng sẵn sàng mới" initialValue={stockModal.record.availableQuantity}>
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </div>
                  <Form.Item name="reason" label="Lý do điều chỉnh" rules={[{ required: true, message: 'Lý do là bắt buộc' }]}>
                    <TextArea rows={3} maxLength={300} showCount placeholder="Bắt buộc nhập lý do để đảm bảo truy xuất lịch sử..." />
                  </Form.Item>
                </>
              )}
            </Form>
          </>
        )}
      </Modal>

      {/* ── Modal: Chuyển trạng thái ───────────────────────── */}
      <Modal
        open={statusModal.open}
        title={<Space><SwapOutlined style={{ color: '#722ed1' }} /><span>Chuyển trạng thái — {statusModal.record?.name}</span></Space>}
        okText="Xác nhận chuyển"
        okButtonProps={{ disabled: !newStatus, loading: statusLoading }}
        cancelText="Hủy"
        onOk={handleStatusChange}
        onCancel={() => setStatusModal({ open: false })}
        destroyOnClose
        width={480}
      >
        {statusModal.record && (() => {
          const cur = STATUS_CFG[statusModal.record.status];
          const transitions = TRANSITIONS[statusModal.record.status] ?? [];
          return (
            <div>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">Trạng thái hiện tại: </Text>
                <Tag color={cur?.color}>{cur?.label}</Tag>
              </div>

              {transitions.length === 0 ? (
                <Alert type="info" message="Thiết bị đã ở trạng thái cuối, không thể chuyển tiếp." />
              ) : (
                <>
                  <Text strong style={{ display: 'block', marginBottom: 10 }}>Chọn trạng thái mới:</Text>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {transitions.map(t => (
                      <Button key={t.value}
                        block
                        type={newStatus === t.value ? 'primary' : 'default'}
                        danger={t.danger}
                        onClick={() => setNewStatus(t.value)}
                        style={{ textAlign: 'left', height: 'auto', padding: '10px 16px' }}
                      >
                        <div>
                          <Text strong style={{ color: newStatus === t.value ? '#fff' : undefined }}>{t.label}</Text>
                          <br />
                          <Text style={{ fontSize: 11, color: newStatus === t.value ? 'rgba(255,255,255,0.8)' : '#8c8c8c' }}>
                            → <Tag color={STATUS_CFG[t.value]?.color} style={{ margin: 0 }}>{STATUS_CFG[t.value]?.label}</Tag>
                          </Text>
                        </div>
                      </Button>
                    ))}
                  </Space>
                  {newStatus === 'discontinued' && (
                    <Alert type="warning" showIcon style={{ marginTop: 12 }}
                      message="Lưu ý: Không thể ngừng sử dụng nếu còn phiếu mượn đang mở. Hệ thống sẽ kiểm tra và báo lỗi nếu vi phạm." />
                  )}
                </>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
