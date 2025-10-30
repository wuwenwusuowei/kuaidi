-- 调试取件码问题：检查数据库中的订单数据和字段状态

-- 1. 检查字段是否存在
SELECT '1. 检查 pickup_code 字段是否存在' as info;
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'pickup_code';

-- 2. 查看最新的订单数据（包含取件码字段）
SELECT '2. 查看最新的订单数据' as info;
SELECT 
    id,
    title,
    pickup_code,
    status,
    created_at,
    requester_id,
    deliverer_id
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. 检查是否有包含取件码的订单
SELECT '3. 检查是否有包含取件码的订单' as info;
SELECT 
    COUNT(*) as total_orders,
    COUNT(pickup_code) as orders_with_pickup_code,
    COUNT(CASE WHEN pickup_code IS NOT NULL AND pickup_code != '' THEN 1 END) as non_empty_pickup_codes
FROM orders;

-- 4. 查看具体的取件码数据
SELECT '4. 查看具体的取件码数据' as info;
SELECT 
    id,
    title,
    pickup_code,
    LENGTH(pickup_code) as code_length
FROM orders 
WHERE pickup_code IS NOT NULL 
AND pickup_code != ''
ORDER BY created_at DESC 
LIMIT 5;

-- 5. 检查订单表的所有字段（确认字段名是否正确）
SELECT '5. 订单表所有字段结构' as info;
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;