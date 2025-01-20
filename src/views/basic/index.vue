<template>
  <div class="basic-container">
    <div class="cards-grid">
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const demos = [
    {
    title: '基础场景',
    description: 'Three.js基础场景搭建',
    path: '/basic/basic',
    preview: 'https://via.placeholder.com/300x200?text=Basic+Demo'
  },
  {
    title: '组合Group',
    description: '学习Three.js中的Group对象使用',
    path: '/basic/group',
    preview: 'https://via.placeholder.com/300x200?text=Group+Demo'
  },
  {
    title: '显隐v-if',
    description: '控制3D对象的显示和隐藏',
    path: '/basic/visibility',
    preview: 'https://via.placeholder.com/300x200?text=Visibility+Demo'
  },
  {
    title: '事件处理',
    description: '3D场景中的事件交互',
    path: '/basic/events',
    preview: 'https://via.placeholder.com/300x200?text=Events+Demo'
  },
  {
    title: '着色器实践',
    description: 'GLSL着色器的基础应用',
    path: '/basic/shader',
    preview: 'https://via.placeholder.com/300x200?text=Shader+Demo'
  },
  {
    title: '穿透事件',
    description: '处理3D对象的点击穿透',
    path: '/basic/penetrate',
    preview: 'https://via.placeholder.com/300x200?text=Penetrate+Demo'
  },
  {
    title: '多场景',
    description: '在一个页面中展示多个3D场景',
    path: '/basic/scenes',
    preview: 'https://via.placeholder.com/300x200?text=Scenes+Demo'
  }
]

const navigateToDemo = (demo) => {
  console.log(demo.path)
  router.push(demo.path)
}
</script>

<style lang="scss" scoped>
.basic-container {
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
  .basic-container .cards-grid {
    grid-template-columns: repeat(3, minmax(260px, 1fr));
  }
}

@media screen and (max-width: 1100px) {
  .basic-container .cards-grid {
    grid-template-columns: repeat(2, minmax(260px, 1fr));
  }
}

@media screen and (max-width: 768px) {
  .basic-container .cards-grid {
    grid-template-columns: minmax(260px, 1fr);
  }
}
</style> 