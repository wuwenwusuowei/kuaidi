import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'
import { OrderService } from '../services/orderService'
import type { Order as DatabaseOrder } from '../types/database'

export interface Order {
  id: string
  title: string
  description: string
  pickupLocation: string
  deliveryLocation: string
  deliveryTime: string
  price: number
  status: 'pending' | 'accepted' | 'picking' | 'delivering' | 'awaiting_payment' | 'completed' | 'cancelled'
  requesterId: string
  delivererId?: string
  createdAt: string
  updatedAt: string
  contactPhone: string
  expressCompany?: string
  trackingNumber?: string
  weight?: number
  size?: string
  urgent: boolean
  pickupCode?: string
}

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const authStore = useAuthStore()

  // 模拟订单数据（开发阶段备用）
  const mockOrders: Order[] = [
    {
      id: '1',
      title: '顺丰快递代取',
      description: '从东门快递点取一个包裹送到宿舍楼',
      pickupLocation: '学校东门快递点',
      deliveryLocation: '学生宿舍3号楼',
      deliveryTime: '2024-10-24 16:00',
      price: 8.00,
      status: 'pending',
      requesterId: '1',
      createdAt: '2024-10-24 10:00',
      updatedAt: '2024-10-24 10:00',
      contactPhone: '13800138000',
      expressCompany: '顺丰',
      trackingNumber: 'SF123456789',
      weight: 1.5,
      size: '小件',
      urgent: false,
      pickupCode: 'A123'
    },
    {
      id: '2',
      title: '中通快递急件',
      description: '急需取件，有重要文件',
      pickupLocation: '学校西门快递柜',
      deliveryLocation: '教学楼A座',
      deliveryTime: '2024-10-24 15:30',
      price: 12.00,
      status: 'pending',
      requesterId: '1',
      createdAt: '2024-10-24 11:00',
      updatedAt: '2024-10-24 11:00',
      contactPhone: '13800138001',
      expressCompany: '中通',
      trackingNumber: 'ZT987654321',
      weight: 0.5,
      size: '文件',
      urgent: true,
      pickupCode: 'B456'
    }
  ]

  // 初始化订单数据
  orders.value = mockOrders

  // 转换数据库订单到前端订单格式
  const convertDatabaseOrder = (dbOrder: DatabaseOrder): Order => ({
    id: dbOrder.id,
    title: dbOrder.title,
    description: dbOrder.package_description || '',
    pickupLocation: dbOrder.pickup_location,
    deliveryLocation: dbOrder.delivery_location,
    deliveryTime: dbOrder.delivery_time,
    price: dbOrder.price,
    status: dbOrder.status,
    requesterId: dbOrder.requester_id,
    delivererId: dbOrder.deliverer_id,
    createdAt: dbOrder.created_at,
    updatedAt: dbOrder.updated_at,
    contactPhone: dbOrder.contact_phone,
    expressCompany: dbOrder.express_company,
    trackingNumber: dbOrder.tracking_number,
    weight: dbOrder.weight,
    size: dbOrder.package_size,
    urgent: dbOrder.urgent,
    pickupCode: dbOrder.pickup_code || '' // 临时处理，避免字段不存在
  })

  // 转换前端订单到数据库订单格式
  const convertToDatabaseOrder = (order: Omit<Order, 'id' | 'status' | 'requesterId' | 'createdAt' | 'updatedAt'>): Omit<DatabaseOrder, 'id' | 'order_number' | 'created_at' | 'updated_at'> => ({
    requester_id: authStore.user!.id,
    title: order.title,
    express_company: order.expressCompany || '',
    tracking_number: order.trackingNumber || '',
    package_description: order.description,
    package_size: order.size as '小件' | '中件' | '大件',
    weight: order.weight || 1,
    urgent: order.urgent,
    pickup_location: order.pickupLocation,
    delivery_location: order.deliveryLocation,
    delivery_time: order.deliveryTime,
    contact_phone: order.contactPhone,
    pickup_code: order.pickupCode || '', // 确保字段名正确映射
    price: order.price,
    status: 'pending'
  })
  
  // console.log('转换后的数据库订单数据:', JSON.stringify(convertToDatabaseOrder, null, 2))

  // 创建订单
  const createOrder = async (orderData: Omit<Order, 'id' | 'status' | 'requesterId' | 'createdAt' | 'updatedAt'>) => {
    if (!authStore.user) {
      throw new Error('请先登录')
    }

    try {
      const dbOrderData = convertToDatabaseOrder(orderData)
      const result = await OrderService.createOrder(dbOrderData)
      
      if (result.success && result.data) {
        const newOrder = convertDatabaseOrder(result.data)
        orders.value.unshift(newOrder)
        return newOrder
      } else {
        throw new Error(result.error || '创建订单失败')
      }
    } catch (error: any) {
      console.warn('数据库创建订单失败，使用模拟数据:', error.message)
      // 回退到模拟数据
      const newOrder: Order = {
        ...orderData,
        id: Date.now().toString(),
        status: 'pending',
        requesterId: authStore.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      orders.value.unshift(newOrder)
      return newOrder
    }
  }

  // 获取所有订单
  const getAllOrders = async () => {
    try {
      const result = await OrderService.getAllOrders()
      if (result.success && result.data) {
        orders.value = result.data.map(convertDatabaseOrder)
      }
    } catch (error) {
      console.warn('获取订单失败，使用模拟数据:', error)
    }
    return orders.value
  }

  // 获取待接单的订单（带重试机制）
  const getPendingOrders = async () => {
    const maxRetries = 2
    const retryDelay = 1000
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await OrderService.getPendingOrders()
        if (result.success && result.data) {
          return result.data.map(convertDatabaseOrder)
        }
        
        // 如果是最后一次尝试，返回空数组
        if (attempt === maxRetries) {
          console.warn('获取待接单订单失败，使用空数据')
          return []
        }
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
      } catch (error) {
        console.error(`获取待接单订单失败 (尝试 ${attempt}/${maxRetries}):`, error)
        
        if (attempt === maxRetries) {
          console.warn('获取待接单订单失败，使用模拟数据')
          return mockOrders.filter(order => order.status === 'pending')
        }
        
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
      }
    }
    
    return []
  }

  // 获取用户发布的订单
  const getUserOrders = async () => {
    if (!authStore.user) return []
    
    try {
      const result = await OrderService.getUserOrders(authStore.user.id)
      if (result.success && result.data) {
        return result.data.map(convertDatabaseOrder)
      }
    } catch (error) {
      console.warn('获取用户订单失败，使用模拟数据:', error)
    }
    return orders.value.filter(order => order.requesterId === authStore.user!.id)
  }

  // 获取代领员接单的订单
  const getDelivererOrders = async () => {
    if (!authStore.user) return []
    
    try {
      const result = await OrderService.getDelivererOrders(authStore.user.id)
      if (result.success && result.data) {
        return result.data.map(convertDatabaseOrder)
      }
    } catch (error) {
      console.warn('获取代领订单失败，使用模拟数据:', error)
    }
    return orders.value.filter(order => order.delivererId === authStore.user!.id)
  }

  // 接单
  const acceptOrder = async (orderId: string) => {
    if (!authStore.user) {
      throw new Error('请先登录')
    }

    try {
      const result = await OrderService.acceptOrder(orderId, authStore.user.id)
      if (result.success && result.data) {
        const updatedOrder = convertDatabaseOrder(result.data)
        // 更新本地订单列表
        const index = orders.value.findIndex(o => o.id === orderId)
        if (index !== -1) {
          orders.value[index] = updatedOrder
        }
        return updatedOrder
      } else {
        throw new Error(result.error || '接单失败')
      }
    } catch (error: any) {
      console.warn('数据库接单失败，使用模拟数据:', error.message)
      // 回退到模拟数据
      const order = orders.value.find(o => o.id === orderId)
      if (!order) {
        throw new Error('订单不存在')
      }
      if (order.status !== 'pending') {
        throw new Error('订单已被接单')
      }
      order.status = 'accepted'
      order.delivererId = authStore.user.id
      order.updatedAt = new Date().toISOString()
      return order
    }
  }

  // 更新订单状态
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const result = await OrderService.updateOrderStatus(orderId, status)
      if (result.success && result.data) {
        const updatedOrder = convertDatabaseOrder(result.data)
        // 更新本地订单列表
        const index = orders.value.findIndex(o => o.id === orderId)
        if (index !== -1) {
          orders.value[index] = updatedOrder
        }
        return updatedOrder
      } else {
        throw new Error(result.error || '更新订单状态失败')
      }
    } catch (error: any) {
      console.warn('数据库更新订单状态失败，使用模拟数据:', error.message)
      // 回退到模拟数据
      const order = orders.value.find(o => o.id === orderId)
      if (!order) {
        throw new Error('订单不存在')
      }
      order.status = status
      order.updatedAt = new Date().toISOString()
      return order
    }
  }

  // 取消订单
  const cancelOrder = async (orderId: string) => {
    try {
      const result = await OrderService.updateOrderStatus(orderId, 'cancelled')
      if (result.success && result.data) {
        const updatedOrder = convertDatabaseOrder(result.data)
        // 更新本地订单列表
        const index = orders.value.findIndex(o => o.id === orderId)
        if (index !== -1) {
          orders.value[index] = updatedOrder
        }
        return updatedOrder
      } else {
        throw new Error(result.error || '取消订单失败')
      }
    } catch (error: any) {
      console.warn('数据库取消订单失败，使用模拟数据:', error.message)
      // 回退到模拟数据
      const order = orders.value.find(o => o.id === orderId)
      if (!order) {
        throw new Error('订单不存在')
      }
      if (order.status === 'completed' || order.status === 'cancelled') {
        throw new Error('订单无法取消')
      }
      order.status = 'cancelled'
      order.updatedAt = new Date().toISOString()
      return order
    }
  }

  // 根据ID获取订单
  const getOrderById = async (orderId: string) => {
    try {
      const result = await OrderService.getOrderById(orderId)
      if (result.success && result.data) {
        return convertDatabaseOrder(result.data)
      }
    } catch (error) {
      console.warn('获取订单详情失败，使用模拟数据:', error)
    }
    return orders.value.find(order => order.id === orderId)
  }

  return {
    orders,
    createOrder,
    getAllOrders,
    getPendingOrders,
    getUserOrders,
    getDelivererOrders,
    acceptOrder,
    updateOrderStatus,
    cancelOrder,
    getOrderById
  }
})