<template lang="pug">
  div.container-fluid
    ul.nav.nav-tabs
      li.nav-item
        input#tab-page( type="radio" value="1" v-model="tabId")
        label.nav-link( :class="{active: isActiveTab(1)}" for="tab-page") ページ
      li.nav-item
        input#tab-part( type="radio" value="2" v-model="tabId")
        label.nav-link( :class="{active: isActiveTab(2)}" for="tab-part") 部分
      li.nav-item
        input#tab-image( type="radio" value="3" v-model="tabId")
        label.nav-link( :class="{active: isActiveTab(3)}" for="tab-image") 画像
      li.nav-item.ml-auto.mr-0
        label.nav-link.active {{scenarioName}}
    PageDiffPanel(
      v-show="isActiveTab(1)"
      :style="{height: panelHeight}"
      :currTarget="targetSchedule"
      :prevTarget="previousSchedule"
      :currTimestamp="targetTimestamp"
      :prevTimestamp="previousTimestamp"
      :fileName="pageDiffFileName"
    )
    // テキスト部分差分
    PartDiffPanel(
      v-show="isActiveTab(2)"
      :style="{height: panelHeight}"
      :currTarget="targetSchedule"
      :prevTarget="previousSchedule"
      :currTimestamp="targetTimestamp"
      :prevTimestamp="previousTimestamp"
      :fileName="partDiffFileName"
    )
    // 画像差分
    DiffImage(
      v-show="isActiveTab(3)"
      :style="{height: panelHeight}"
      :currTarget="targetSchedule"
      :prevTarget="previousSchedule"
      :currTimestamp="targetTimestamp"
      :prevTimestamp="previousTimestamp"
      :fileName="imageDiffFileName"
    )

    RedoDiffDialog(:showDialog="showDialog" @cancel="closeDialog" @ok="doDiff")
      div(slot="header")
        i.fas.fa-question-circle.mr-2
        | 再差分生成確認
      div(slot="body" v-html="this.getDialogMessage()")
      span(slot="ok")
        i.fas.fa-check-circle.mr-2
        | OK
    ErrorDialog(:showDialog="showErrorDialog")
      div(slot="header")
        i.fas.fa-exclamation-triangle.mr-2
        | エラー
      div(slot="body")
        ul
          li(v-for="(v,i) in errors" :key="i") {{v}}
      div(slot="footer")
        div.d-flex
          button.btn.btn-primary.mr-0.ml-auto(@click="closeErrorDialog")
            i.fas.fa-check-circle.mr-2
            | OK
</template>

<script>
import CommonDialog from '@/components/common/CommonDialog'
import DiffPanel from '@/components/review/ReviewFormDiff'
import DiffImage from '@/components/review/ReviewFormImage'
// import { Diff2Html } from 'diff2html'
import 'diff2html/dist/diff2html.min.css'

var axios = require('axios')

export default {
  name: 'ReviewForm',
  components: {
    'RedoDiffDialog': CommonDialog,
    'ErrorDialog': CommonDialog,
    'PageDiffPanel': DiffPanel,
    'PartDiffPanel': DiffPanel,
    DiffImage
  },
  data () {
    return {
      tabId: 1,
      targetSchedule: null,
      previousSchedule: null,
      errors: [],
      showDialog: false,
      showErrorDialog: false,
      scenarioName: null,
      pageDiffFileName: 'index.html',
      partDiffFileName: 'parts.html',
      imageDiffFileName: 'screenshot.png',
      targetTimestamp: null,
      previousTimestamp: null
    }
  },
  props: ['scenarioId', 'newId', 'oldId', 'panelHeight'],
  methods: {
    isActiveTab: function (id) {
      return (parseInt(this.tabId) === id)
    },
    getRecentlySchedule: function (id) {
      const targetUrl = `${this.$apiUrl}/schedules/${id}/recent`
      axios.get(targetUrl)
        .then(res => {
          console.log(res)
          if (res.status !== 200) {
            throw new Error('正しいデータを取得できませんでした')
          }
          if (res.data.length === 1) {
            throw new Error('スクレイピング結果が１件しかありません。')
          }
          return res.data
        })
        .then(data => {
          this.targetSchedule = data[0]
          this.previousSchedule = data[1]

          this.targetTimestamp = this.formatDatetime(data[0].saveDir)
          this.previousTimestamp = this.formatDatetime(data[1].saveDir)
        })
        .catch(err => {
          this.errors.push(err.message)
          this.showErrorDialog = true
          console.error(err)
        })
    },
    getScenario: function (id) {
      this.scenario = null
      if (id) {
        const targetUrl = `${this.$apiUrl}/scenario?id=${id}`
        axios.get(targetUrl)
          .then((res) => {
            console.log(res)
            if (res.status !== 200) throw new Error('データを取得できませんでした')

            this.scenario = res.data
            this.scenarioName = res.data.name
          })
          .catch(err => console.error(err))
      }
    },
    getSchedule: function (id) {
      const targetUrl = `${this.$apiUrl}/schedule/${this.scenarioId}/${id}`
      axios.get(targetUrl)
        .then(res => {
          console.log(res)
          if (res.status === 200) {
            return res.data
          } else {
            // this.registeringErrors = res.data.error
            throw new Error('error')
          }
        })
        .then((data) => {
          console.log(data)
        })
        .catch((err) => {
          // handle error
          console.log(err)
        })
    },
    getDialogMessage: function () {
      return `差分ファイルが見つからなかったので、再作成しますか？`
    },
    closeDialog: function () { this.showDialog = false },
    closeErrorDialog: function () { this.showErrorDialog = false },
    doDiff: function (event) {
      this.$lock('再差分作成中...')
      const ret = {
        scenarioId: this.scenarioId,
        before: this.previousSchedule.saveDir,
        after: this.targetSchedule.saveDir
      }
      const url = `${this.$apiUrl}/diff`
      axios
        .post(url, ret)
        .then(res => {
          if (res.status !== 200) throw new Error('error')
          this.showDialog = false
        })
        .catch(err => console.error(err))
        .then(() => this.$unlock())
    },
    formatDatetime: function (str) {
      // 2019,01,14,07,20,57
      if (str) {
        return str.substring(0, 4) + '-' +
              str.substring(4, 6) + '-' +
              str.substring(6, 8) + ' ' +
              str.substring(8, 10) + ':' +
              str.substring(10, 12) + ':' +
              str.substring(12, 14)
      } else {
        return null
      }
    },
    openLink: function (url, blank) {
      if (blank) {
        window.open(url, '_blank')
      } else {
        location.href = url
      }
    }
  },
  watch: {
    scenarioId: function () {
      this.getRecentlySchedule(this.scenarioId)
      this.getScenario(this.scenarioId)
    }
  }
}
</script>

<style lang="scss" scoped>
.nav{
  li{
    &:last-child{
      label{
        background-color: #dee2e6;
        width: auto;
        &:hover{
          background-color: #dee2e6;
        }
      }
    }
    label {
      text-align: center;
      margin-bottom: 0px !important;
      border-bottom: none;
      width: 6em;
      font-size:.75em;
      cursor: pointer;
      &:hover{
        background-color:#FFF;
      }
    }
  }
  input {
    display: none;
    &:checked + label {
      background-color: #FFF;
    }
  }
}
</style>