-- 创建 system_logs 表
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action VARCHAR(100) NOT NULL, -- 操作类型
    description TEXT, -- 操作描述
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- 操作用户（可选）
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL, -- 相关订单（可选）
    ip_address INET, -- 操作IP地址
    user_agent TEXT, -- 用户代理信息
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为 system_logs 表禁用 RLS（开发阶段）
ALTER TABLE system_logs DISABLE ROW LEVEL SECURITY;