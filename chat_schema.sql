-- 聊天功能数据库扩展
-- 基于现有校园快递代领平台数据库

-- 1. 消息表（已存在，添加索引优化）
-- 确保消息表存在，如果不存在则创建
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 聊天会话表（新增）
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- 会话信息
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    unread_count_user1 INTEGER DEFAULT 0,
    unread_count_user2 INTEGER DEFAULT 0,
    
    -- 会话状态
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 在线状态表（新增）
CREATE TABLE IF NOT EXISTS online_status (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 消息附件表（新增）
CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    
    -- 附件信息
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引优化
-- 消息表索引
CREATE INDEX IF NOT EXISTS idx_messages_order_id ON messages(order_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_order_sender ON messages(order_id, sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_order_receiver ON messages(order_id, receiver_id);

-- 聊天会话表索引
CREATE INDEX IF NOT EXISTS idx_chat_sessions_order_id ON chat_sessions(order_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user1_id ON chat_sessions(user1_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user2_id ON chat_sessions(user2_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message_at ON chat_sessions(last_message_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user1_user2 ON chat_sessions(user1_id, user2_id);

-- 在线状态表索引
CREATE INDEX IF NOT EXISTS idx_online_status_is_online ON online_status(is_online);
CREATE INDEX IF NOT EXISTS idx_online_status_last_seen ON online_status(last_seen_at);

-- 消息附件表索引
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);

-- 触发器函数：更新聊天会话的最后消息
CREATE OR REPLACE FUNCTION update_chat_session_on_message()
RETURNS TRIGGER AS $$
BEGIN
    -- 更新或插入聊天会话
    INSERT INTO chat_sessions (order_id, user1_id, user2_id, last_message, last_message_at, unread_count_user1, unread_count_user2, updated_at)
    VALUES (
        NEW.order_id,
        LEAST(NEW.sender_id, NEW.receiver_id),
        GREATEST(NEW.sender_id, NEW.receiver_id),
        NEW.content,
        NEW.created_at,
        CASE WHEN NEW.receiver_id = LEAST(NEW.sender_id, NEW.receiver_id) THEN 1 ELSE 0 END,
        CASE WHEN NEW.receiver_id = GREATEST(NEW.sender_id, NEW.receiver_id) THEN 1 ELSE 0 END,
        NOW()
    )
    ON CONFLICT (order_id, user1_id, user2_id) 
    DO UPDATE SET
        last_message = NEW.content,
        last_message_at = NEW.created_at,
        unread_count_user1 = CASE 
            WHEN NEW.receiver_id = chat_sessions.user1_id THEN chat_sessions.unread_count_user1 + 1
            ELSE chat_sessions.unread_count_user1
        END,
        unread_count_user2 = CASE 
            WHEN NEW.receiver_id = chat_sessions.user2_id THEN chat_sessions.unread_count_user2 + 1
            ELSE chat_sessions.unread_count_user2
        END,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为消息表创建触发器
DROP TRIGGER IF EXISTS trigger_update_chat_session ON messages;
CREATE TRIGGER trigger_update_chat_session
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_session_on_message();

-- 触发器函数：标记消息为已读时更新会话
CREATE OR REPLACE FUNCTION update_chat_session_on_read()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
        UPDATE chat_sessions 
        SET 
            unread_count_user1 = CASE 
                WHEN NEW.receiver_id = user1_id THEN GREATEST(0, unread_count_user1 - 1)
                ELSE unread_count_user1
            END,
            unread_count_user2 = CASE 
                WHEN NEW.receiver_id = user2_id THEN GREATEST(0, unread_count_user2 - 1)
                ELSE unread_count_user2
            END,
            updated_at = NOW()
        WHERE order_id = NEW.order_id 
          AND user1_id = LEAST(NEW.sender_id, NEW.receiver_id)
          AND user2_id = GREATEST(NEW.sender_id, NEW.receiver_id);
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为消息表创建已读状态更新触发器
DROP TRIGGER IF EXISTS trigger_update_chat_session_on_read ON messages;
CREATE TRIGGER trigger_update_chat_session_on_read
    AFTER UPDATE OF is_read ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_session_on_read();

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要更新时间的表创建触发器
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at 
    BEFORE UPDATE ON chat_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_online_status_updated_at ON online_status;
CREATE TRIGGER update_online_status_updated_at 
    BEFORE UPDATE ON online_status 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 视图：聊天会话详情视图
CREATE OR REPLACE VIEW chat_session_details AS
SELECT 
    cs.*,
    u1.nickname as user1_nickname,
    u1.avatar_url as user1_avatar,
    u2.nickname as user2_nickname,
    u2.avatar_url as user2_avatar,
    o.order_number,
    o.title as order_title
FROM chat_sessions cs
LEFT JOIN users u1 ON cs.user1_id = u1.id
LEFT JOIN users u2 ON cs.user2_id = u2.id
LEFT JOIN orders o ON cs.order_id = o.id;

-- 视图：消息详情视图
CREATE OR REPLACE VIEW message_details AS
SELECT 
    m.*,
    s.nickname as sender_nickname,
    s.avatar_url as sender_avatar,
    r.nickname as receiver_nickname,
    r.avatar_url as receiver_avatar,
    o.order_number,
    o.title as order_title
FROM messages m
LEFT JOIN users s ON m.sender_id = s.id
LEFT JOIN users r ON m.receiver_id = r.id
LEFT JOIN orders o ON m.order_id = o.id;

-- 函数：获取用户的所有聊天会话
CREATE OR REPLACE FUNCTION get_user_chat_sessions(user_uuid UUID)
RETURNS TABLE(
    session_id UUID,
    order_id UUID,
    other_user_id UUID,
    other_user_nickname VARCHAR,
    other_user_avatar TEXT,
    last_message TEXT,
    last_message_at TIMESTAMPTZ,
    unread_count INTEGER,
    order_title VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cs.id as session_id,
        cs.order_id,
        CASE 
            WHEN cs.user1_id = user_uuid THEN cs.user2_id
            ELSE cs.user1_id
        END as other_user_id,
        CASE 
            WHEN cs.user1_id = user_uuid THEN u2.nickname
            ELSE u1.nickname
        END as other_user_nickname,
        CASE 
            WHEN cs.user1_id = user_uuid THEN u2.avatar_url
            ELSE u1.avatar_url
        END as other_user_avatar,
        cs.last_message,
        cs.last_message_at,
        CASE 
            WHEN cs.user1_id = user_uuid THEN cs.unread_count_user1
            ELSE cs.unread_count_user2
        END as unread_count,
        o.title as order_title
    FROM chat_sessions cs
    LEFT JOIN users u1 ON cs.user1_id = u1.id
    LEFT JOIN users u2 ON cs.user2_id = u2.id
    LEFT JOIN orders o ON cs.order_id = o.id
    WHERE (cs.user1_id = user_uuid OR cs.user2_id = user_uuid)
      AND cs.is_active = TRUE
    ORDER BY cs.last_message_at DESC;
END;
$$ language 'plpgsql';

-- 函数：获取订单的聊天消息
CREATE OR REPLACE FUNCTION get_order_messages(order_uuid UUID, current_user_id UUID)
RETURNS TABLE(
    message_id UUID,
    sender_id UUID,
    receiver_id UUID,
    content TEXT,
    is_read BOOLEAN,
    message_type VARCHAR,
    created_at TIMESTAMPTZ,
    sender_nickname VARCHAR,
    sender_avatar TEXT
) AS $$
BEGIN
    -- 标记消息为已读
    UPDATE messages 
    SET is_read = TRUE 
    WHERE order_id = order_uuid 
      AND receiver_id = current_user_id 
      AND is_read = FALSE;
    
    -- 返回消息
    RETURN QUERY
    SELECT 
        m.id as message_id,
        m.sender_id,
        m.receiver_id,
        m.content,
        m.is_read,
        m.message_type,
        m.created_at,
        u.nickname as sender_nickname,
        u.avatar_url as sender_avatar
    FROM messages m
    LEFT JOIN users u ON m.sender_id = u.id
    WHERE m.order_id = order_uuid
    ORDER BY m.created_at ASC;
END;
$$ language 'plpgsql';

-- 启用RLS（行级安全）策略（可选，生产环境建议启用）
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE online_status ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- 开发阶段禁用RLS（允许匿名访问）
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE online_status DISABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments DISABLE ROW LEVEL SECURITY;