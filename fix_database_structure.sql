-- 紧急修复数据库表结构问题
-- 这个脚本将检查和修复 orders 表的结构问题

-- 1. 首先检查 orders 表是否存在
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
        RAISE EXCEPTION 'orders 表不存在，需要重新创建数据库表结构';
    ELSE
        RAISE NOTICE 'orders 表存在，继续检查字段结构';
    END IF;
END $$;

-- 2. 检查 orders 表的关键字段是否存在
SELECT '检查 orders 表字段结构：' as info;

SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- 3. 检查关键字段是否存在，如果不存在则添加
DO $$
BEGIN
    -- 检查 requester_id 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'requester_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN requester_id UUID;
        RAISE NOTICE '已添加 requester_id 字段';
    END IF;
    
    -- 检查 deliverer_id 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'deliverer_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN deliverer_id UUID;
        RAISE NOTICE '已添加 deliverer_id 字段';
    END IF;
    
    -- 检查 status 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'status'
    ) THEN
        ALTER TABLE orders ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
        RAISE NOTICE '已添加 status 字段';
    END IF;
    
    -- 检查 created_at 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE orders ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE '已添加 created_at 字段';
    END IF;
    
    -- 检查 pickup_code 字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'pickup_code'
    ) THEN
        ALTER TABLE orders ADD COLUMN pickup_code VARCHAR(20);
        RAISE NOTICE '已添加 pickup_code 字段';
    END IF;
    
    RAISE NOTICE '字段检查完成';
END $$;

-- 4. 验证修复结果
SELECT '修复后的 orders 表字段结构：' as info;

SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- 5. 检查是否有数据可以测试查询
SELECT '测试查询：获取订单数量' as info;
SELECT COUNT(*) as total_orders FROM orders;

SELECT '测试查询：获取待接单订单' as info;
SELECT COUNT(*) as pending_orders FROM orders WHERE status = 'pending';

SELECT '数据库修复完成！请刷新前端页面测试。' as final_status;