-- 校园快递代领平台数据库增量迁移脚本
-- 检查并更新现有表结构，避免重复创建

-- 1. 检查并创建用户表（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            nickname VARCHAR(50) NOT NULL,
            avatar_url TEXT,
            balance DECIMAL(10,2) DEFAULT 0.00,
            phone VARCHAR(20),
            email VARCHAR(100),
            campus VARCHAR(100),
            credit_score INTEGER DEFAULT 100,
            total_orders INTEGER DEFAULT 0,
            avg_rating DECIMAL(3,2) DEFAULT 5.00,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- 插入示例数据
        INSERT INTO users (username, password_hash, nickname, balance, campus, credit_score, total_orders, avg_rating) VALUES
        ('user001', 'hashed_password_123', '小明同学', 100.00, '清华大学', 95, 15, 4.8),
        ('user002', 'hashed_password_456', '快递达人', 250.00, '清华大学', 98, 32, 4.9);
        
        RAISE NOTICE '用户表创建完成';
    ELSE
        RAISE NOTICE '用户表已存在，跳过创建';
    END IF;
END $$;

-- 2. 检查并创建订单表（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
        CREATE TABLE orders (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            order_number VARCHAR(20) UNIQUE NOT NULL,
            requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
            deliverer_id UUID REFERENCES users(id) ON DELETE SET NULL,
            
            -- 快递信息
            title VARCHAR(100) NOT NULL,
            express_company VARCHAR(100) NOT NULL,
            tracking_number VARCHAR(100) NOT NULL,
            package_description TEXT,
            package_size VARCHAR(20) CHECK (package_size IN ('小件', '中件', '大件')) DEFAULT '小件',
            weight DECIMAL(5,2) DEFAULT 1.00,
            urgent BOOLEAN DEFAULT FALSE,
            
            -- 取件信息
            pickup_location VARCHAR(200) NOT NULL,
            pickup_time TIMESTAMPTZ, -- 取件时间（可选）
            
            -- 送达信息
            delivery_location VARCHAR(200) NOT NULL,
            delivery_time TIMESTAMPTZ NOT NULL,
            
            -- 联系信息
            contact_phone VARCHAR(20) NOT NULL,
            
            -- 取件码信息
            pickup_code VARCHAR(20),
            
            -- 费用信息
            price DECIMAL(8,2) NOT NULL,
            
            -- 订单状态
            status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'picking', 'delivering', 'completed', 'cancelled')) DEFAULT 'pending',
            
            -- 时间戳
            created_at TIMESTAMPTZ DEFAULT NOW(),
            accepted_at TIMESTAMPTZ,
            picked_up_at TIMESTAMPTZ,
            delivered_at TIMESTAMPTZ,
            cancelled_at TIMESTAMPTZ,
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        RAISE NOTICE '订单表创建完成';
    ELSE
        RAISE NOTICE '订单表已存在，跳过创建';
    END IF;
END $$;

-- 3. 检查并创建其他相关表
DO $$
BEGIN
    -- 订单状态历史表
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_status_history') THEN
        CREATE TABLE order_status_history (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
            status VARCHAR(20) NOT NULL,
            description TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE '订单状态历史表创建完成';
    ELSE
        RAISE NOTICE '订单状态历史表已存在，跳过创建';
    END IF;
    
    -- 交易记录表
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions') THEN
        CREATE TABLE transactions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
            type VARCHAR(20) CHECK (type IN ('recharge', 'payment', 'income', 'withdraw')) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            balance_after DECIMAL(10,2) NOT NULL,
            description TEXT,
            status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'completed',
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE '交易记录表创建完成';
    ELSE
        RAISE NOTICE '交易记录表已存在，跳过创建';
    END IF;
    
    -- 用户评价表
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reviews') THEN
        CREATE TABLE reviews (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
            reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
            reviewed_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
            comment TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE '用户评价表创建完成';
    ELSE
        RAISE NOTICE '用户评价表已存在，跳过创建';
    END IF;
    
    -- 消息表
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
        CREATE TABLE messages (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
            sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
            receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE '消息表创建完成';
    ELSE
        RAISE NOTICE '消息表已存在，跳过创建';
    END IF;
END $$;

-- 4. 创建索引（如果不存在）
DO $$
BEGIN
    -- 用户表索引
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_users_username') THEN
        CREATE INDEX idx_users_username ON users(username);
        RAISE NOTICE '用户表用户名索引创建完成';
    ELSE
        RAISE NOTICE '用户表用户名索引已存在，跳过创建';
    END IF;
    
    -- 订单表索引
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_orders_requester_id') THEN
        CREATE INDEX idx_orders_requester_id ON orders(requester_id);
        RAISE NOTICE '订单表请求者索引创建完成';
    ELSE
        RAISE NOTICE '订单表请求者索引已存在，跳过创建';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_orders_deliverer_id') THEN
        CREATE INDEX idx_orders_deliverer_id ON orders(deliverer_id);
        RAISE NOTICE '订单表配送者索引创建完成';
    ELSE
        RAISE NOTICE '订单表配送者索引已存在，跳过创建';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_orders_status') THEN
        CREATE INDEX idx_orders_status ON orders(status);
        RAISE NOTICE '订单表状态索引创建完成';
    ELSE
        RAISE NOTICE '订单表状态索引已存在，跳过创建';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_orders_created_at') THEN
        CREATE INDEX idx_orders_created_at ON orders(created_at);
        RAISE NOTICE '订单表创建时间索引创建完成';
    ELSE
        RAISE NOTICE '订单表创建时间索引已存在，跳过创建';
    END IF;
END $$;

-- 5. 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. 为需要更新时间的表创建触发器（如果不存在）
DO $$
BEGIN
    -- 用户表触发器
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE '用户表更新时间触发器创建完成';
    ELSE
        RAISE NOTICE '用户表更新时间触发器已存在，跳过创建';
    END IF;
    
    -- 订单表触发器
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
        CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE '订单表更新时间触发器创建完成';
    ELSE
        RAISE NOTICE '订单表更新时间触发器已存在，跳过创建';
    END IF;
    
    -- 评价表触发器
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_reviews_updated_at') THEN
        CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE '评价表更新时间触发器创建完成';
    ELSE
        RAISE NOTICE '评价表更新时间触发器已存在，跳过创建';
    END IF;
END $$;

-- 7. 开发阶段禁用RLS（允许匿名访问）
DO $$
BEGIN
    -- 检查RLS状态并禁用
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'users' AND rowsecurity = true) THEN
        ALTER TABLE users DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '用户表RLS已禁用';
    ELSE
        RAISE NOTICE '用户表RLS已禁用或未启用';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'orders' AND rowsecurity = true) THEN
        ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '订单表RLS已禁用';
    ELSE
        RAISE NOTICE '订单表RLS已禁用或未启用';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'transactions' AND rowsecurity = true) THEN
        ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '交易表RLS已禁用';
    ELSE
        RAISE NOTICE '交易表RLS已禁用或未启用';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'reviews' AND rowsecurity = true) THEN
        ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '评价表RLS已禁用';
    ELSE
        RAISE NOTICE '评价表RLS已禁用或未启用';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'messages' AND rowsecurity = true) THEN
        ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '消息表RLS已禁用';
    ELSE
        RAISE NOTICE '消息表RLS已禁用或未启用';
    END IF;
END $$;

-- 8. 迁移完成提示
SELECT '数据库增量迁移完成！所有表结构已检查并更新。' as migration_status;