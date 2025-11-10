-- 自动取消订单功能实现
-- 1. 创建自动取消订单的函数
CREATE OR REPLACE FUNCTION auto_cancel_expired_orders()
RETURNS void AS $$
DECLARE
    cancel_minutes INTEGER;
    cancelled_count INTEGER := 0;
    affected_orders RECORD;
BEGIN
    -- 获取系统设置中的自动取消时间
    SELECT order_auto_cancel_minutes INTO cancel_minutes 
    FROM system_settings 
    LIMIT 1;
    
    -- 如果没有设置或值为0，则不执行取消
    IF cancel_minutes IS NULL OR cancel_minutes <= 0 THEN
        RETURN;
    END IF;
    
    -- 查找需要取消的订单（待接单且创建时间超过指定分钟）
    FOR affected_orders IN
        SELECT o.id, o.title, o.created_at, o.requester_id
        FROM orders o
        WHERE o.status = 'pending'
        AND o.created_at < (NOW() - (cancel_minutes || ' minutes')::interval)
    LOOP
        -- 更新订单状态为已取消
        UPDATE orders 
        SET status = 'cancelled', 
            cancelled_at = NOW(),
            updated_at = NOW()
        WHERE id = affected_orders.id;
        
        -- 记录系统日志
        INSERT INTO system_logs (
            action, 
            description, 
            status, 
            user_id, 
            order_id,
            metadata
        ) VALUES (
            'auto_cancel_order',
            '系统自动取消超时订单：' || affected_orders.title,
            'success',
            affected_orders.requester_id,
            affected_orders.id,
            json_build_object(
                'reason', '订单超时自动取消',
                'created_at', affected_orders.created_at,
                'cancel_minutes', cancel_minutes
            )
        );
        
        cancelled_count := cancelled_count + 1;
    END LOOP;
    
    -- 如果有取消的订单，记录总日志
    IF cancelled_count > 0 THEN
        INSERT INTO system_logs (
            action, 
            description, 
            status, 
            metadata
        ) VALUES (
            'auto_cancel_batch',
            '批量自动取消超时订单完成',
            'success',
            json_build_object('cancelled_count', cancelled_count)
        );
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        -- 记录错误日志
        INSERT INTO system_logs (
            action, 
            description, 
            status, 
            metadata
        ) VALUES (
            'auto_cancel_error',
            '自动取消订单过程中发生错误',
            'failed',
            json_build_object('error', SQLERRM)
        );
        RAISE;
END;
$$ LANGUAGE plpgsql;

-- 2. 更新系统日志约束，添加新的操作类型
ALTER TABLE system_logs DROP CONSTRAINT IF EXISTS system_logs_action_check;

ALTER TABLE system_logs 
ADD CONSTRAINT system_logs_action_check 
CHECK (action IN (
    'clear_cache', 
    'export_data', 
    'restart_system', 
    'display_info', 
    'custom_action',
    'cancel_order',     -- 手动取消订单
    'create_order',     -- 创建订单
    'accept_order',     -- 接单
    'update_order',     -- 更新订单状态
    'update_user_status', -- 更新用户状态
    'chat_cleanup_immediate', -- 聊天清理
    'auto_cancel_order',    -- 自动取消订单
    'auto_cancel_batch',    -- 批量自动取消
    'auto_cancel_error'     -- 自动取消错误
));

-- 3. 创建定时任务（需要pg_cron扩展）
-- 注意：需要先安装pg_cron扩展
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 每5分钟执行一次自动取消任务
-- SELECT cron.schedule('auto-cancel-orders', '*/5 * * * *', 'SELECT auto_cancel_expired_orders();');

-- 4. 测试函数
SELECT auto_cancel_expired_orders();

-- 5. 查看系统日志中的自动取消记录
SELECT * FROM system_logs WHERE action LIKE 'auto_cancel%' ORDER BY created_at DESC LIMIT 5;