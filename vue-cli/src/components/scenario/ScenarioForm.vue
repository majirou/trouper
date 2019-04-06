<template lang="pug">
  main.container-fluid
    div.row
      div.col-12
        div.input-group.mb-3
          input.form-control(type="text" placeholder="スクレイプ対象URL" v-model="url")
          div.input-group-append
            button.btn.btn-primary(@click="getTargetSite") 取得
      div.col-12.vh-100
        div.active-element.h-75
          div.card
            div.card-header.py-1 選択中の要素
            div.card-body.p-1
              div.card-title {{removeProtocolAndDomain(iframeSource)}}
              ul
                li TAG: {{activeElement.tag}}
                li ID: {{activeElement.id}}
                li CLASS: {{activeElement.className}}
                li NAME: {{activeElement.name}}
                li INDEX: {{activeElement.index}}
              .d-flex.mb-1
                button.btn.btn-sm.btn-primary.w-100.mr-1(@click="registerTarget") ウォッチ
                button.btn.btn-sm.border-primary.bg-white.w-100.mr-1(@click="selectParentNode") 親選択
                button.btn.btn-sm.border-primary.bg-white.w-100.mr-1(@click="clearWatched") 解除
            //-
              .d-flex
                button.btn.btn-sm.border-primary.bg-white.w-100.mr-1(@click="hideSelected") 隠す
                button.btn.btn-sm.border-primary.bg-white.w-100.mr-1(@click="showHiddenElements") 表示
          div.card.mt-2
            div.card-header.py-1 ウォッチリスト
            div.card-body.p-1(style="min-height:8em;")
                ul.p-1
                    li.badge.badge-primary.mr-1.mb-1(
                      v-for  = "(v,i) in registeredList"
                      @click = "activateRegisteredContents(i,v,$event) "
                      :key   = "i"
                    )
                      i.fas.fa-tag.mr-1
                      | {{i}}:{{v.tag}}
                      i.fas.fa-trash.ml-2(@click.stop="removeTarget(i,v)")
          div.w-100(style="position: absolute;bottom: 0;")
            button.btn.btn-primary.w-100(@click="popupScenario") シナリオ{{this.registerType}}
        iframe.w-100.h-100.border.border-info.rounded(
          type  = "text/html"
          :id   = "iframeId"
          :src  = "iframeSource"
          @load = "iframeLoaded"
        )
    scenarioModal(
      :showModal="showModal"
      :url="url"
      :siteTitle="iframeTitle"
      :registeringErrors="registeringErrors"
      :dir="removeProtocolAndDomain(iframeSource)"
      :scenario="scenario"
      :type="registerType"
      @save="registerScenario"
      @close="showModal=false"
    )
    alertModal(:showDialog="showAlertModal")
      div.text-danger(slot="header")
        i.fas.fa-exclamation-triangle.mr-2
        | スクレイピングエラー
      div(slot="body") {{alertMessage}}
      div.text-right(slot="footer")
        span.btn.btn-primary(@click="alertMessage=null") OK
</template>

<script>
import scenarioModal from '@/components/scenario/ScenarioModal'
import commonDialog from '@/components/common/CommonDialog'
var axios = require('axios')

export default {
  components: {
    scenarioModal,
    'alertModal': commonDialog
  },
  props: ['scenarioId'],
  name: 'Scenario',
  data () {
    return {
      url: null,
      scrapedUrl: null,
      scrapingApiUrl: this.$apiUrl + '/scrape',
      registerApiUrl: this.$apiUrl + '/scenario',
      getApiUrl: this.$apiUrl + '/scenario',
      iframeSource: null,
      iframeTitle: null,
      iframeId: 'crawled-result',
      iframeRegisteredClass: 'iframe-registered',
      iframeActiveClass: 'iframe-active',
      activeElement: {
        tag: null,
        id: null,
        className: null,
        name: null,
        index: null
      },
      registeredList: [],
      registeredScenario: null,
      registeringErrors: [],
      activeTagClass: 'active-tag',
      showModal: false,
      scenario: null,
      registerType: '登録',
      alertMessage: null
    }
  },
  computed: {
    showAlertModal: function () {
      // console.log(this.alertMessage, typeof this.alertMessage)
      return (this.alertMessage)
    }
  },
  methods: {
    getTargetSite: function () {
      try {
        var reg = new RegExp("((https?|ftp)(://[-_.!~*'()a-zA-Z0-9;/?:@&=+$,%#]+))")

        if (!this.url) throw new Error('URLを入力してください')
        if (!this.url.match(reg)) throw new Error('http://〜 または、https://〜 の形式でURLを入力してください')

        this.$lock('HTML取得中...')
        const targetUrl = this.scrapingApiUrl + '?url=' + this.url

        axios.get(targetUrl)
          .then((res) => {
            if (res.status !== 200) throw new Error('error')

            this.iframeSource = this.$dataUrl + '/tmp/' + res.data.result
            this.scrapedUrl = this.url
          })
          .catch((err) => {
            this.alertMessage = err.message
            console.error(err)
            this.$unlock()
          })
      } catch (err) {
        this.alertMessage = err.message
        console.error(err)
        this.$unlock()
      }
    },
    iframeLoaded: function () {
      if (document.getElementById(this.iframeId).src) {
        // postMessageにて、iframeとのやりとりを実現する
        document.getElementById(this.iframeId)
          .contentWindow
          // .postMessage({ type: 'init' }, this.iframeSource)
          .postMessage({ type: 'init' }, '*')
        this.$unlock()
      } else {
        console.error('iframe source is empty')
      }
    },
    removeProtocolAndDomain: path => {
      return (path != null && path.length > 0) ? path.split('/').pop() : null
    },
    clearActiveTag: function () {
      const elems = document.getElementsByClassName(this.activeTagClass)
      for (let i in elems) {
        if (elems.hasOwnProperty(i)) {
          elems[i].classList.remove(this.activeTagClass)
        }
      }
    },
    clearWatched () {
      this.clearActiveTag()
      document.getElementById(this.iframeId)
        .contentWindow
        .postMessage({ type: 'clear' }, '*')
    },
    hideSelected () {

    },
    showHiddenElements () {

    },
    activateRegisteredContents: function (index, value, event) {
      this.clearActiveTag()
      // console.log('activateRegisteredContents', index, value, event)
      // iframe にメッセージを送りアクティブ化
      document.getElementById(this.iframeId)
        .contentWindow
        // .postMessage(msg, this.iframeSource)
        .postMessage({ type: 'activate', data: value }, '*')
      // 再度アクティブになった要素を activeElementへ
      document.getElementById(this.iframeId)
        .contentWindow
        // .postMessage({ type: 'get' }, this.iframeSource)
        .postMessage({ type: 'get' }, '*')
      event.currentTarget.classList.add(this.activeTagClass)
    },
    registerTarget: function () {
      // オブジェクトの重複を調べる処理のためのソーター
      const objectSort = obj => {
        // まずキーのみをソートする
        var keys = Object.keys(obj).sort()
        // 返却する空のオブジェクトを作る
        var map = {}
        // ソート済みのキー順に返却用のオブジェクトに値を格納する
        keys.forEach(key => {
          var val = obj[key]
          // 中身がオブジェクトの場合は再帰呼び出しを行う
          if (typeof val === 'object') val = objectSort(val)
          map[key] = val
        })
        return map
      }
      // アクティブ要素をソーターで整理する
      const active = JSON.stringify(objectSort(this.activeElement))
      let target = null
      const regs = this.registeredList
      let registable = true
      // 登録リストをループし、ソーターで整理し一致するかをチェックする
      for (let i in regs) {
        if (regs.hasOwnProperty(i)) {
          target = JSON.stringify(objectSort(regs[i]))
          if (active === target) {
            registable = false
            break
          }
        }
      }
      if (registable) regs.push(this.activeElement)
    },
    removeTarget: function (index, value) {
      this.registeredList.splice(index, 1)
    },
    selectParentNode: function (event) {
      this.clearActiveTag()
      document.getElementById(this.iframeId)
        .contentWindow
        // .postMessage({ type: 'parent' }, this.iframeSource)
        .postMessage({ type: 'parent' }, '*')
    },
    popupScenario: function (event) {
      // 少なくともurl が入力されていて、iframe上に Loaded されている
      if (this.scrapedUrl != null && this.iframeSource != null) {
        document.getElementById(this.iframeId)
          .contentWindow
          // .postMessage({ type: 'title' }, this.iframeSource)
          .postMessage({ type: 'title' }, '*')
        // popup を表示して、シナリオ登録上必要な情報入力をだす
        this.showModal = true
      }
    },
    registerScenario: function (data) {
      if (data) {
        this.$lock(`${this.registerType}中...`)

        const targetUrl = this.registerApiUrl

        // 登録リストをactionsとしてセット(登録POST,PUT用)
        data.actions = this.registeredList
        if (this.scenarioId) {
          // シナリオIDがある場合はPUTで更新処理
          data.id = this.scenarioId
          console.log(data)
          axios.put(targetUrl, data)
            .then(res => {
              if (res.status === 200 && res.data.error === null) {
                // モーダルを閉じて、更新シナリオIDを返す
                this.showModal = false
                return res.data.id
              } else {
                this.registeringErrors = res.data.error
                throw new Error('error')
              }
            })
            .then(id => {
              // 一時待機の後、メインへ戻る
              setTimeout(this.$router.push('/'), 2000)
            })
            .catch((err) => {
              // handle error
              alert('error')
              console.log(err)
            })
            .then(() => this.$unlock())
        } else {
          // シナリオIDがない場合はPOSTで新規処理
          axios.post(targetUrl, data)
            .then(res => {
              if (res.status === 200 && res.data.error === null) {
                // モーダルを閉じて、新規シナリオIDを返す
                this.showModal = false
                return res.data.id
              } else {
                this.registeringErrors = res.data.error
                throw new Error('error')
              }
            })
            .then(id => {
              // 一時待機の後、メインへ戻る
              setTimeout(this.$router.push('/'), 2000)
            })
            .catch((err) => {
              // handle error
              alert('error')
              console.log(err)
            })
            .then(() => this.$unlock())
        }
      }
    },
    getScenario: function (id) {
      this.scenario = null
      if (id) {
        this.$lock('取得中...')
        const targetUrl = this.getApiUrl + `?id=${id}`
        axios.get(targetUrl)
          .then((res) => {
            // handle success
            if (res.status === 200) {
              this.registeredScenario = res.data
              this.url = res.data.url
              this.scrapedUrl = res.data.url
              this.registeredList = res.data.actions
              this.iframeSource = `${this.$dataUrl}/scenario/${res.data._id}/${res.data.dir}`
              this.scenario = res.data
              // console.log(res.data)
            } else {
              console.log(res)
              throw new Error('error')
            }
          })
          .catch(err => console.log(err))
          .then(() => this.$unlock())
      }
    },
    setIframeTitle: function (title) {
      // console.log(this, this.iframeTitle)
      this.iframeTitle = title
    }
  },
  mounted: function () {
    // メッセージ受信イベント
    window.addEventListener('message', (event) => {
      // console.log('メッセージ受信イベント', event)
      try {
        // const json = JSON.parse(event.data)
        if (typeof event.data === 'object') {
          const json = event.data
          switch (json.type) {
            case 'get':
              // 既存のアクティブタブを解除
              this.activeElement = Object.assign({}, json.data)
              break
            case 'click':
            case 'parent':
              // 既存のアクティブタブを解除
              this.clearActiveTag()
              this.activeElement = Object.assign({}, json.data)
              break
            case 'title':
              if (!this.scenarioId) {
                this.setIframeTitle(json.data)
              }
              break
            default:
              console.log(event)
              break
          }
        }
      } catch (err) {
        console.error(err)
      }
    }, false)
  },
  watch: {
    scenarioId: function () {
      this.getScenario(this.scenarioId)
      this.registerType = '更新'
    }
  }
}
</script>

<style lang="scss" scoped>

.container-fluid{
  padding-right: 30px;
  padding-left: 30px;
}

.active-element{
  position: absolute ;
  left: auto;
  right: 0;
  width: calc( 25% - 15px );
  margin-right: 15px;

  .card{
    z-index: 1000;
  }

  .fa-trash:hover {
    color: red;
    cursor: pointer;
  }

  .badge:hover {
    cursor: pointer;
    color: #fff;
    background-color: #0069d9;
    border-color: #0062cc;
  }

  .active-tag {
    $main-color: #fa6863;
    background-color: $main-color;

    .fa-trash:hover {
      color: darken(red,25%)
    }
    &:hover {
      background-color:darken( $main-color, 25% );
    }
  }
}

iframe{
  transform: scale(0.75);
  transform-origin: top left;
}

main{
  height: 100vh;
}

.vh-100{
  height: 100vh!important;
}
</style>
