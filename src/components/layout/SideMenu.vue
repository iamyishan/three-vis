<template>
  <div class="side-menu">
    <div class="logo">
      <h1>Three-Vis</h1>
    </div>
    <el-menu
      :default-active="activeMenu"
      class="menu-container"
      background-color="#1a1a1a"
      text-color="#fff"
      active-text-color="#409EFF"
      :router="true"
    >
      <el-sub-menu index="/basic">
        <template #title>
          <el-icon><Monitor /></el-icon>
          <span>基础功能</span>
        </template>
        <el-menu-item index="/basic">基础</el-menu-item>
        <el-menu-item index="/materials">材质</el-menu-item>
        <el-menu-item index="/controls">控制器</el-menu-item>
        <el-menu-item index="/glow">闪耀发光</el-menu-item>
      </el-sub-menu>

      <el-menu-item index="/examples">
        <el-icon><Collection /></el-icon>
        <span>样例中心</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Monitor, Collection } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style lang="scss" scoped>
.side-menu {
  height: 100%;
  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid rgba(64, 158, 255, 0.1);
    position: relative;
    overflow: hidden;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      height: 1px;
      background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(64, 158, 255, 0.5) 50%, 
        transparent 100%
      );
    }
    
    h1 {
      color: #fff;
      font-size: 24px;
      margin: 0;
      background: linear-gradient(45deg, #409EFF, #42b883);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
    }
  }

  .menu-container {
    border-right: none;
    
    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, 
          transparent 0%, 
          rgba(64, 158, 255, 0.05) 50%, 
          transparent 100%
        );
        transform: translateX(-100%);
        transition: transform 0.3s;
      }
      
      &:hover::before {
        transform: translateX(0);
      }
    }

    :deep(.el-menu-item) {
      &:hover {
        background-color: rgba(64, 158, 255, 0.1) !important;
      }
      
      &.is-active {
        background: linear-gradient(90deg, 
          rgba(64, 158, 255, 0.2) 0%, 
          rgba(64, 158, 255, 0.1) 100%
        ) !important;
        border-right: 2px solid #409EFF;
        
        &::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 2px;
          height: 100%;
          background: #409EFF;
          box-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
        }
      }
    }
  }
}
</style> 