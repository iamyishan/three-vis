<template>
  <div class="back-button">
    <el-button 
      type="primary" 
      size="small" 
      @click="goBack"
      :icon="ArrowLeft"
    >
      返回列表
    </el-button>
  </div>
</template>

<script setup>
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const goBack = () => {
  const path = route.path
  if (path.startsWith('/materials')) {
    router.push('/materials')
  } else if (path.startsWith('/basic')) {
    router.push('/basic')
  }
}
</script>

<style lang="scss" scoped>
.back-button {
  position: fixed;
  top: 20px;
  left: calc(var(--menu-width) + 20px);
  z-index: 1000;

  .el-button {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(8px);
    background-color: rgba(64, 158, 255, 0.9);
    
    &:hover {
      background-color: rgba(64, 158, 255, 1);
      transform: translateY(-1px);
      box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
    }
  }
}
</style> 