-- 聊天消息清理脚本
-- 订单结束后自动清理聊天记录，优化数据库性能

-- 1. 创建清理函数：根据订单状态清理聊天记录
CREATE OR REPLACE FUNCTION cleanup_chat_messages_by_order_status()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    completed_orders CURSOR FOR 
        SELECT id FROM orders 
        WHERE status IN ('completed', 'cancelled', 'failed'); -- 订单完成后立即清理
BEGIN
    -- 清理消息表
    WITH deleted_messages AS (
        DELETE FROM messages 
        WHERE order_id IN (
            SELECT id FROM orders 
            WHERE status IN ('completed', 'cancelled', 'failed')
        )
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted_messages;
    
    -- 清理聊天会话表
    DELETE FROM chat_sessions 
    WHERE order_id IN (
        SELECT id FROM orders 
        WHERE status IN ('completed', 'cancelled', 'failed')
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 2. 创建触发器：订单状态变更时自动清理
CREATE OR REPLACE FUNCTION trigger_cleanup_on_order_completion()
RETURNS TRIGGER AS $$
DECLARE
    deleted_messages INTEGER := 0;
    deleted_sessions INTEGER := 0;
BEGIN
    -- 当订单状态变为完成、取消或失败时
    IF NEW.status IN ('completed', 'cancelled', 'failed') AND 
       OLD.status NOT IN ('completed', 'cancelled', 'failed') THEN
        
        -- 立即清理聊天记录
        WITH deleted_msg AS (
            DELETE FROM messages 
            WHERE order_id = NEW.id
            RETURNING id
        )
        SELECT COUNT(*) INTO deleted_messages FROM deleted_msg;
        
        -- 清理聊天会话
        WITH deleted_sess AS (
            DELETE FROM chat_sessions 
            WHERE order_id = NEW.id
            RETURNING id
        )
        SELECT COUNT(*) INTO deleted_sessions FROM deleted_sess;
        
        -- 记录清理日志
        INSERT INTO system_logs (action, description) VALUES (
            'chat_cleanup_immediate',
            '订单 ' || NEW.id || ' 完成，立即清理了 ' || deleted_messages || ' 条消息和 ' || deleted_sessions || ' 个会话'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_cleanup_chat_on_order_completion ON orders;
CREATE TRIGGER trigger_cleanup_chat_on_order_completion
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_cleanup_on_order_completion();

-- 3. 创建手动清理函数
CREATE OR REPLACE FUNCTION manual_cleanup_chat_messages(
    p_order_id UUID DEFAULT NULL
)
RETURNS TABLE(
    deleted_messages INTEGER,
    deleted_sessions INTEGER
) AS $$
DECLARE
    msg_count INTEGER := 0;
    session_count INTEGER := 0;
BEGIN
    -- 清理指定订单或所有完成订单的聊天记录
    IF p_order_id IS NOT NULL THEN
        -- 清理指定订单
        WITH deleted_msg AS (
            DELETE FROM messages 
            WHERE order_id = p_order_id
            RETURNING id
        )
        SELECT COUNT(*) INTO msg_count FROM deleted_msg;
        
        DELETE FROM chat_sessions 
        WHERE order_id = p_order_id
        RETURNING id INTO session_count;
        
    ELSE
        -- 清理所有已完成订单（立即清理）
        WITH deleted_msg AS (
            DELETE FROM messages 
            WHERE order_id IN (
                SELECT id FROM orders 
                WHERE status IN ('completed', 'cancelled', 'failed')
            )
            RETURNING id
        )
        SELECT COUNT(*) INTO msg_count FROM deleted_msg;
        
        WITH deleted_sess AS (
            DELETE FROM chat_sessions 
            WHERE order_id IN (
                SELECT id FROM orders 
                WHERE status IN ('completed', 'cancelled', 'failed')
            )
            RETURNING id
        )
        SELECT COUNT(*) INTO session_count FROM deleted_sess;
    END IF;
    
    RETURN QUERY SELECT msg_count, session_count;
END;
$$ LANGUAGE plpgsql;

-- 4. 创建定期清理任务（需要配置pg_cron扩展）
-- 注意：这需要先安装pg_cron扩展
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- 
-- -- 每天凌晨2点执行清理任务
-- SELECT cron.schedule(
--     'cleanup-chat-messages',
--     '0 2 * * *',
--     'SELECT cleanup_chat_messages_by_order_status();'
-- );

-- 5. 创建查询函数：查看已完成订单的聊天记录
CREATE OR REPLACE FUNCTION get_completed_order_chats()
RETURNS TABLE(
    order_id UUID,
    order_title VARCHAR,
    order_status VARCHAR,
    order_completed_time TIMESTAMPTZ,
    message_count BIGINT,
    session_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as order_id,
        o.title as order_title,
        o.status as order_status,
        o.updated_at as order_completed_time,
        COUNT(m.id) as message_count,
        COUNT(DISTINCT cs.id) as session_count
    FROM orders o
    LEFT JOIN messages m ON o.id = m.order_id
    LEFT JOIN chat_sessions cs ON o.id = cs.order_id
    WHERE o.status IN ('completed', 'cancelled', 'failed')
    GROUP BY o.id, o.title, o.status, o.updated_at
    ORDER BY o.updated_at ASC;
END;
$$ LANGUAGE plpgsql;

-- 6. 使用示例
-- 查看已完成订单的聊天记录
-- SELECT * FROM get_completed_order_chats();

-- 手动清理指定订单
-- SELECT * FROM manual_cleanup_chat_messages('订单ID');

-- 手动清理所有已完成订单
-- SELECT * FROM manual_cleanup_chat_messages(NULL);

-- 自动清理（返回清理的消息数量）
-- SELECT cleanup_chat_messages_by_order_status();

-- 完成提示
SELECT '聊天记录自动清理功能已配置完成！' as status;
SELECT '配置说明：' as note;
SELECT '- 订单完成后立即自动清理聊天记录' as rule1;
SELECT '- 支持手动清理指定订单' as rule2;
SELECT '- 支持查看已完成订单的聊天记录' as rule3;