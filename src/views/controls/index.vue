<template>
  <div class="controls-container">
    <el-empty description="控制器示例正在开发中...">
      <template #image>
        <el-icon :size="60" color="#909399"><Operation /></el-icon>
      </template>
    </el-empty>
  </div>
</template>

<script setup>
import { Operation } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.controls-container {
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