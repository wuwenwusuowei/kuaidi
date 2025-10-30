-- 最终修复聊天功能数据库结构
-- 彻底解决列名歧义问题

-- 1. 删除现有的聊天相关对象
DROP TRIGGER IF EXISTS trigger_update_chat_session ON messages;
DROP FUNCTION IF EXISTS update_chat_session_on_message();
DROP FUNCTION IF EXISTS get_user_chat_sessions(UUID);
DROP FUNCTION IF EXISTS get_order_messages(UUID, UUID);
DROP TABLE IF EXISTS message_attachments CASCADE;
DROP TABLE IF EXISTS online_status CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS messages CASCADE;

-- 2. 重新创建消息表（使用明确的列名）
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 创建聊天会话表
CREATE TABLE chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    unread_count_user1 INTEGER DEFAULT 0,
    unread_count_user2 INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(order_id, user1_id, user2_id)
);

-- 4. 创建在线状态表
CREATE TABLE online_status (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 创建消息附件表
CREATE TABLE message_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 创建索引
CREATE INDEX idx_messages_order_id ON messages(order_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE INDEX idx_chat_sessions_order_id ON chat_sessions(order_id);
CREATE INDEX idx_chat_sessions_user1_id ON chat_sessions(user1_id);
CREATE INDEX idx_chat_sessions_user2_id ON chat_sessions(user2_id);
CREATE INDEX idx_chat_sessions_last_message_at ON chat_sessions(last_message_at);

CREATE INDEX idx_online_status_is_online ON online_status(is_online);
CREATE INDEX idx_online_status_last_seen ON online_status(last_seen_at);

CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id);

-- 7. 彻底修复的触发器函数（使用明确的表别名）
CREATE OR REPLACE FUNCTION update_chat_session_on_message()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO chat_sessions (
        order_id, user1_id, user2_id, 
        last_message, last_message_at, 
        unread_count_user1, unread_count_user2, 
        updated_at
    )
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
            WHEN NEW.receiver_id = EXCLUDED.user1_id THEN chat_sessions.unread_count_user1 + 1
            ELSE chat_sessions.unread_count_user1
        END,
        unread_count_user2 = CASE 
            WHEN NEW.receiver_id = EXCLUDED.user2_id THEN chat_sessions.unread_count_user2 + 1
            ELSE chat_sessions.unread_count_user2
        END,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. 创建触发器
CREATE TRIGGER trigger_update_chat_session
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_session_on_message();

-- 9. 彻底修复的获取订单消息函数（使用明确的表别名）
CREATE OR REPLACE FUNCTION get_order_messages(
    p_order_id UUID, 
    p_current_user_id UUID
)
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
    -- 标记消息为已读（使用明确的表别名）
    UPDATE messages AS msg
    SET is_read = TRUE 
    WHERE msg.order_id = p_order_id 
      AND msg.receiver_id = p_current_user_id 
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
    FROM messages AS msg
    LEFT JOIN users AS usr ON msg.sender_id = usr.id
    WHERE msg.order_id = p_order_id
    ORDER BY msg.created_at ASC;
END;
$$ language 'plpgsql';

-- 10. 简化的获取用户聊天会话函数
CREATE OR REPLACE FUNCTION get_user_chat_sessions(p_user_id UUID)
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
            WHEN cs.user1_id = p_user_id THEN cs.user2_id
            ELSE cs.user1_id
        END as other_user_id,
        CASE 
            WHEN cs.user1_id = p_user_id THEN u2.nickname
            ELSE u1.nickname
        END as other_user_nickname,
        CASE 
            WHEN cs.user1_id = p_user_id THEN u2.avatar_url
            ELSE u1.avatar_url
        END as other_user_avatar,
        cs.last_message,
        cs.last_message_at,
        CASE 
            WHEN cs.user1_id = p_user_id THEN cs.unread_count_user1
            ELSE cs.unread_count_user2
        END as unread_count,
        o.title as order_title
    FROM chat_sessions cs
    LEFT JOIN users u1 ON cs.user1_id = u1.id
    LEFT JOIN users u2 ON cs.user2_id = u2.id
    LEFT JOIN orders o ON cs.order_id = o.id
    WHERE (cs.user1_id = p_user_id OR cs.user2_id = p_user_id)
      AND cs.is_active = TRUE
    ORDER BY cs.last_message_at DESC;
END;
$$ language 'plpgsql';

-- 11. 开发阶段禁用RLS
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE online_status DISABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments DISABLE ROW LEVEL SECURITY;

-- 12. 启用实时复制（Supabase实时功能必需）
-- 为消息表启用实时复制
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 为在线状态表启用实时复制
ALTER PUBLICATION supabase_realtime ADD TABLE online_status;

-- 13. 完成提示
SELECT '聊天功能数据库最终修复完成！' as status;