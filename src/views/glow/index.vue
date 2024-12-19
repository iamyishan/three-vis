<template>
  <div class="glow-container">
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
  return route.path !== '/glow' && route.path !== '/glow/'
})

const demos = [
  {
    title: '点精灵贴图',
    description: '使用精灵贴图实��发光粒子效果',
    path: '/glow/sprite',
    preview: 'https://via.placeholder.com/300x200?text=Sprite+Glow'
  },
  {
    title: '着色器发光',
    description: '使用自定义着色器实现物体发光效果',
    path: '/glow/shader',
    preview: 'https://via.placeholder.com/300x200?text=Shader+Glow'
  },
  {
    title: '几何缩放',
    description: '通过几何体缩放实现发光描边效果',
    path: '/glow/geometric',
    preview: 'https://via.placeholder.com/300x200?text=Geometric+Glow'
  },
  {
    title: '后期处理',
    description: '使用后期处理实现多重发光效果叠加',
    path: '/glow/postprocessing',
    preview: 'https://via.placeholder.com/300x200?text=Postprocessing+Glow'
  },
  {
    title: '掩膜通道',
    description: '使用掩膜通道实现选择性发光效果',
    path: '/glow/mask',
    preview: 'https://via.placeholder.com/300x200?text=Mask+Glow'
  },
  {
    title: '图层叠加',
    description: '使用多个图层叠加实现复杂发光效果',
    path: '/glow/layers',
    preview: 'https://via.placeholder.com/300x200?text=Layers+Glow'
  }
]

const navigateToDemo = (demo) => {
  router.push(demo.path)
}
</script>

<style lang="scss" scoped>
.glow-container {
  height: 100%;
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

  @media screen and (max-width: 1400px) {
    .cards-grid {
      grid-template-columns: repeat(3, minmax(260px, 1fr));
    }
  }

  @media screen and (max-width: 1100px) {
    .cards-grid {
      grid-template-columns: repeat(2, minmax(260px, 1fr));
    }
  }

  @media screen and (max-width: 768px) {
    .cards-grid {
      grid-template-columns: minmax(260px, 1fr);
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