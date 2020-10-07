<template lang="pug">
  .container-fluid.pt-2.pb-1
    .row
      .col-12
        .row
          .col-12.mb-1
            .input-group
              input.form-control(
                type="text"
                placeholder="Target URL"
                v-model="sceneData.url"
              )
              .input-group-append
                button.btn.btn-primary(@click="getTargetSite")
                  font-awesome-icon.mr-2(icon="file-download")
                  | GET
          .col-12.mb-1
            iframe.w-100.border.border-info.rounded(
              type  = "text/html"
              :id   = "iframeId"
              :src  = "iframeSource"
              @load = "iframeLoaded"
            )
      .col-12
        ActionSequence(
          :sequence-list = "sceneData.actions"
        )
    TargetContextMenu(
      :pos-x = "contextPosX",
      :pos-y = "contextPosY",
      :base-id = "iframeId"
      :active-element = "activeElement"
      @parent="selectParentNode"
      @clear="clearNode"
      @temporary="setTemporaryActionSequence"
      @add="addActionSequence"
    )
</template>

<script>
import Modal from '~/components/common/BaseModal.vue'
import ActionSequence from '@/components/scenario/ActionSequence.vue'
import TargetContextMenu from '~/components/scenario/TargetContextMenu.vue'

export default {
  name: 'SceneForm',
  components: {
    Modal, TargetContextMenu, ActionSequence
  },
  props: {
    sceneData: {
      type: Object,
      default: () => {}
    }
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
      iframeId: 'iframeId',
      iframeTitle: null,
      iframeSource: null,
      isIframeLoaded: false,
      scrapingApiUrl: '/temporary',
      temporaryActionSequence: null,
      // target modal
      visibleActionModal: false,
      contextPosX: 0,
      contextPosY: 0
    }
  },
  mounted () {
    // postMessage from iframe
    window.addEventListener('message', (event) => {
      try {
        if (typeof event.data === 'object') {
          const json = event.data
          switch (json.type) {
            case 'get':
              // 既存のアクティブタブを解除
              this.activeElement = Object.assign({}, json.target)
              break
            case 'activate':
            case 'parent':
              this.activeElement = Object.assign({}, json.target)
              break
            case 'title':
              this.iframeTitle = json.data
              break
            case 'context':
              this.contextPosX = parseInt(json.target.x)
              this.contextPosY = parseInt(json.target.y)
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

        if (this.sceneData.url == null) {
          throw new Error('Input URL')
        }
        if (!this.sceneData.url.match(reg)) {
          throw new Error('Begin the URL with http or https')
        }

        this.isIframeLoaded = false
        this.$lock('Scraping HTML...')
        const targetUrl = `${this.scrapingApiUrl}/?url=${this.sceneData.url}`
        this.$axios.get(targetUrl)
          .then((res) => {
            if (res.status !== 200) {
              throw new Error('error')
            }
            console.log(res)
            this.iframeSource = `/data/temporary/${res.data.result.dirName}/`
            this.sceneData.dir = res.data.result.dirName
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
      console.log(messageObject, targetOrigin)
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
      this.$emit('message', 3, message)
    },
    setInformationMessage (message) {
      this.$emit('message', 1, message)
    },
    addTargetNode (element) {
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
      this._postMessage({ type: 'parent' }, '*')
    },
    clearNode (element) {
      this.activeElement = Object.assign({
        tag: null,
        id: null,
        className: null,
        name: null,
        index: null
      }, {})
      this.temporaryActionSequence = null
      this._postMessage({ type: 'clear' }, '*')
    },
    setTemporaryActionSequence (value) {
      this.temporaryActionSequence = value
    },
    addActionSequence (event) {
      if (this.temporaryActionSequence != null) {
        const seq = Object.assign(this.temporaryActionSequence, { element: this.activeElement })
        this.sceneData.actions.push(seq)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .modal-container {
    iframe{
      height: 65vh;
    }
  }
  .active-element li {
    background-color: #5fbfce;
    border-radius: 0.5em;
    margin-right: .5em;
    padding: 0 0.25em;
  }
</style>
