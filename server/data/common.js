/**
 * this script was inserted, when scraped and localized
 */
document.addEventListener('DOMContentLoaded', () => {
  const activeClass = 'iframe-active'

  // clear colored element(remove active class)
  const clearActiveElement = () => {
    const elems = document.getElementsByClassName(activeClass)
    Object.keys(elems).forEach(key => {
      elems[key].classList.remove(activeClass)
    })
  }

  const createTarget = target => {
      const id = (target.id != null) ? target.id : ''
      const name = (target.name!= null) ? target.name : ''
      const tag = (target.localName != null) ? target.localName : ''

      // if it has class attr, remove active class and explode the attr
      const tempClass = target.className.replace(activeClass, '').trim()
      const className = ( tempClass ) ? `.${tempClass.replace(' ','.')}` : ''
      const query = `${tag}${( id ) ? '#'+id : ''}${className}`
      const elements = document.querySelectorAll(query)

      // what number, the active class in elements
      const index = Object.keys(elements).find(
        key => elements[key].classList.contains(activeClass)
      );

      return {tag, id, name, className, index}
  }

  // clear colored element at right clicked
  document.oncontextmenu = () => {
    clearActiveElement()
    return false // not display context menu
  }

  window.addEventListener('message', event => {
    const postMessageWithTargetSelector = (type, target) => {
      console.log(type, target, event.origin)
      event.source.postMessage(
        { type, target: createTarget(target) }, event.origin
      )
    }
    switch( event.data.type ) {
      case 'init':
        document.body.addEventListener(
          'click',
          event => {
            clearActiveElement()
            event.target.classList.add(activeClass)
            postMessageWithTargetSelector('click', event.target )
          },
          true
        )
      case 'clear':
        clearActiveElement()
        break;
      case 'get':
        const elem = document.body.getElementsByClassName(activeClass)
        if( elem.length === 1){
          window.scrollTo(0, elem[0].getBoundingClientRect().top)
          postMessageWithTargetSelector('get', elem[0] )
        }
        break;
      case 'activate':
        // remove activate class on already activated element
        clearActiveElement()
        //
        const data = event.data.data
        const query = data.tag
                    + (data.id) ? `#${data.id}` : ''
                    + (data.class) ? `.${data.class.replace(' ','.')}` : ''
        const elems = document.querySelectorAll(query)
        if (elems[data.index] != null) {
          elems[data.index].classList.add(activeClass)
        }
        break;
      default:
        console.error(event)
        break;
    }
  }, false )
});