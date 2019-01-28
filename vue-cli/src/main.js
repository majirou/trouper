import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = true

Vue.prototype.$apiUrl = process.env.VUE_APP_API_PATH
Vue.prototype.$dataUrl = process.env.VUE_APP_DATA_PATH
Vue.prototype.$lock = function (message, selector = null) {
  const lockMaskClassName = 'lock-mask'
  const lockWrapperClassName = 'lock-wrapper'
  const lockContainerClassName = 'lock-container'

  selector = selector || 'body'

  if (typeof selector === 'string') {
    const docs = document.querySelectorAll(selector)

    if (docs.length === 1) {
      const body = document.createElement('div')
      body.innerHTML = '<i class="fas fa-spin fa-spinner mr-1"></i>' + (message || 'locked...')

      const container = document.createElement('div')
      container.classList.add(lockContainerClassName)
      container.appendChild(body)

      const wrapper = document.createElement('div')
      wrapper.classList.add(lockWrapperClassName)
      wrapper.appendChild(container)

      const mask = document.createElement('div')
      mask.classList.add(lockMaskClassName)
      mask.appendChild(wrapper)
      docs[0].appendChild(mask)
    } else {
      console.error('lock target must be only one')
    }
  }
}
Vue.prototype.$unlock = function (selector) {
  const lockMaskClassName = 'lock-mask'

  selector = selector || 'body'
  if (typeof selector === 'string') {
    const docs = document.querySelectorAll(selector)
    for (let i in docs) {
      if (docs.hasOwnProperty(i)) { // && docs[i].classList.contains(lockMaskClassName)) {
        let docsChildren = docs[i].children
        if (docsChildren.length > 0) {
          for (let ii in docsChildren) {
            if (docsChildren.hasOwnProperty(ii) &&
                docsChildren[ii].classList.contains(lockMaskClassName)
            ) {
              // console.log(docsChildren[ii])
              docsChildren[ii].parentNode.removeChild(docsChildren[ii])
            }
          }
        }
      }
    }
  }
}

// console.log(process.env)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
