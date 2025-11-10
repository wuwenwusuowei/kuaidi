-- 修复取消订单功能的数据库问题
-- 1. 先修复 system_logs 表的约束
ALTER TABLE system_logs DROP CONSTRAINT IF EXISTS system_logs_action_check;

-- 2. 添加新的系统日志约束，包含取消订单的操作类型
ALTER TABLE system_logs 
ADD CONSTRAINT system_logs_action_check 
CHECK (action IN (
    'clear_cache', 
    'export_data', 
    'restart_system', 
    'display_info', 
    'custom_action',
    'cancel_order',  -- 新增：取消订单操作
    'create_order',  -- 新增：创建订单操作
    'accept_order',  -- 新增：接单操作
    'update_order'   -- 新增：更新订单操作
));

-- 3. 确保 orders 表的状态约束正确
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'accepted', 'picking', 'delivering', 'awaiting_payment', 'completed', 'cancelled'));

-- 4. 测试：确保可以插入取消订单的日志记录
INSERT INTO system_logs (action, description, status, user_id, metadata) 
VALUES ('cancel_order', '用户取消订单', 'success', null, '{"order_id": "test-order"}');

-- 5. 清理测试数据
DELETE FROM system_logs WHERE action = 'cancel_order' AND description = '用户取消订单';