import Vue from 'vue'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import Api from '@/api'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n
import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/styles/index.scss' // global css
import '@/permission' // permission control
import CategorySelect from '@/components/CategorySelect'

Vue.component(CategorySelect.name, CategorySelect)
const {mockXHR} = require('../mock')
mockXHR()

import jz from '@/assets/5.gif'
import VueLazyload from "vue-lazyload";

Vue.use(VueLazyload, {
  //懒加载默认图片
  loading: jz
})

Vue.use(ElementUI, {locale})
Vue.prototype.$API = Api

Vue.config.productionTip = false

new Vue({
  el: '#app',
  render: h => h(App),
  router,
  beforeCreate() {
    Vue.prototype.$bus = this
  },
  store,
})
