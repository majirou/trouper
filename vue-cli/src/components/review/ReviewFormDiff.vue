<template lang="pug">
  section.diff-panel.p-2.border.border-gray.border-top-0
    .d-flex(:class="{adjuster: closeDiffPanelFlag===0}")
      .w-100.mr-1(v-show="expandIframeFlag!==2")
        .mb-1.d-flex.justify-content-start
          i.btn.fas.fa-chevron-left.fa-fw(@click="contractIframe()" v-show="expandIframeFlag===1")
          i.btn.fas.fa-chevron-right.fa-fw(@click="expandIframe(1)" v-show="expandIframeFlag===0")
          i.btn.fas.fa-chevron-up.fa-fw(@click="openDiffPanel()" v-show="closeDiffPanelFlag!==0")
          i.btn.fas.fa-chevron-down.fa-fw(@click="closeDiffPanel(1)" v-show="closeDiffPanelFlag===0")
          .ml-auto.mr-0
            i.btn.fas.fa-external-link-alt.mr-2(@click="openLink(prevIframeSource,true)")
            span.old.rounded.px-2 {{prevTimestamp}}
      .w-100(v-show="expandIframeFlag!==1")
        .mb-1.d-flex.justify-content-start
          i.btn.fas.fa-chevron-right.fa-fw(@click="contractIframe()" v-show="expandIframeFlag===2")
          i.btn.fas.fa-chevron-left.fa-fw(@click="expandIframe(2)" v-show="expandIframeFlag===0")
          i.btn.fas.fa-chevron-up.fa-fw(@click="openDiffPanel()" v-show="closeDiffPanelFlag!==0")
          i.btn.fas.fa-chevron-down.fa-fw(@click="closeDiffPanel(2)" v-show="closeDiffPanelFlag===0")
          .ml-auto.mr-0
            i.btn.fas.fa-external-link-alt.mr-2(@click="openLink(currIframeSource,true)")
            span.new.rounded.px-2 {{currTimestamp}}
    transition(name="fade")
      .d-flex.justify-content-between.h-100
        transition(name="fade")
          .w-100.mr-1(v-show="expandIframeFlag!==2")
            iframe.w-100.h-100.border.border-gray(
              :src="prevIframeSource"
              @load="iframeLoaded"
              :id="prevIframeId"
            )
        transition(name="fade")
          .w-100(v-show="expandIframeFlag!==1")
            iframe.w-100.h-100.border.border-gray(
              :src="currIframeSource"
              @load="iframeLoaded"
              :id="currIframeId"
            )
    transition(name="fade")
      .bg-white(
        v-show="closeDiffPanelFlag===0"
        style="z-index:10000"
        v-html="diff2htmlPanel"
      )
</template>

<script>
import { Diff2Html } from 'diff2html'
import 'diff2html/dist/diff2html.min.css'

var axios = require('axios')

export default {
  name: 'ReviewFormDiff',
  data () {
    return {
      closeDiffPanelFlag: 0, // 差分パネルの開閉フラグ
      expandIframeFlag: 0,
      currIframeSource: null,
      prevIframeSource: null,
      diff2htmlPanel: null, // diff2html用ページ差分
      iframeScrollX: 0, // for sync iframe scroll
      iframeScrollY: 0,
      prevIframeId: null, // createIframeId('pref', prevTarget),
      currIframeId: null // createIframeId('curr', currTarget)
    }
  },
  props: ['currTarget', 'prevTarget', 'fileName', 'currTimestamp', 'prevTimestamp'],
  methods: {
    getDiffHtml: function () {
      const type = (this.fileName === 'index.html') ? 1 : 2
      const targetUrl = `${this.$apiUrl}/diff/` +
                        `?id=${this.currTarget.scenarioId}` +
                        `&after=${this.currTarget.saveDir}` +
                        `&before=${this.prevTarget.saveDir}` +
                        `&type=${type}`
      axios.get(targetUrl)
        .then(res => {
          if (res.status === 200) {
            return res.data
          } else {
            // this.registeringErrors = res.data.error
            throw new Error('error')
          }
        })
        .then(data => {
          const option = {
            inputFormat: 'diff',
            showFiles: true,
            matching: 'lines',
            outputFormat: 'side-by-side'
          }
          this.diff2htmlPanel = Diff2Html.getPrettyHtml(data, option)
        })
        .catch(err => {
          if (err.response.status === 404) {
            this.errors.push(err.response.config.url + ' is not found')
            this.showDialog = true
          } else {
            console.error(err)
          }
        })
    },
    expandIframe: function (num) {
      switch (num) {
        case 1:
          this.expandIframeFlag = 1
          break
        case 2:
          this.expandIframeFlag = 2
          break
      }
    },
    contractIframe: function () {
      this.expandIframeFlag = 0
    },
    closeDiffPanel: function (num) {
      switch (num) {
        case 1:
          this.closeDiffPanelFlag = 1
          break
        case 2:
          this.closeDiffPanelFlag = 2
          break
      }
    },
    openDiffPanel: function () {
      this.closeDiffPanelFlag = 0
    },
    openLink: function (url, blank) {
      if (blank) {
        window.open(url, '_blank')
      } else {
        location.href = url
      }
    },
    iframeLoaded: function (event) {
      event.target.contentWindow.addEventListener('scroll', (e) => {
        // console.log(e)
        this.scrollSyncFrom(
          e.currentTarget.frameElement.id,
          e.target.body.scrollLeft,
          e.target.body.scrollTop
        )
      })
    },
    createIframeId (prefix, target) {
      return (target != null && target.saveDir) ? `${prefix}${target.saveDir}` + this.fileName.split('.')[0] : null
    },
    scrollSyncFrom (fromId, x, y) {
      // console.log(fromId, x, y)
      switch (fromId) {
        case this.currIframeId:
          // scroll prev iframe
          document.getElementById(this.prevIframeId).contentWindow.scrollTo(x, y)
          break
        case this.prevIframeId:
          // scroll prev iframe
          document.getElementById(this.currIframeId).contentWindow.scrollTo(x, y)
          break
        default:
          break
      }
    }
  },
  computed: {
    enableDiff: function () {
      return (this.currIframeSource != null && this.prevIframeSource != null)
    }
  },
  watch: {
    currTarget: function () {
      this.currIframeSource = `${this.$dataUrl}/scenario/` +
                            `${this.currTarget.scenarioId}/` +
                            `${this.currTarget.saveDir}/` +
                            `${this.fileName}`
      this.currIframeId = this.createIframeId('curr', this.currTarget)
    },
    prevTarget: function () {
      this.prevIframeSource = `${this.$dataUrl}/scenario/` +
                            `${this.prevTarget.scenarioId}/` +
                            `${this.prevTarget.saveDir}/` +
                            `${this.fileName}`
      this.prevIframeId = this.createIframeId('prev', this.prevTarget)
    },
    enableDiff: function () {
      if (this.enableDiff) this.getDiffHtml()
    }
  }
}
</script>

<style lang="scss" scoped>
.old{
  background-color: #e9aeae;
}
.new{
  background-color: #b4e2b4;
}
.diff-panel{
  overflow: scroll;
  display: flex;
  flex-direction: column;
  .adjuster{
    margin-bottom: 11px;
  }
  .disable {
    opacity: .25;
    cursor: not-allowed;
  }
}
.fade-enter-active ,
.fade-leave-active {
  transition: width .25s ease-in, opacity .25s ease-out;
}
.fade-leave ,fade-enter-to{
  opacity: 1;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
  width: 0% !important;
}
.fa-fw {
  padding-top: .25em;
}
</style>

<style lang="scss">
.d2h-files-diff{
  overflow: scroll;
  height: 12em;
}
.d2h-file-list-wrapper{
  display: none;
}
.d2h-file-header{
  display: none;
}
.d2h-file-wrapper{
  margin-bottom:0;
  margin-top:.5em;
  border-left: none;
}
</style>
