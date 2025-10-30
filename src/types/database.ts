// 数据库类型定义
export interface User {
  id: string
  username: string
  nickname: string
  avatar_url?: string
  balance: number
  phone?: string
  email?: string
  campus?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  requester_id: string
  deliverer_id?: string
  
  // 快递信息（更新字段匹配前端）
  title: string
  express_company: string
  tracking_number: string
  package_description?: string
  package_size: '小件' | '中件' | '大件'
  weight?: number
  urgent: boolean
  
  // 取件信息（更新字段匹配前端）
  pickup_location: string
  
  // 送达信息（更新字段匹配前端）
  delivery_location: string
  delivery_time: string
  
  // 联系信息（新增字段匹配前端）
  contact_phone: string
  
  // 取件码信息
  pickup_code?: string
  
  // 费用信息（更新字段匹配前端）
  price: number
  
  // 订单状态
  status: 'pending' | 'accepted' | 'picking' | 'delivering' | 'awaiting_payment' | 'completed' | 'cancelled'
  
  // 时间戳
  created_at: string
  accepted_at?: string
  picked_up_at?: string
  delivered_at?: string
  cancelled_at?: string
  updated_at: string
}

export interface OrderStatusHistory {
  id: string
  order_id: string
  status: string
  description?: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  order_id?: string
  type: 'recharge' | 'payment' | 'income' | 'withdraw'
  amount: number
  balance_after: number
  description?: string
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}

export interface Review {
  id: string
  order_id: string
  reviewer_id: string
  reviewed_user_id: string
  rating: number
  comment?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  order_id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

// API响应类型
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// 表单数据类型
export interface LoginForm {
  username: string
  password: string
}

export interface RegisterForm extends LoginForm {
  nickname: string
  campus?: string
}

export interface OrderForm {
  express_company: string
  tracking_number: string
  package_description?: string
  package_size: 'small' | 'medium' | 'large'
  pickup_location: string
  pickup_contact: string
  pickup_phone: string
  delivery_location: string
  delivery_contact: string
  delivery_phone: string
  delivery_time: string
}