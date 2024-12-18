import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/basic',
    name: 'basic',
    component: () => import('../views/basic/index.vue'),
    children: [
      {
        path: 'basic',
        component: () => import('../views/basic/demos/basic.vue')
      }
    ]
  },
  {
    path: '/basic/group',
    name: 'group',
    component: () => import('../views/basic/demos/group.vue')
  },
  {
    path: '/basic/visibility',
    name: 'visibility',
    component: () => import('../views/basic/demos/visibility.vue')
  },
  {
    path: '/basic/events',
    name: 'events',
    component: () => import('../views/basic/demos/events.vue')
  },
  {
    path: '/basic/shader',
    name: 'shader',
    component: () => import('../views/basic/demos/shader.vue')
  },
  {
    path: '/basic/penetrate',
    name: 'penetrate',
    component: () => import('../views/basic/demos/penetrate.vue')
  },
  {
    path: '/basic/scenes',
    name: 'scenes',
    component: () => import('../views/basic/demos/scenes.vue')
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
      }
    ]
  },
  {
    path: '/controls',
    name: 'controls',
    component: () => import('../views/controls/index.vue'),
  },
  {
    path: '/glow',
    name: 'glow',
    component: () => import('../views/glow/index.vue'),
  },
  {
    path: '/examples',
    name: 'examples',
    component: () => import('../views/examples/index.vue')
  },
  {
    path: '/',
    redirect: '/basic'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 