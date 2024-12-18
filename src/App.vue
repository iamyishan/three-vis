<template>
  <div class="app-container">
    <el-container>
      <el-aside :width="menuWidth">
        <SideMenu />
      </el-aside>
      <el-main>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SideMenu from '@/components/layout/SideMenu.vue'

const menuWidth = '240px'

// 设置 CSS 变量
document.documentElement.style.setProperty('--menu-width', menuWidth)
</script>

<style lang="scss">
:root {
  --menu-width: 240px;
}

.app-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  
  .el-container {
    height: 100%;
  }

  .el-aside {
    background: linear-gradient(135deg, #1a1f2c 0%, #13151d 100%);
    border-right: 1px solid rgba(64, 158, 255, 0.1);
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        linear-gradient(90deg, transparent 0%, rgba(64, 158, 255, 0.03) 50%, transparent 100%),
        radial-gradient(circle at 50% 0, rgba(64, 158, 255, 0.1), transparent 70%);
      pointer-events: none;
    }
  }

  .el-main {
    background: #f5f5f5;
    padding: 20px;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        linear-gradient(45deg, rgba(255, 255, 255, 0.8) 0%, transparent 100%),
        radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.8), transparent 50%);
      pointer-events: none;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
