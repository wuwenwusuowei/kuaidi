<template>
  <div class="help-container">
    <!-- 星空风格背景装饰 -->
    <div class="starry-background">
      <div class="bg-gradient"></div>
      <div class="bg-pattern"></div>
    </div>
    
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-content">
        <div class="logo">
          <h2>校园快递代领平台 - 使用指南</h2>
        </div>
        <div class="user-info">
          <el-button @click="goBack" type="primary">
            <el-icon><ArrowLeft /></el-icon>
            返回首页
          </el-button>
        </div>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-main class="main-content">
      <div class="help-content">
        <!-- 快速导航 -->
        <div class="quick-nav">
          <h2>快速导航</h2>
          <el-space wrap>
            <el-button @click="scrollTo('basic-usage')" type="primary">基础使用</el-button>
            <el-button @click="scrollTo('publish-guide')">发布订单</el-button>
            <el-button @click="scrollTo('accept-guide')">接单指南</el-button>
            <el-button @click="scrollTo('payment-guide')">支付流程</el-button>
            <el-button @click="scrollTo('chat-guide')">聊天沟通</el-button>
            <el-button @click="scrollTo('faq')">常见问题</el-button>
          </el-space>
        </div>

        <!-- 基础使用指南 -->
        <div class="section" id="basic-usage">
          <h2>📋 基础使用指南</h2>
          <el-card class="guide-card">
            <h3>用户角色说明</h3>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="委托人">
                需要代领快递的用户，可以发布代领需求
              </el-descriptions-item>
              <el-descriptions-item label="接单员">
                帮助他人代领快递的用户，可以接单完成任务
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card class="guide-card">
            <h3>平台主要功能</h3>
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="feature-item">
                  <el-icon size="32" color="#1890ff"><DocumentAdd /></el-icon>
                  <h4>发布代领需求</h4>
                  <p>填写快递信息，发布代领任务</p>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="feature-item">
                  <el-icon size="32" color="#52c41a"><Search /></el-icon>
                  <h4>任务大厅</h4>
                  <p>浏览可接单的代领任务</p>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="feature-item">
                  <el-icon size="32" color="#faad14"><Tickets /></el-icon>
                  <h4>我的订单</h4>
                  <p>管理所有订单状态</p>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </div>

        <!-- 发布订单指南 -->
        <div class="section" id="publish-guide">
          <h2>📦 发布订单指南</h2>
          <el-card class="guide-card">
            <h3>发布流程</h3>
            <el-steps :active="3" align-center simple>
              <el-step title="填写快递信息" description="快递公司、单号、物品描述" />
              <el-step title="设置送达信息" description="取件地点、送达地点、送达时间" />
              <el-step title="确认发布" description="确认信息并发布订单" />
            </el-steps>
          </el-card>

          <el-card class="guide-card">
            <h3>填写要点</h3>
            <el-alert 
              title="重要提示" 
              type="info" 
              :closable="false"
              description="请确保填写的信息准确无误，特别是取件地点和送达地点要详细具体"
            />
            
            <div class="tips-list">
              <el-timeline>
                <el-timeline-item timestamp="快递信息" placement="top">
                  <p><strong>快递标题：</strong>简明扼要，如"顺丰快递代取"</p>
                  <p><strong>快递单号：</strong>确保准确无误</p>
                  <p><strong>物品描述：</strong>详细描述物品类型和特征</p>
                </el-timeline-item>
                <el-timeline-item timestamp="送达信息" placement="top">
                  <p><strong>取件地点：</strong>具体到快递点货架号</p>
                  <p><strong>送达地点：</strong>具体到宿舍楼房间号</p>
                  <p><strong>送达时间：</strong>选择合理的送达时间</p>
                </el-timeline-item>
                <el-timeline-item timestamp="费用设置" placement="top">
                  <p><strong>建议金额：</strong>小件1-2元，中件4-5元，大件8-15元</p>
                  <p><strong>加急服务：</strong>可选择加急，费用适当增加</p>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-card>
        </div>

        <!-- 接单指南 -->
        <div class="section" id="accept-guide">
          <h2>🚴 接单指南</h2>
          <el-card class="guide-card">
            <h3>接单流程</h3>
            <el-steps :active="4" align-center simple>
              <el-step title="浏览任务" description="在任务大厅查看可接单任务" />
              <el-step title="选择任务" description="选择适合的任务并接单" />
              <el-step title="完成代领" description="按照要求完成快递代领" />
              <el-step title="确认送达" description="将快递送达指定地点" />
            </el-steps>
          </el-card>

          <el-card class="guide-card">
            <h3>接单注意事项</h3>
            <el-alert 
              title="责任提醒" 
              type="warning" 
              :closable="false"
              description="接单后请按时完成任务，确保快递安全送达"
            />
            
            <div class="tips-grid">
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="tip-item">
                    <el-icon color="#1890ff"><Check /></el-icon>
                    <span>确认任务地点是否方便</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="tip-item">
                    <el-icon color="#1890ff"><Check /></el-icon>
                    <span>检查物品尺寸是否合适</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="tip-item">
                    <el-icon color="#1890ff"><Check /></el-icon>
                    <span>确认送达时间是否可行</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="tip-item">
                    <el-icon color="#1890ff"><Check /></el-icon>
                    <span>保持与委托人的沟通</span>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-card>
        </div>

        <!-- 支付流程指南 -->
        <div class="section" id="payment-guide">
          <h2>💰 支付流程指南</h2>
          <el-card class="guide-card">
            <h3>支付流程说明</h3>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="委托人">
                <p>1. 接单员接单后，订单状态变为"配送中"</p>
                <p>2. 接单员送达后，订单状态变为"待支付"</p>
                <p>3. 委托人点击"发起支付"按钮完成支付</p>
                <p>4. 接单员确认收到款项后，订单完成</p>
              </el-descriptions-item>
              <el-descriptions-item label="接单员">
                <p>1. 接单后开始配送任务</p>
                <p>2. 送达后等待委托人支付</p>
                <p>3. 委托人支付后，点击"确认支付完成"</p>
                <p>4. 订单完成，获得报酬</p>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card class="guide-card">
            <h3>支付安全提示</h3>
            <el-alert 
              title="安全提醒" 
              type="success" 
              :closable="false"
              description="平台采用安全的支付机制，确保双方权益"
            />
            
            <div class="security-tips">
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="security-item">
                    <el-icon color="#52c41a"><Lock /></el-icon>
                    <h4>资金安全</h4>
                    <p>支付过程全程加密</p>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="security-item">
                    <el-icon color="#52c41a"><User /></el-icon>
                    <h4>身份验证</h4>
                    <p>双方身份实名认证</p>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="security-item">
                    <el-icon color="#52c41a"><Service /></el-icon>
                    <h4>客服支持</h4>
                    <p>遇到问题可联系客服</p>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-card>
        </div>

        <!-- 聊天沟通指南 -->
        <div class="section" id="chat-guide">
          <h2>💬 聊天沟通指南</h2>
          <el-card class="guide-card">
            <h3>实时沟通功能</h3>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="沟通方式">
                <p>• 在订单卡片上点击"联系沟通"按钮即可开始聊天</p>
                <p>• 支持实时消息发送和接收</p>
                <p>• 聊天记录自动保存，随时查看</p>
              </el-descriptions-item>
              <el-descriptions-item label="沟通时机">
                <p>• 接单后：确认取件细节和送达时间</p>
                <p>• 配送中：实时更新配送进度</p>
                <p>• 送达前：确认具体送达地点</p>
                <p>• 支付前：确认支付金额和方式</p>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card class="guide-card">
            <h3>沟通注意事项</h3>
            <el-alert 
              title="沟通礼仪" 
              type="info" 
              :closable="false"
              description="良好的沟通是顺利完成订单的关键"
            />
            
            <div class="tips-grid">
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="tip-item">
                    <el-icon color="#1890ff"><Check /></el-icon>
                    <span>及时回复对方消息</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="tip-item">
                    <el-icon color="#1890ff"><Check /></el-icon>
                    <span>使用礼貌用语</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="tip-item">
                    <el-icon color="#1890ff"><Check /></el-icon>
                    <span>确认重要信息（如地点、时间）</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="tip-item">
                    <el-icon color="#1890ff"><Check /></el-icon>
                    <span>遇到问题及时沟通</span>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-card>
        </div>

        <!-- 常见问题 -->
        <div class="section" id="faq">
          <h2>❓ 常见问题解答</h2>
          <el-card class="guide-card">
            <h3>常见问题</h3>
            <el-collapse v-model="activeNames">
              <el-collapse-item title="如何注册账号？" name="1">
                <p>在登录页面点击"注册"按钮，按照提示填写真实信息完成注册。</p>
              </el-collapse-item>
              <el-collapse-item title="忘记密码怎么办？" name="2">
                <p>请联系平台管理员进行密码重置。</p>
              </el-collapse-item>
              <el-collapse-item title="发布订单需要哪些信息？" name="3">
                <p>需要填写快递公司、单号、物品描述、取件地点、送达地点、送达时间等。</p>
              </el-collapse-item>
              <el-collapse-item title="支付出现问题怎么办？" name="4">
                <p>请及时联系平台客服处理支付问题。</p>
              </el-collapse-item>
              <el-collapse-item title="物品损坏或丢失如何处理？" name="6">
                <p>立即联系平台客服，平台会根据情况进行处理。</p>
              </el-collapse-item>
              <el-collapse-item title="如何与对方进行实时沟通？" name="7">
                <p>在订单卡片上点击"联系沟通"按钮即可打开聊天窗口，支持实时消息发送。</p>
              </el-collapse-item>
              <el-collapse-item title="聊天记录会保存吗？" name="8">
                <p>是的，所有聊天记录都会自动保存，您可以随时查看历史对话。</p>
              </el-collapse-item>
              <el-collapse-item title="为什么有些订单没有联系沟通按钮？" name="9">
                <p>只有进行中的订单（已接单、取件中、配送中、待支付）才会显示联系沟通按钮，已完成或已取消的订单不显示。</p>
              </el-collapse-item>
            </el-collapse>
          </el-card>

          <el-card class="guide-card">
            <h3>联系方式</h3>
            <div class="contact-info">
              <p><strong>客服电话：</strong> 400-123-4567</p>
              <p><strong>客服邮箱：</strong> support@kuaidi.com</p>
              <p><strong>服务时间：</strong> 周一至周日 9:00-18:00</p>
            </div>
          </el-card>
        </div>
      </div>
    </el-main>

    <!-- 回到顶部按钮 -->
    <el-backtop :right="50" :bottom="50" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  DocumentAdd,
  Search,
  Tickets,
  Check,
  Lock,
  User,
  Service
} from '@element-plus/icons-vue'

const router = useRouter()
const activeNames = ref(['1'])

// 返回首页
const goBack = () => {
  router.push('/home')
}

// 滚动到指定位置
const scrollTo = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
.help-container {
  min-height: 100vh;
  background: transparent; /* 移除原有背景，让星空背景显示 */
  position: relative;
  overflow: hidden;
}

/* 星空风格背景装饰 */
.starry-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none !important;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    rgba(74, 144, 226, 0.1) 0%, 
    rgba(255, 126, 130, 0.05) 50%, 
    rgba(255, 255, 255, 0.02) 100%);
  pointer-events: none !important;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 1) 1px, transparent 1px),
    radial-gradient(circle at 20% 40%, rgba(255, 255, 255, 0.9) 1px, transparent 1px),
    radial-gradient(circle at 30% 60%, rgba(255, 255, 255, 0.8) 1px, transparent 1px),
    radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.7) 1px, transparent 1px),
    radial-gradient(circle at 60% 10%, rgba(255, 255, 255, 0.9) 1px, transparent 1px),
    radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.8) 1px, transparent 1px),
    radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.7) 1px, transparent 1px),
    radial-gradient(circle at 90% 70%, rgba(255, 255, 255, 0.6) 1px, transparent 1px);
  background-size: 100px 100px, 150px 150px, 200px 200px, 250px 250px, 
                  120px 120px, 180px 180px, 220px 220px, 280px 280px;
  animation: twinkle 8s ease-in-out infinite;
  pointer-events: none !important;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.header {
  background: white;
  border-bottom: 1px solid #e6e6e6;
  padding: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
}

.logo h2 {
  color: #1890ff;
  margin: 0;
  font-weight: 600;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.help-content {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.quick-nav {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid #f0f0f0;
}

.quick-nav h2 {
  color: #333;
  margin-bottom: 20px;
}

.section {
  margin-bottom: 50px;
}

.section h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 24px;
  border-left: 4px solid #1890ff;
  padding-left: 12px;
}

.guide-card {
  margin-bottom: 20px;
}

.guide-card h3 {
  color: #333;
  margin-bottom: 15px;
}

.feature-item {
  text-align: center;
  padding: 20px;
}

.feature-item h4 {
  margin: 10px 0 5px 0;
  color: #333;
}

.feature-item p {
  color: #666;
  margin: 0;
}

.tips-list {
  margin-top: 20px;
}

.tips-grid {
  margin-top: 20px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0;
  color: #333;
}

.security-tips {
  margin-top: 20px;
}

.security-item {
  text-align: center;
  padding: 20px;
}

.security-item h4 {
  margin: 10px 0 5px 0;
  color: #333;
}

.security-item p {
  color: #666;
  margin: 0;
}

.contact-info {
  padding: 20px;
}

.contact-info p {
  margin: 10px 0;
  color: #333;
}

:deep(.el-collapse-item__header) {
  font-weight: 600;
}

:deep(.el-collapse-item__content) {
  color: #666;
  line-height: 1.6;
}
</style>