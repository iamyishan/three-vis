import { createRouter,createWebHashHistory  } from 'vue-router'

const routes = [
  {
    path: '/basic',
    name: 'basic',
    component: () => import('../views/basic/index.vue'),
    children: [
      {
        path: 'base',
        component: () => import('../views/basic/demos/base.vue')
      },
      {
        path: 'group',
        component: () => import('../views/basic/demos/group.vue')
      },
      {
        path: 'visibility',
        component: () => import('../views/basic/demos/visibility.vue')
      },
      {
        path: 'events',
        component: () => import('../views/basic/demos/events.vue')
      },
      {
        path: 'shader',
        component: () => import('../views/basic/demos/shader.vue')
      },
      {
        path: 'penetrate',
        component: () => import('../views/basic/demos/penetrate.vue')
      },
      {
        path: 'scenes',
        component: () => import('../views/basic/demos/scenes.vue')
      },
    ]
  },
  {
    path: '/materials',
    name: 'materials',
    component: () => import('../views/materials/index.vue'),
    children: [
      {
        path: 'glass',
        component: () => import('../views/materials/demos/glass.vue')
      },
      {
        path: 'fluid',
        component: () => import('../views/materials/demos/fluid.vue')
      },
      {
        path: 'clipping',
        component: () => import('../views/materials/demos/clipping.vue')
      },
      {
        path: 'layers',
        component: () => import('../views/materials/demos/layers.vue')
      },
      {
        path: 'instanced',
        component: () => import('../views/materials/demos/instanced.vue')
      }
    ]
  },
  {
    path: '/controls',
    name: 'controls',
    component: () => import('../views/controls/index.vue'),
    children: [
      {
        path: 'camera',
        component: () => import('../views/controls/demos/camera.vue')
      },
      {
        path: 'orbit',
        component: () => import('../views/controls/demos/orbit.vue')
      },
      {
        path: 'transform',
        component: () => import('../views/controls/demos/transform.vue')
      },
      {
        path: 'map',
        component: () => import('../views/controls/demos/map.vue')
      }
    ]
  },
  {
    path: '/glow',
    name: 'glow',
    component: () => import('../views/glow/index.vue'),
    children: [
      {
        path: 'sprite',
        component: () => import('../views/glow/demos/sprite.vue')
      },
      {
        path: 'shader',
        component: () => import('../views/glow/demos/shader.vue')
      },
      {
        path: 'geometric',
        component: () => import('../views/glow/demos/geometric.vue')
      },
      {
        path: 'postprocessing',
        component: () => import('../views/glow/demos/postprocessing.vue')
      },
      {
        path: 'mask',
        component: () => import('../views/glow/demos/mask.vue')
      },
      {
        path: 'layers',
        component: () => import('../views/glow/demos/layers.vue')
      }
    ]
  },
  {
    path: '/examples',
    name: 'examples',
    component: () => import('../views/examples/index.vue'),
    children: [
      {
        path: 'digital-city',
        component: () => import('../views/examples/digitalCity.vue'),
        children: [
          {
            path: 'building',
            component: () => import('../views/examples/demos/building.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/',
    redirect: '/basic'
  }
]

const router = createRouter({
 
  history: createWebHashHistory(),
  routes
})

export default router 