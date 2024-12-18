<template>
  <div class="glow-container">
    <el-empty description="闪耀发光示例正在开发中...">
      <template #image>
        <el-icon :size="60" color="#909399"><Star /></el-icon>
      </template>
    </el-empty>
  </div>
</template>

<script setup>
import { Star } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.glow-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(.el-empty) {
    .el-empty__description {
      color: #909399;
    }
  }
}
</style> 