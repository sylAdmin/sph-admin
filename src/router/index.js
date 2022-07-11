import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  //首页
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: {title: '首页', icon: 'dashboard'}
    }]
  },
]

//异步理由:不同的用户（角色），需要过滤筛选出的路由，称之为异步路由
//有的用户可以看见测试管理、有的看不见
export const asyncRoutes = [
  //权限管理
  {
    name: 'Acl',
    path: '/acl',
    component: Layout,
    redirect: '/acl/user/list',
    meta: {
      title: '权限管理',
      icon: 'el-icon-lock'
    },
    children: [
      {
        name: 'User',
        path: 'user/list',
        component: () => import('@/views/acl/user/list'),
        meta: {
          title: '用户管理',
        },
      },
      {
        name: 'Role',
        path: 'role/list',
        component: () => import('@/views/acl/role/list'),
        meta: {
          title: '角色管理',
        },
      },
      {
        name: 'RoleAuth',
        path: 'role/auth/:id',
        component: () => import('@/views/acl/role/roleAuth'),
        meta: {
          activeMenu: '/acl/role/list',
          title: '角色授权',
        },
        hidden: true,
      },
      {
        name: 'Permission',
        path: 'permission/list',
        component: () => import('@/views/acl/permission/list'),
        meta: {
          title: '菜单管理',
        },
      },
    ]
  },
  //商品管理
  {
    path: '/product',
    component: Layout,
    name: 'Product',
    meta: {title: '商品管理', icon: 'el-icon-goods'},
    children: [
      {
        path: 'trademark',
        name: 'Trademark',
        component: () => import('@/views/product/TradeMark'),
        meta: {title: '品牌管理'}
      },
      {
        path: 'attr',
        name: 'Attr',
        component: () => import('@/views/product/Attr'),
        meta: {title: '平台属性管理'}
      },
      {
        path: 'spu',
        name: 'Spu',
        component: () => import('@/views/product/Spu'),
        meta: {title: 'Spu管理'}
      },
      {
        path: '/sku',
        name: 'Sku',
        component: () => import('@/views/product/Sku'),
        meta: {title: 'Sku管理'}
      },
    ]
  },
  //测试管理
  {
    name: 'test',
    path: '/test',
    component: Layout,
    meta: {title: '测试管理', icon: 'el-icon-s-tools'},
    children: [
      {
        path: 'test1',
        name: 'test1',
        component: () => import('@/views/test/test1'),
        meta: {title: '测试管理1'}
      },
      {
        path: 'test2',
        name: 'test2',
        component: () => import('@/views/test/test2'),
        meta: {title: '测试管理2'}
      },
    ]
  },
]

//任意路由：当路径出现错误的时候重定向404
export const anyRoutes ={ path: '*', redirect: '/404', hidden: true };

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({y: 0}),
  routes: constantRoutes,asyncRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router