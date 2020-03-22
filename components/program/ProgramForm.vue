<template lang="pug">
  .container-fluid.py-3
    .row
      .col-12.mb-1
        .input-group
          input.form-control(
            type="text"
            placeholder="スクレイプ対象URL"
            v-model="targetUrl"
          )
          .input-group-append
            button.btn.btn-primary(@click="getTargetSite") 取得
      .col-12.mb-1
        iframe.w-100.border.border-info.rounded(
          type  = "text/html"
          :id   = "iframeId"
          :src  = "iframeSource"
          @load = "iframeLoaded"
        )
      .col-11.pr-0
        ActiveElement(
          :elem="activeElement"
          @add="registerTargetNode"
          @parent="selectParentNode"
          @clear=""
          :disable="!isIframeLoaded"
        )
        RegisteredElements(
          :elems="registeredElementList"
        )
      .col-1
        button.btn.btn-sm.btn-warning.h-100.w-100
          font-awesome-icon.mr-2(icon="chevron-circle-down")
          | 次へ
</template>

<script>
import ActiveElement from '@/components/program/ActiveElement.vue'
import RegisteredElements from '@/components/program/RegisteredElements.vue'

export default {
  name: 'ProgramForm',
  components: {
    ActiveElement, RegisteredElements
  },
  data () {
    return {
      activeElement: {
        tag: null,
        id: null,
        className: null,
        name: null,
        index: null
      },
      registeredElementList: [],
      name: 'Scenario',
      targetUrl: null,
      iframeId: 'iframeId',
      iframeSource: null,
      isIframeLoaded: false,
      scrapingApiUrl: '/temporary'
    }
  },
  mounted () {
    // postMessage from iframe
    window.addEventListener('message', (event) => {
      // console.log('メッセージ受信イベント', event)
      try {
        if (typeof event.data === 'object') {
          const json = event.data
          switch (json.type) {
            case 'get':
              // 既存のアクティブタブを解除
              this.activeElement = Object.assign({}, json.target)
              break
            case 'click':
            case 'parent':
              this.activeElement = Object.assign({}, json.target)
              break
            case 'title':
              if (!this.scenarioId) {
                this.setIframeTitle(json.target)
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
  methods: {
    getTargetSite () {
      try {
        const reg = new RegExp("((https?)(://[-_.!~*'()a-zA-Z0-9;/?:@&=+$,%#]+))")

        if (this.targetUrl == null) {
          throw new Error('Input URL')
        }
        if (!this.targetUrl.match(reg)) {
          throw new Error('Begin the URL with http or https')
        }

        this.isIframeLoaded = false
        this.$lock('Getting HTML...')
        const targetUrl = `${this.scrapingApiUrl}/?url=${this.targetUrl}`
        console.log('targetUrl', this.scrapingApiUrl, this.targetUrl)
        this.$axios.get(targetUrl)
          .then((res) => {
            if (res.status !== 200) {
              throw new Error('error')
            }
            console.log(res)
            this.iframeSource = `/data/temporary/${res.data.result.dirName}/`
            this.isIframeLoaded = true
            this.$unlock()
          })
          .catch((err) => {
            this.setWarningMessage(err.message)
            console.error(err)
            this.$unlock()
          })
      } catch (err) {
        this.setWarningMessage(err.message)
        console.error(err)
        this.$unlock()
      }
    },
    _postMessage (messageObject, targetOrigin = '*') {
      const iframe = document.getElementById(this.iframeId)
      if (iframe == null || iframe.src == null) {
        throw new Error('iframe source is empty')
      }
      const contentWindow = iframe.contentWindow
      if (iframe.contentWindow == null) {
        throw new Error('iframe content is empty')
      }
      // postMessageにて、iframeとのやりとりを実現する
      contentWindow.postMessage(messageObject, targetOrigin)
    },
    iframeLoaded () {
      try {
        this._postMessage({ type: 'init' }, '*')
      } catch (err) {
        this.setWarningMessage(err.message)
        console.error(err)
      }
    },
    setWarningMessage (message) {
      console.log('setWarningMessage')
      this.$emit('message', 3, message)
    },
    setInformationMessage (message) {
      console.log('setInformationMessage')
      this.$emit('message', 1, message)
    },
    registerTargetNode (element) {
      // check the element is already registered
      const findIndex = this.registeredElementList.findIndex((v) => {
        return (
          v.tag === element.tag &&
          v.id === element.id &&
          v.name === element.name &&
          v.className === element.className &&
          v.index === element.index
        )
      })
      if (findIndex === -1) {
        this.registeredElementList.push(element)
      }
    },
    selectParentNode (element) {
      console.log(element)
    }
  }
}
</script>

<style lang="scss" scoped>
  .modal-container {
    iframe{
      height: 70vh;
    }
  }
  .active-element li {
    background-color: #5fbfce;
    border-radius: 0.5em;
    margin-right: .5em;
    padding: 0 0.25em;
  }
</style>
