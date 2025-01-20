<template>
  <div class="examples-container">
    <el-empty description="更多示例正在开发中..." />
  </div>
</template>

<script setup>
const demos = [
  {
    title: '数字城市',
    description: '展示数字城市的建筑物和场景',
    path: '/examples/digital-city',
    preview: 'https://via.placeholder.com/300x200?text=Digital+City'
  }
]
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