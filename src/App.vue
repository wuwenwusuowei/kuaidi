<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts" setup>
</script>

<style>
/* 校园快跑 - 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
}

body {
  background: #f5f7fa;
  color: #333;
}

/* 校园快跑色彩系统 */
:root {
  --primary-color: #409EFF;    /* 清爽蓝 - 主色 */
  --primary-hover: #337AB7;    /* 主色悬停 */
  --success-color: #67C23A;   /* 活力绿 - 辅助色 */
  --warning-color: #E6A23C;   /* 警告橙 */
  --danger-color: #F56C6C;     /* 警示红 */
  --info-color: #909399;      /* 信息灰 */
  
  /* 新增校园风格色彩 */
  --campus-blue: #667eea;     /* 校园蓝 */
  --campus-green: #64e8de;    /* 校园绿 */
  --campus-orange: #f093fb;   /* 校园橙 */
  --campus-purple: #f5576c;   /* 校园紫 */
  
  --bg-light: #f5f7fa;        /* 浅灰背景 */
  --bg-medium: #e5e6eb;       /* 中灰背景 */
  --text-primary: #333;        /* 主要文字 */
  --text-secondary: #666;      /* 次要文字 */
  --text-light: #909399;      /* 浅色文字 */
  --border-color: #e5e6eb;    /* 边框色 */
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-hover);
}

/* 全局动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 卡片悬停效果 */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* 按钮样式增强 - 校园风格 */
.el-button {
  border-radius: 8px !important;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 14px;
}

.el-button--primary {
  background: var(--primary-color) !important;
  border: none !important;
  color: white !important;
}

.el-button--primary:hover {
  background: #337AB7 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.el-button--success {
  background: var(--success-color) !important;
  border: none !important;
}

.el-button--success:hover {
  background: #5DAF34 !important;
}

/* 输入框样式增强 */
.el-input__wrapper {
  border-radius: 8px !important;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color) !important;
}

.el-input__wrapper:hover {
  border-color: var(--primary-color) !important;
}

.el-input__wrapper.is-focus {
  border-color: var(--primary-color) !important;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1) !important;
}

/* 卡片样式增强 */
.el-card {
  border-radius: 12px !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
}

/* 标签样式 */
.el-tag {
  border-radius: 6px !important;
  font-weight: 500;
  font-size: 12px;
}

/* 对话框样式 */
.el-dialog {
  border-radius: 12px !important;
}

.el-dialog__header {
  border-bottom: 1px solid var(--border-color);
  padding: 20px !important;
  font-weight: 600;
  font-size: 16px;
}

.el-dialog__body {
  padding: 20px !important;
  font-size: 14px;
}

/* 步骤条样式 */
.el-steps {
  padding: 20px 0;
}

.el-step__head {
  border-radius: 50%;
}

/* 时间轴样式 */
.el-timeline-item__node {
  border-radius: 50%;
}

/* 校园风格全局类 */
.campus-gradient-bg {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--success-color) 100%);
}

.campus-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.campus-text-primary {
  color: var(--text-primary);
  font-weight: 600;
}

.campus-text-secondary {
  color: var(--text-secondary);
}

.campus-text-light {
  color: var(--text-light);
}
</style>
