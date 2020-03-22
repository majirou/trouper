const lock = function (message, selector = null) {
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
const unlock = function (selector) {
  const lockMaskClassName = 'lock-mask'

  selector = selector || 'body'
  if (typeof selector === 'string') {
    const docs = document.querySelectorAll(selector)
    for (const doc of docs) {
      if (doc.children.length > 0) {
        for (const children of doc.children) {
          if (children.classList.contains(lockMaskClassName)) {
            children.parentNode.removeChild(children)
          }
        }
      }
    }
  }
}

export default ({ req }, inject) => {
  inject('lock', lock)
  inject('unlock', unlock)
}
