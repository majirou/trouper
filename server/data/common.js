/**
 * this script was inserted, when scraped and localized
 */
document.addEventListener('DOMContentLoaded', () => {
  const activeClass = 'iframe-active'

  // clear colored element(remove active class)
  const clearActiveElement = () => {
    const elems = document.getElementsByClassName(activeClass)
    elems.forEach(elem => {
      elem.classList.remove(activeClass)
    })
  }

  // clear colored element at right clicked
  document.oncontextmenu = () => {
    clearActiveElement()
    return false // not display context menu
  }

  window.addEventListener('message', event => {
    const postMessageWithTargetSelector = (type, target) => {
      event.source.postMessage(
        { type, data: createTarget(target) }, event.origin
      )
    }
    // response to origin
    // let elem = null
    // const type = event.data.type
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
        elems[data.index].classList.add(activeClass)
        break;
      default:
        console.error(event)
        break;
    }
  }, false )
});