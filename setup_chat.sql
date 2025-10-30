-- 聊天功能数据库设置脚本
-- 请将此脚本在Supabase SQL编辑器中执行

-- 1. 消息表
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

-- 2. 聊天会话表
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

-- 3. 在线状态表
CREATE TABLE IF NOT EXISTS online_status (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 消息附件表
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

-- 聊天会话表索引
CREATE INDEX IF NOT EXISTS idx_chat_sessions_order_id ON chat_sessions(order_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user1_id ON chat_sessions(user1_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user2_id ON chat_sessions(user2_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message_at ON chat_sessions(last_message_at);

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

-- 函数：获取订单的聊天消息（修复版）
CREATE OR REPLACE FUNCTION get_order_messages(order_uuid UUID, current_user_uuid UUID)
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
DECLARE
    target_order_id UUID := order_uuid;
    target_user_id UUID := current_user_uuid;
BEGIN
    -- 标记消息为已读（使用明确的表别名）
    UPDATE messages msg
    SET is_read = TRUE 
    WHERE msg.order_id = target_order_id 
      AND msg.receiver_id = target_user_id 
      AND msg.is_read = FALSE;
    
    -- 返回消息（使用明确的表别名）
    RETURN QUERY
    SELECT 
        msg.id as message_id,
        msg.sender_id,
        msg.receiver_id,
        msg.content,
        msg.is_read,
        msg.message_type,
        msg.created_at,
        usr.nickname as sender_nickname,
        usr.avatar_url as sender_avatar
    FROM messages msg
    LEFT JOIN users usr ON msg.sender_id = usr.id
    WHERE msg.order_id = target_order_id
    ORDER BY msg.created_at ASC;
END;
$$ language 'plpgsql';

-- 开发阶段禁用RLS（允许匿名访问）
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE online_status DISABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments DISABLE ROW LEVEL SECURITY;

-- 完成提示
SELECT '聊天功能数据库设置完成！' as status;