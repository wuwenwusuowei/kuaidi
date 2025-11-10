#!/usr/bin/env python3
"""
超时自动取消订单功能测试脚本
通过直接调用Supabase API来测试自动取消功能
"""

import os
import requests
import json
from datetime import datetime, timedelta

# Supabase配置（需要从环境变量获取）
SUPABASE_URL = ""  # 需要设置
SUPABASE_ANON_KEY = ""  # 需要设置

def load_env_config():
    """从.env文件加载配置"""
    try:
        with open('d:/kuaidi2/.env', 'r') as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    if key == 'VITE_SUPABASE_URL':
                        global SUPABASE_URL
                        SUPABASE_URL = value
                    elif key == 'VITE_SUPABASE_ANON_KEY':
                        global SUPABASE_ANON_KEY
                        SUPABASE_ANON_KEY = value
    except FileNotFoundError:
        print("未找到.env文件，请手动设置Supabase配置")

def make_supabase_request(endpoint, method='GET', data=None):
    """向Supabase API发送请求"""
    url = f"{SUPABASE_URL}/rest/v1{endpoint}"
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers)
        elif method == 'POST':
            response = requests.post(url, headers=headers, json=data)
        elif method == 'PATCH':
            response = requests.patch(url, headers=headers, json=data)
        elif method == 'DELETE':
            response = requests.delete(url, headers=headers)
        else:
            return {'error': f'不支持的HTTP方法: {method}'}
            
        return response.json() if response.content else {'status': response.status_code}
    except Exception as e:
        return {'error': str(e)}

def test_auto_cancel_function():
    """测试自动取消功能"""
    print("=== 超时自动取消订单功能测试 ===\n")
    
    # 1. 检查配置
    print("1. 检查Supabase配置...")
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        print("❌ Supabase配置未设置")
        print("请先设置环境变量:")
        print("- VITE_SUPABASE_URL: Supabase项目URL")
        print("- VITE_SUPABASE_ANON_KEY: Supabase匿名密钥")
        return
    print("✅ 配置检查通过\n")
    
    # 2. 测试数据库连接
    print("2. 测试数据库连接...")
    test_result = make_supabase_request('/system_settings?limit=1')
    if 'error' in test_result:
        print(f"❌ 数据库连接失败: {test_result['error']}")
        return
    print("✅ 数据库连接成功\n")
    
    # 3. 获取系统设置
    print("3. 获取自动取消设置...")
    settings = make_supabase_request('/system_settings?limit=1')
    if isinstance(settings, list) and settings:
        cancel_minutes = settings[0].get('order_auto_cancel_minutes', 30)
        print(f"✅ 自动取消时间: {cancel_minutes} 分钟\n")
    else:
        print("❌ 无法获取系统设置")
        return
    
    # 4. 检查待自动取消的订单
    print("4. 检查待自动取消的订单...")
    # 计算超时时间点
    timeout_threshold = (datetime.now() - timedelta(minutes=cancel_minutes)).isoformat()
    
    pending_orders = make_supabase_request(
        f"/orders?status=eq.pending&created_at=lt.{timeout_threshold}&select=*"
    )
    
    if isinstance(pending_orders, list):
        print(f"✅ 找到 {len(pending_orders)} 个待自动取消的订单\n")
        if pending_orders:
            for i, order in enumerate(pending_orders[:5]):  # 只显示前5个
                created_time = order['created_at'][:19].replace('T', ' ')
                print(f"   {i+1}. {order.get('title', '未知标题')} - 创建于: {created_time}")
            if len(pending_orders) > 5:
                print(f"   ... 还有 {len(pending_orders) - 5} 个订单")
        print()
    else:
        print("❌ 无法获取待取消订单列表")
        return
    
    # 5. 手动执行自动取消函数
    print("5. 执行自动取消函数...")
    # 通过RPC调用自动取消函数
    rpc_data = {
        "function_name": "auto_cancel_expired_orders"
    }
    
    cancel_result = make_supabase_request('/rpc/auto_cancel_expired_orders', 'POST', {})
    
    if 'error' in cancel_result:
        print(f"❌ 自动取消执行失败: {cancel_result['error']}")
    else:
        print("✅ 自动取消函数调用成功\n")
    
    # 6. 检查系统日志
    print("6. 检查自动取消日志...")
    auto_cancel_logs = make_supabase_request(
        "/system_logs?action=like.auto_cancel%&order=created_at.desc&limit=10"
    )
    
    if isinstance(auto_cancel_logs, list):
        print(f"✅ 找到 {len(auto_cancel_logs)} 条自动取消相关日志\n")
        if auto_cancel_logs:
            for i, log in enumerate(auto_cancel_logs[:5]):  # 只显示前5条
                log_time = log['created_at'][:19].replace('T', ' ')
                print(f"   {i+1}. [{log_time}] {log['action']}: {log['description']}")
                if log.get('metadata') and 'cancelled_count' in log['metadata']:
                    print(f"      取消数量: {log['metadata']['cancelled_count']}")
        print()
    
    # 7. 验证订单状态变化
    print("7. 验证订单状态...")
    if pending_orders:
        # 检查订单是否被取消
        for order in pending_orders[:3]:  # 检查前3个订单
            order_detail = make_supabase_request(f"/orders?id=eq.{order['id']}&select=status")
            if isinstance(order_detail, list) and order_detail:
                status = order_detail[0]['status']
                print(f"   订单 {order['id']}: {order.get('title', '未知标题')} - 状态: {status}")
                if status == 'cancelled':
                    print("   ✅ 订单已自动取消")
                else:
                    print("   ⚠️  订单未被取消")
        print()
    
    print("=== 测试完成 ===")

if __name__ == "__main__":
    # 尝试加载环境配置
    load_env_config()
    
    # 如果配置未设置，提示用户
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        print("请先设置Supabase配置:")
        print("1. 检查d:/kuaidi2/.env文件")
        print("2. 或手动设置环境变量")
        print("\n示例.env内容:")
        print("VITE_SUPABASE_URL=https://your-project.supabase.co")
        print("VITE_SUPABASE_ANON_KEY=your-anon-key-here")
    else:
        test_auto_cancel_function()