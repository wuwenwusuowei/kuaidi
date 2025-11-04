<template>
  <div class="admin-test">
    <h2>管理员登录测试</h2>
    <div class="test-info">
      <p><strong>用户名：</strong>admin</p>
      <p><strong>密码：</strong>admin123</p>
    </div>
    <el-button type="primary" @click="goToAdminLogin">
      前往管理员登录页面
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToAdminLogin = () => {
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-test {
  padding: 40px;
  text-align: center;
  max-width: 500px;
  margin: 100px auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.test-info {
  margin: 20px 0;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

test-info p {
  margin: 10px 0;
  font-size: 16px;
}
</style>