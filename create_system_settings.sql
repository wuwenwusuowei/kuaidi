-- 创建系统设置表
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- 基本设置
  customer_service_phone VARCHAR(20) NOT NULL DEFAULT '400-123-4567',
  customer_service_email VARCHAR(100) NOT NULL DEFAULT 'service@campus-express.com',
  platform_name VARCHAR(100) NOT NULL DEFAULT '校园快递代领平台',
  platform_description TEXT DEFAULT '专业的校园快递代领服务平台',
  
  -- 订单设置
  order_auto_cancel_minutes INTEGER NOT NULL DEFAULT 30, -- 自动取消时间（分钟）
  order_auto_complete_minutes INTEGER NOT NULL DEFAULT 120, -- 自动完成时间（分钟）
  max_order_amount DECIMAL(10,2) NOT NULL DEFAULT 50.00, -- 最大订单金额
  
  -- 系统日志设置
  log_retention_days INTEGER NOT NULL DEFAULT 30, -- 日志保留天数
  enable_operation_log BOOLEAN NOT NULL DEFAULT true, -- 启用操作日志
  enable_error_log BOOLEAN NOT NULL DEFAULT true, -- 启用错误日志
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为系统设置表添加更新时间触发器
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON system_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入默认设置（如果表是空的）
INSERT INTO system_settings (customer_service_phone, customer_service_email)
SELECT '400-123-4567', 'service@campus-express.com'
WHERE NOT EXISTS (SELECT 1 FROM system_settings);

-- 为系统设置表禁用RLS
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;