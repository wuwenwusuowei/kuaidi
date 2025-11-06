-- 校园快递代领平台 Supabase 数据库建表语句
-- 基于 PostgreSQL 语法

-- 1. 用户表（移除角色区分，所有用户都可以发布需求和接单）
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    balance DECIMAL(10,2) DEFAULT 0.00,
    phone VARCHAR(20),
    email VARCHAR(100),
    campus VARCHAR(100),
    credit_score INTEGER DEFAULT 100, -- 信用评分，用于评价系统
    total_orders INTEGER DEFAULT 0, -- 总完成订单数
    avg_rating DECIMAL(3,2) DEFAULT 5.00, -- 平均评分
    status VARCHAR(20) CHECK (status IN ('active', 'suspended')) DEFAULT 'active', -- 用户状态：active-活跃，suspended-已封禁
    suspension_reason TEXT, -- 封禁原因
    suspended_at TIMESTAMPTZ, -- 封禁时间
    last_login TIMESTAMPTZ, -- 最后登录时间
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 快递订单表
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
    deliverer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- 快递信息（新增字段匹配前端）
    title VARCHAR(100) NOT NULL, -- 快递标题
    express_company VARCHAR(100) NOT NULL,
    tracking_number VARCHAR(100) NOT NULL,
    package_description TEXT,
    package_size VARCHAR(20) CHECK (package_size IN ('小件', '中件', '大件')) DEFAULT '小件',
    weight DECIMAL(5,2) DEFAULT 1.00, -- 物品重量（公斤）
    urgent BOOLEAN DEFAULT FALSE, -- 是否加急
    
    -- 取件信息（更新字段匹配前端）
    pickup_location VARCHAR(200) NOT NULL, -- 快递所在位置
    
    -- 送达信息（更新字段匹配前端）
    delivery_location VARCHAR(200) NOT NULL, -- 快递要放在哪里
    delivery_time TIMESTAMPTZ NOT NULL,
    
    -- 联系信息（新增字段匹配前端）
    contact_phone VARCHAR(20) NOT NULL, -- 用户手机号码
    
    -- 取件码信息
    pickup_code VARCHAR(20), -- 取件码，用于接单员取件时验证
    
    -- 费用信息（更新字段匹配前端）
    price DECIMAL(8,2) NOT NULL, -- 用户愿意支付的金额
    
    -- 订单状态
    status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'picking', 'delivering', 'awaiting_payment', 'completed', 'cancelled')) DEFAULT 'pending',
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 订单状态历史表
CREATE TABLE order_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 交易记录表
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    
    -- 交易信息
    type VARCHAR(20) CHECK (type IN ('recharge', 'payment', 'income', 'withdraw')) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    
    -- 交易详情
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'completed',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 用户评价表
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reviewed_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 评价信息
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 消息表（用于订单沟通）
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 支付记录表
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    payer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    payee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 支付信息
    amount DECIMAL(8,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'paid', 'confirmed', 'cancelled')) DEFAULT 'pending',
    payment_method VARCHAR(20) CHECK (payment_method IN ('wechat', 'alipay', 'balance')) DEFAULT 'wechat',
    
    -- 支付详情
    qr_code_url TEXT, -- 微信支付二维码URL
    transaction_id VARCHAR(100), -- 交易ID
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 用户支付信息表
CREATE TABLE user_payment_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 微信支付信息
    wechat_qr_code_url TEXT, -- 微信收款二维码
    wechat_nickname VARCHAR(100), -- 微信昵称
    
    -- 支付宝信息
    alipay_qr_code_url TEXT, -- 支付宝收款二维码
    alipay_account VARCHAR(100), -- 支付宝账号
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引优化
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_orders_requester_id ON orders(requester_id);
CREATE INDEX idx_orders_deliverer_id ON orders(deliverer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_reviews_order_id ON reviews(order_id);
CREATE INDEX idx_messages_order_id ON messages(order_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_payer_id ON payments(payer_id);
CREATE INDEX idx_payments_payee_id ON payments(payee_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_user_payment_info_user_id ON user_payment_info(user_id);

-- 更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要更新时间的表创建触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_payment_info_updated_at BEFORE UPDATE ON user_payment_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入示例数据
INSERT INTO users (username, password_hash, nickname, role, balance, campus) VALUES
('student001', 'hashed_password_123', '小明同学', 'requester', 100.00, '清华大学'),
('deliverer001', 'hashed_password_456', '快递小哥', 'deliverer', 50.00, '清华大学');

-- RLS（行级安全）策略 - 开发阶段禁用RLS
-- 注意：在生产环境中需要启用并仔细配置RLS策略

-- 开发阶段禁用RLS（允许匿名访问）
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- 系统设置表
CREATE TABLE system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- 基本设置
  customer_service_phone VARCHAR(20) NOT NULL DEFAULT '400-123-4567',
  customer_service_email VARCHAR(100) NOT NULL DEFAULT 'service@campus-express.com',
  
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

-- 系统日志表（完整定义）
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action VARCHAR(100) NOT NULL CHECK (action IN ('clear_cache', 'export_data', 'restart_system', 'display_info', 'custom_action')),
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为系统日志表禁用RLS
ALTER TABLE system_logs DISABLE ROW LEVEL SECURITY;

-- 系统维护记录表（可选，如需单独记录维护操作）
CREATE TABLE IF NOT EXISTS system_maintenance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('clear_cache', 'export_data', 'restart_system', 'display_info')),
    triggered_by UUID REFERENCES users(id) ON DELETE SET NULL, -- 触发用户
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    details JSONB, -- 操作详情
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 为系统维护表禁用RLS
ALTER TABLE system_maintenance DISABLE ROW LEVEL SECURITY;