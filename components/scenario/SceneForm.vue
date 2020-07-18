<template lang="pug">
  .container-fluid.pt-2.pb-1
    .row
      .col-11.pr-2
        .row
          .col-12.mb-1
            .input-group
              input.form-control(
                type="text"
                placeholder="Target URL"
                v-model="targetUrl"
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
            .row
              .col-11
                .row
                  .col-12
                    ActiveElement(
                      :element="activeElement"
                      @add="registerTargetNode"
                      @parent="selectParentNode"
                      @clear="clearNode"
                      :disable="!isIframeLoaded"
                    )
                  .col-12
                    ActionForm.mt-1.w-auto(
                      :element="activeElement"
                      @change="setTemporaryActionSequence"
                      :disbled="!iframeLoaded"
                    )
              .col-1.pl-0
                button.btn.btn-primary.h-100.w-100.px-1(
                  @click="addActionSequence"
                  :disabled="!temporaryActionSequence"
                )
                  font-awesome-icon.mr-2(icon="plus")
                  | ADD
      .col-1
        .row.rounded-0.h-100
          .col-12.pl-0
            ActionSequence(
              :sequence-list = "actionSequence"
            )
</template>

<script>
import ActionForm from '@/components/scenario/ActionForm.vue'
import ActiveElement from '@/components/scenario/ActiveElement.vue'
import ActionSequence from '@/components/scenario/ActionSequence.vue'

// import ScheduleForm from '@/components/scenario/ScheduleForm.vue'

export default {
  name: 'SceneForm',
  components: {
    // ActiveElement, RegisteredElements, ScheduleForm
    ActionForm, ActiveElement, ActionSequence
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
      scheduleData: {
        name: null,
        date: null,
        interval: 1,
        notification: [1],
        mail: null
      },
      targetUrl: null,
      iframeId: 'iframeId',
      iframeTitle: null,
      iframeSource: null,
      isIframeLoaded: false,
      scrapingApiUrl: '/temporary',
      registerApiUrl: '/program',
      temporaryActionSequence: null,
      actionSequence: []
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
            case 'click':
            case 'parent':
              this.activeElement = Object.assign({}, json.target)
              break
            case 'title':
              this.iframeTitle = json.data
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
        this.$lock('Scraping HTML...')
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
      this.$emit('message', 3, message)
    },
    setInformationMessage (message) {
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
      this._postMessage({ type: 'parent' }, '*')
    },
    clearNode (element) {
      this.temporaryActionSequence = null
      this._postMessage({ type: 'clear' }, '*')
    },
    register () {
      const postData = {
        url: this.targetUrl,
        schedule: this.scheduleData,
        elements: this.registeredElementList
      }
      this.$lock(`登録中...`)
      this.$axios
        .post(this.registerApiUrl, postData)
        .then((res) => {
          if (res.status !== 200) {
            throw new Error('request error')
          }
          if (res.data == null || !res.data.result) {
            throw new Error(`error: ${res.data.message}`)
          }
          this.$emit('message', 1, 'registered')
          this.$emit('close')
        })
        .catch((err) => {
          this.setWarningMessage(err.message)
          console.error(err)
        })
        .finally(() => {
          this.$unlock()
        })
    },
    setTemporaryActionSequence (value) {
      this.temporaryActionSequence = value
    },
    addActionSequence (event) {
      const seq = Object.assign(this.temporaryActionSequence, { element: this.activeElement })
      this.actionSequence.push(seq)
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
