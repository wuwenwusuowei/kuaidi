# 聊天功能修复指南

## 问题描述
聊天功能出现了数据库错误：`column reference "receiver_id" is ambiguous`，这是由于数据库函数中的列名歧义导致的。

## 修复步骤

### 1. 执行数据库修复脚本
在Supabase SQL编辑器中执行以下脚本：

```sql
-- 执行修复脚本
\i fix_chat_schema.sql
```

或者直接复制 `fix_chat_schema.sql` 文件中的内容到Supabase SQL编辑器中执行。

### 2. 验证修复
执行测试脚本来验证修复是否成功：

```bash
# 安装依赖（如果需要）
npm install @supabase/supabase-js

# 运行测试
node scripts/test_chat_function.js
```

### 3. 前端代码更新
前端代码已经自动更新，主要更改包括：

- **chatService.ts**: 更新了函数调用参数名
  - `order_uuid` → `p_order_id`
  - `current_user_uuid` → `p_current_user_id`

## 修复内容

### 数据库修复
1. **删除并重新创建**所有聊天相关表
2. **简化函数参数命名**，避免列名歧义
3. **使用明确的表别名**，消除歧义
4. **优化触发器逻辑**，提高稳定性

### 函数参数更新
- `get_order_messages` 函数参数：
  - `order_uuid` → `p_order_id`
  - `current_user_uuid` → `p_current_user_id`

- `get_user_chat_sessions` 函数参数：
  - `user_uuid` → `p_user_id`

## 验证方法

1. **数据库函数测试**：运行测试脚本验证函数调用
2. **前端功能测试**：在订单管理中测试聊天功能
3. **实时通信测试**：打开两个浏览器窗口测试双向通信

## 注意事项

1. **数据丢失**：修复脚本会删除现有聊天数据，请确保这是可接受的
2. **备份建议**：在生产环境执行前建议备份数据
3. **权限检查**：确保数据库用户有足够的权限执行DDL操作

## 故障排除

如果修复后仍然出现问题：

1. 检查Supabase控制台的错误日志
2. 验证数据库函数是否成功创建
3. 检查前端代码中的参数传递是否正确
4. 确认网络连接和Supabase配置

## 完成状态

✅ 数据库修复脚本已创建  
✅ 前端代码参数已更新  
✅ 测试脚本已准备  

执行上述步骤后，聊天功能应该可以正常工作。