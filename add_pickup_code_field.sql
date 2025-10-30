-- 为现有订单表添加取件码字段
-- 如果订单表已经存在，使用此语句添加 pickup_code 字段

-- 检查字段是否存在，如果不存在则添加
DO $$
BEGIN
    -- 检查 pickup_code 字段是否已存在
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'pickup_code'
    ) THEN
        -- 添加 pickup_code 字段
        ALTER TABLE orders ADD COLUMN pickup_code VARCHAR(20);
        RAISE NOTICE '已成功添加 pickup_code 字段到 orders 表';
    ELSE
        RAISE NOTICE 'pickup_code 字段已存在，无需添加';
    END IF;
END $$;

-- 验证字段添加结果
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'pickup_code';

-- 显示当前订单表的所有字段
SELECT '当前订单表字段结构：' as info;
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;