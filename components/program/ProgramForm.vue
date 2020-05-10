<template lang="pug">
  .container-fluid.py-3
    .row(v-show="isStep(0)")
      .col-12.mb-1
        .input-group
          input.form-control(
            type="text"
            placeholder="スクレイプ対象URL"
            v-model="targetUrl"
          )
          .input-group-append
            button.btn.btn-primary(@click="getTargetSite")
              font-awesome-icon.mr-2(icon="file-download")
              | 取得
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
      .col-1.pl-2
        button.btn.btn-warning.h-100.w-100.px-1(@click="nextStep")
          font-awesome-icon.mr-2(icon="chevron-circle-down")
          | 次へ
    .row(v-show="isStep(1)")
      .col-11.mb-3
      .col-1.mb-3
        button.btn.btn-sm.btn-secondary.h-100.w-100(@click="backStep")
          font-awesome-icon.mr-2(icon="chevron-circle-up")
          | 戻る
      .col-12.mb-1
        .input-group
          .input-group-prepend
            span.input-group-text(style="padding:0 1.25em;") 対象URL
          input.form-control(
            type="text"
            :value="targetUrl"
          )
      .col-12
        RegisteredElements(
          :elems="registeredElementList"
        )
      .col-12
        ScheduleForm(
          :page-title="iframeTitle"
          :schedule-data="scheduleData"
        )
      .col-11
      .col-12.text-center.mt-3
        button.btn.btn-lg.btn-warning.h-100(@click="register")
          font-awesome-icon.mr-2(icon="save")
          | 上記内容で登録する
</template>

<script>
import ActiveElement from '@/components/program/ActiveElement.vue'
import RegisteredElements from '@/components/program/RegisteredElements.vue'
import ScheduleForm from '@/components/program/ScheduleForm.vue'

export default {
  name: 'ProgramForm',
  components: {
    ActiveElement, RegisteredElements, ScheduleForm
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
      step: 0
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
    isStep (num) {
      return this.step === parseInt(num)
    },
    backStep () {
      this.step--
    },
    nextStep () {
      this.step++
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
