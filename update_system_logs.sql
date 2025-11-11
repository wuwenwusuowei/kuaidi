-- 更新系统日志表以支持管理员操作记录

-- 如果表不存在，创建系统日志表
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action VARCHAR(100) NOT NULL, -- 操作类型
    description TEXT, -- 操作描述
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- 操作用户（可选）
    target_id UUID, -- 目标ID（订单ID、用户ID等）
    ip_address INET, -- 操作IP地址
    user_agent TEXT, -- 用户代理信息
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为系统日志表禁用RLS（开发阶段）
ALTER TABLE system_logs DISABLE ROW LEVEL SECURITY;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_system_logs_action ON system_logs(action);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_target_id ON system_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);

-- 添加一些示例数据用于测试
INSERT INTO system_logs (action, description, user_id, target_id) VALUES
('admin_login', '管理员登录系统', NULL, NULL),
('update_user_status', '管理员修改用户状态', NULL, NULL),
('delete_order', '管理员删除未接单订单', NULL, NULL);