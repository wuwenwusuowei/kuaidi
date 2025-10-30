import { supabase } from '../lib/supabase'

export class DatabaseService {
  // 检查数据库连接
  static async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1)
      if (error) {
        console.warn('数据库连接失败:', error.message)
        return false
      }
      console.log('数据库连接成功')
      return true
    } catch (error) {
      console.warn('数据库连接异常:', error)
      return false
    }
  }

  // 初始化示例数据
  static async initializeSampleData(): Promise<void> {
    try {
      // 检查是否已有用户数据
      const { data: existingUsers } = await supabase.from('users').select('id').limit(1)
      
      if (!existingUsers || existingUsers.length === 0) {
        console.log('初始化示例用户数据...')
        
        // 插入示例用户
        const sampleUsers = [
          {
            username: 'user001',
            nickname: '小明同学',
            balance: 100.00,
            campus: '清华大学'
          },
          {
            username: 'user002',
            nickname: '快递达人',
            balance: 250.00,
            campus: '清华大学'
          }
        ]

        for (const user of sampleUsers) {
          await supabase.from('users').insert(user)
        }
        
        console.log('示例用户数据初始化完成')
      }

      // 检查是否已有订单数据
      const { data: existingOrders } = await supabase.from('orders').select('id').limit(1)
      
      if (!existingOrders || existingOrders.length === 0) {
        console.log('初始化示例订单数据...')
        
        // 获取用户ID
        const { data: users } = await supabase.from('users').select('id, username')
        
        if (users && users.length > 0) {
          const sampleOrders = [
            {
              order_number: 'ORD' + Date.now(),
              requester_id: users[0].id,
              title: '顺丰快递代取',
              express_company: '顺丰',
              tracking_number: 'SF123456789',
              package_description: '从东门快递点取一个包裹送到宿舍楼',
              package_size: '小件',
              weight: 1.5,
              urgent: false,
              pickup_location: '学校东门快递点',
              delivery_location: '学生宿舍3号楼',
              delivery_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4小时后
              contact_phone: '13800138000',
              price: 8.00,
              status: 'pending'
            },
            {
              order_number: 'ORD' + (Date.now() + 1),
              requester_id: users[0].id,
              title: '中通快递急件',
              express_company: '中通',
              tracking_number: 'ZT987654321',
              package_description: '急需取件，有重要文件',
              package_size: '小件',
              weight: 0.5,
              urgent: true,
              pickup_location: '学校西门快递柜',
              delivery_location: '教学楼A座',
              delivery_time: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(), // 1.5小时后
              contact_phone: '13800138001',
              price: 12.00,
              status: 'pending'
            }
          ]

          for (const order of sampleOrders) {
            await supabase.from('orders').insert(order)
          }
          
          console.log('示例订单数据初始化完成')
        }
      }
    } catch (error) {
      console.warn('初始化示例数据失败:', error)
    }
  }

  // 初始化数据库
  static async initialize(): Promise<boolean> {
    try {
      const isConnected = await this.checkConnection()
      
      if (isConnected) {
        await this.initializeSampleData()
        return true
      }
      
      return false
    } catch (error) {
      console.warn('数据库初始化失败:', error)
      return false
    }
  }
}