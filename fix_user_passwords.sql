-- 修复用户密码哈希脚本
-- 此脚本用于修复现有用户的密码哈希，确保所有用户都有正确的密码设置

-- 1. 首先检查现有用户的密码哈希情况
SELECT 
    username, 
    password_hash,
    CASE 
        WHEN password_hash IS NULL THEN '密码为空'
        WHEN password_hash = '' THEN '密码为空字符串'
        WHEN password_hash LIKE 'hashed_password_%' THEN '格式正确但需要验证'
        ELSE '格式异常'
    END as password_status
FROM users;

-- 2. 为密码为空的用户设置默认密码 '123456'
UPDATE users 
SET password_hash = 'hashed_password_' || extract(epoch from now()) || '_123456'
WHERE password_hash IS NULL OR password_hash = '';

-- 3. 为格式不正确的用户重新设置密码哈希
UPDATE users 
SET password_hash = 'hashed_password_' || extract(epoch from now()) || '_123456'
WHERE password_hash NOT LIKE 'hashed_password_%';

-- 4. 验证修复结果
SELECT 
    username, 
    password_hash,
    CASE 
        WHEN password_hash LIKE 'hashed_password_%' THEN '格式正确'
        ELSE '需要进一步修复'
    END as password_status
FROM users;

-- 5. 显示修复统计信息
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN password_hash LIKE 'hashed_password_%' THEN 1 ELSE 0 END) as correct_format,
    SUM(CASE WHEN password_hash NOT LIKE 'hashed_password_%' THEN 1 ELSE 0 END) as needs_fix
FROM users;