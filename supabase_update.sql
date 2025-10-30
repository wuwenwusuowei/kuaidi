-- 校园快递代领平台 - 数据库更新脚本
-- 只更新订单状态约束，不删除现有数据

-- 1. 先删除原有的状态约束
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- 2. 添加新的状态约束（包含 awaiting_payment）
ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'accepted', 'picking', 'delivering', 'awaiting_payment', 'completed', 'cancelled'));

-- 3. 创建支付相关表（如果不存在）
CREATE TABLE IF NOT EXISTS payments (
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

CREATE TABLE IF NOT EXISTS user_payment_info (
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

-- 4. 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer_id ON payments(payer_id);
CREATE INDEX IF NOT EXISTS idx_payments_payee_id ON payments(payee_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_user_payment_info_user_id ON user_payment_info(user_id);

-- 5. 更新时间触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为支付表创建触发器（如果不存在）
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_payments_updated_at') THEN
        CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_payment_info_updated_at') THEN
        CREATE TRIGGER update_user_payment_info_updated_at BEFORE UPDATE ON user_payment_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;