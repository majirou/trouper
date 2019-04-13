import Vue from 'vue'
import Router from 'vue-router'
// import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: '/cli',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Register.vue')
    },
    {
      path: '/edit/:id',
      name: 'Edit',
      component: () => import('@/views/Edit.vue')
    },
    {
      path: '/review/:id/',
      name: 'review',
      component: () => import('./views/Review.vue')
    }
  ]
})
