-- ============================================================
-- SEED: equipment_instances
-- Tạo serial numbers cho từng thiết bị theo số lượng total_quantity
-- ============================================================

INSERT INTO equipment_instances (equipment_id, serial_number, condition, created_at, updated_at)
SELECT
  e.id,
  UPPER(REPLACE(REPLACE(e.name, ' ', '-'), '"', '')) || '-' || LPAD(gs.n::TEXT, 3, '0'),
  CASE
    WHEN gs.n <= e.available_quantity THEN 'good'::instance_condition
    WHEN gs.n <= e.total_quantity - 1  THEN 'borrowed'::instance_condition
    ELSE 'good'::instance_condition
  END,
  NOW() - (RANDOM() * 100 || ' days')::INTERVAL,
  NOW()
FROM equipment e
CROSS JOIN LATERAL generate_series(1, e.total_quantity) AS gs(n)
WHERE NOT EXISTS (
  SELECT 1 FROM equipment_instances ei WHERE ei.equipment_id = e.id
);

SELECT setval('equipment_instances_id_seq', (SELECT COALESCE(MAX(id), 1) FROM equipment_instances));
