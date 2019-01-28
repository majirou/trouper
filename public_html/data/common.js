document.addEventListener('DOMContentLoaded', function() {
    var activeClass = 'iframe-active'
    var createTarget = ( target ) => {
        const id = (target.id ) ? target.id : ''
        const name = (target.name) ? target.name : ''
        const tag = (target.localName ) ? target.localName : ''
        // class要素がある場合は一旦取り出し、ばらす。アクティブ部分は除く。
        const tempClass = target.className.replace(activeClass, '').trim()
        let className = ''
        let index = 0

        const query = tag
                    + ( ( id ) ? '#'+id : '' )
                    + ( ( className ) ? '.'+className.replace(' ','.') : '' )
        const elements = document.querySelectorAll(query)

        // アクティブなクラスが何番目になるかをループし格納
        for (let i in elements) {
          if (elements.hasOwnProperty(i) && elements[i].classList.contains(activeClass)) {
            index = i
            break
          }
        }
        const ret = {
            tag: tag,
            id: id,
            name: name,
            className: className,
            index: index
        }
        return ret ;
    }
    // 右クリック
    document.oncontextmenu = function(){
        const elems = document.getElementsByClassName(activeClass);
        for (let i in elems) {
            if (elems.hasOwnProperty(i)) {
                elems[i].classList.remove(activeClass)
            }
        }
        return false  //標準の右クリックメニューを表示しない
    }

    // メッセージ受信イベント
    window.addEventListener('message', event => {
        var responseSelectorMessage = (type, target)=> {
            const ret = {
                type,
                data: createTarget( target )
            }
            // console.log(ret)
            // postMessage
            event.source.postMessage( ret , event.origin )
        }
        var clearActive = () => {
            const elems = document.getElementsByClassName(activeClass)
            for (let i in elems) {
                if (elems.hasOwnProperty(i)) {
                    elems[i].classList.remove(activeClass)
                }
            }
        }
        // メッセージ送信元のサイトに返答する
        let elem = null
        const json = event.data

        switch( json.type ) {
            /*
            case 'scroll':
                // scroll イベントを追加
                document.addEventListener(
                    'scroll',
                    () => {
                        // console.log(event, window.location.href)
                        event.source.postMessage(
                            {
                                type: 'scrolled',
                                data: { 
                                    x: window.pageXOffset, 
                                    y: window.pageYOffset,
                                    href: window.location.href
                                }
                            },
                            event.origin
                        )
                    },
                    true
                )
                break;
            case 'scrollTo':
                if( window.pageYOffset !== json.data.y || 
                    window.pageXOffset !== json.data.x
                    ){
                    window.scrollTo(json.data.x, json.data.y)
                }
                break
            */
            case 'init':
                // click イベントを追加
                document.body.addEventListener(
                    'click',
                    event => {
                        // クリック時のクリア処理
                        clearActive()
                        // 現クリック先をアクティブにする
                        event.target.classList.add( activeClass )
                        // クリックした際のセレクターを返答する
                        responseSelectorMessage('click', event.target )
                    },
                    true
                )
            case 'clear':
                clearActive()
                break;
            case 'get':
                elem = document.body.getElementsByClassName(activeClass)
                if( elem.length === 1){
                    // console.log("get", elem[0].getBoundingClientRect().top)
                    scrollTo(0,elem[0].getBoundingClientRect().top)
                    responseSelectorMessage('get', elem[0] )
                }
                break;
            case 'title':
                elem = document.head.getElementsByTagName('title')
                if( elem.length > 0 ){
                    event.source.postMessage(
                        { type: 'title', data: elem[0].innerText },
                        event.origin
                    )
                }
                break;
            case 'parent':
                elem = document.body.getElementsByClassName(activeClass)
                if (elem.length === 1) {
                    const parent = elem[0].parentNode
                    // すでにアクティブ化しているクラスを外す
                    clearActive()
                    // 現クリック先の親をアクティブにする
                    parent.classList.add(activeClass)
                    // クリックした際のセレクターを取得する
                    responseSelectorMessage('parent', parent )
                }
                break;
            case 'activate':
                // すでにアクティブ化しているクラスを外す
                clearActive()
                const query = json.data.tag
                            + ( ( json.data.id ) ? '#'+json.data.id : '' )
                            + ( ( json.data.class ) ? '.'+json.data.class.replace(' ','.') : '' )
                const elems = document.querySelectorAll(query)
                elems[json.data.index].classList.add(activeClass)
                break;
            default:
                console.error(event)
                break;
        }
    }, false )
});