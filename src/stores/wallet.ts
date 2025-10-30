import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

export interface Transaction {
  id: string
  type: 'income' | 'expense' | 'recharge' | 'withdraw'
  amount: number
  description: string
  orderId?: string
  createdAt: string
  status: 'pending' | 'completed' | 'failed'
}

export const useWalletStore = defineStore('wallet', () => {
  const transactions = ref<Transaction[]>([])
  const authStore = useAuthStore()

  // 模拟交易数据
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'recharge',
      amount: 100.00,
      description: '账户充值',
      createdAt: '2024-10-24T09:00:00',
      status: 'completed'
    },
    {
      id: '2',
      type: 'expense',
      amount: -8.00,
      description: '快递代领费用',
      orderId: '1',
      createdAt: '2024-10-24T10:30:00',
      status: 'completed'
    },
    {
      id: '3',
      type: 'income',
      amount: 8.00,
      description: '代领收入',
      orderId: '1',
      createdAt: '2024-10-24T11:00:00',
      status: 'completed'
    }
  ]

  // 初始化交易数据
  transactions.value = mockTransactions

  // 获取用户余额
  const getBalance = () => {
    if (!authStore.user) return 0
    return authStore.user.balance
  }

  // 获取交易记录
  const getTransactions = () => {
    return transactions.value.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  // 充值
  const recharge = async (amount: number) => {
    if (!authStore.user) {
      throw new Error('请先登录')
    }

    if (amount <= 0) {
      throw new Error('充值金额必须大于0')
    }

    // 模拟充值处理
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'recharge',
      amount: amount,
      description: '账户充值',
      createdAt: new Date().toISOString(),
      status: 'completed'
    }

    transactions.value.unshift(newTransaction)
    
    // 更新用户余额
    authStore.updateUser({
      balance: authStore.user.balance + amount
    })

    return newTransaction
  }

  // 支付订单
  const payOrder = async (orderId: string, amount: number) => {
    if (!authStore.user) {
      throw new Error('请先登录')
    }

    if (authStore.user.balance < amount) {
      throw new Error('余额不足，请先充值')
    }

    // 模拟支付处理
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'expense',
      amount: -amount,
      description: '订单支付',
      orderId: orderId,
      createdAt: new Date().toISOString(),
      status: 'completed'
    }

    transactions.value.unshift(newTransaction)
    
    // 更新用户余额
    authStore.updateUser({
      balance: authStore.user.balance - amount
    })

    return newTransaction
  }

  // 收入结算
  const settleIncome = async (orderId: string, amount: number) => {
    if (!authStore.user) {
      throw new Error('请先登录')
    }

    // 模拟收入结算
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'income',
      amount: amount,
      description: '代领收入',
      orderId: orderId,
      createdAt: new Date().toISOString(),
      status: 'completed'
    }

    transactions.value.unshift(newTransaction)
    
    // 更新用户余额
    authStore.updateUser({
      balance: authStore.user.balance + amount
    })

    return newTransaction
  }

  // 提现
  const withdraw = async (amount: number) => {
    if (!authStore.user) {
      throw new Error('请先登录')
    }

    if (amount <= 0) {
      throw new Error('提现金额必须大于0')
    }

    if (authStore.user.balance < amount) {
      throw new Error('余额不足')
    }

    // 模拟提现处理
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'withdraw',
      amount: -amount,
      description: '余额提现',
      createdAt: new Date().toISOString(),
      status: 'completed'
    }

    transactions.value.unshift(newTransaction)
    
    // 更新用户余额
    authStore.updateUser({
      balance: authStore.user.balance - amount
    })

    return newTransaction
  }

  return {
    transactions,
    getBalance,
    getTransactions,
    recharge,
    payOrder,
    settleIncome,
    withdraw
  }
})