<template>
  <div class="examples-container">
    <el-empty description="更多示例正在开发中..." />
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.examples-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  :deep(.el-empty) {
    .el-empty__description {
      color: #999;
    }
  }
}
</style> 