<template>
  <div class="materials-container">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <div class="cards-grid" v-if="!isDemo">
      <el-card 
        v-for="demo in demos" 
        :key="demo.path"
        class="demo-card"
        :body-style="{ padding: '0px' }"
      >
        <div class="demo-content" @click="navigateToDemo(demo)">
          <div class="demo-preview">
            <img :src="demo.preview" alt="预览图">
          </div>
          <div class="demo-info">
            <h3>{{ demo.title }}</h3>
            <p>{{ demo.description }}</p>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()

const isDemo = computed(() => {
  return route.path !== '/materials'
})

const demos = [
  {
    title: '玻璃材质',
    description: '实现透明玻璃材质效果',
    path: '/materials/glass',
    preview: 'https://via.placeholder.com/300x200?text=Glass+Material'
  },
  {
    title: '流体波动',
    description: '使用着色器实现流体波动效果',
    path: '/materials/fluid',
    preview: 'https://via.placeholder.com/300x200?text=Fluid+Effect'
  },
  {
    title: '材质裁剪',
    description: '实现3D模型的材质裁剪效果',
    path: '/materials/clipping',
    preview: 'https://via.placeholder.com/300x200?text=Material+Clipping'
  },
  {
    title: '图层材质',
    description: '实现多层材质叠加效果',
    path: '/materials/layers',
    preview: 'https://via.placeholder.com/300x200?text=Layer+Material'
  },
  {
    title: 'Instanced材质',
    description: '使用实例化和继承实现高性能材质',
    path: '/materials/instanced',
    preview: 'https://via.placeholder.com/300x200?text=Instanced+Material'
  }
]

const navigateToDemo = (demo) => {
  router.push(demo.path)
}
</script>

<style lang="scss" scoped>
.materials-container {
  padding: 12px;
  margin: -20px;
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
  
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(260px, 1fr));
    gap: 16px;
    justify-content: center;
    
    .demo-card {
      max-width: 320px;
      justify-self: center;
      width: 100%;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }
      
      .demo-content {
        cursor: pointer;
      }

      .demo-preview {
        height: 140px;
        overflow: hidden;
        border-radius: 8px 8px 0 0;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .demo-info {
        padding: 12px;
        
        h3 {
          margin: 0;
          color: #333;
          font-size: 15px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        p {
          margin: 6px 0 0;
          color: #666;
          font-size: 13px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 36px;
        }
      }
    }
  }
}

@media screen and (max-width: 1400px) {
  .materials-container .cards-grid {
    grid-template-columns: repeat(3, minmax(260px, 1fr));
  }
}

@media screen and (max-width: 1100px) {
  .materials-container .cards-grid {
    grid-template-columns: repeat(2, minmax(260px, 1fr));
  }
}

@media screen and (max-width: 768px) {
  .materials-container .cards-grid {
    grid-template-columns: minmax(260px, 1fr);
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