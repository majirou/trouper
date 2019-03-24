<template lang="pug">
  .container-fluid
    ul.nav.nav-tabs
      li.nav-item
        input#tab-page( type="radio" value="1" v-model="activeTabId")
        label.nav-link( :class="{active: isActiveTab(1)}" for="tab-page") ページ
      li.nav-item
        input#tab-part( type="radio" value="2" v-model="activeTabId")
        label.nav-link( :class="{active: isActiveTab(2)}" for="tab-part") 部分
      li.nav-item
        input#tab-image( type="radio" value="3" v-model="activeTabId")
        label.nav-link( :class="{active: isActiveTab(3)}" for="tab-image") 画像
      li.nav-item(v-show="!nocompared")
        input#tab-history( type="radio" value="4" v-model="activeTabId")
        label.nav-link( :class="{active: isActiveTab(4)}" for="tab-history") 履歴
      li.nav-item.ml-auto.mr-0
        input#tab-edit( type="radio" value="5" v-model="activeTabId")
        label.nav-link( :class="{active: isActiveTab(5)}" for="tab-edit") {{scenarioName}}
    PageDiffPanel(
      v-show="isActiveTab(1)"
      :style="{height: panelHeight}"
      :currTarget="targetSchedule"
      :prevTarget="previousSchedule"
      :currTimestamp="targetTimestamp"
      :prevTimestamp="previousTimestamp"
      :fileName="pageDiffFileName"
      :triggerDiff="triggerPageDiff"
      @ignite="triggerPageDiff=false"
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
      :triggerDiff="triggerPartDiff"
      @ignite="triggerPartDiff=false"
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
      :triggerDiff="triggerImageDiff"
      @ignite="triggerImageDiff=false"
    )
    History(
      v-show="isActiveTab(4)"
      :style="{height: panelHeight}"
      :scenarioId="scenarioId"
      :currTarget="targetSchedule"
      :prevTarget="previousSchedule"
      :currTimestamp="targetTimestamp"
      :prevTimestamp="previousTimestamp"
      @compare="compareHistory"
    )
    ScenarioEdit.p-2.border.border-gray.border-top-0(
      v-show="isActiveTab(5)"
      :style="{height: panelHeight}"
      :scenarioId="scenarioId"
    )
    DiffDialog(:showDialog="showDiffDialog" @cancel="closeDiffDialog" @ok="doDiff")
      div(slot="header")
        i.fas.fa-question-circle.mr-2
        | 再差分生成確認
      div(slot="body") 差分ファイルが見つからなかったので、再作成しますか？
      span(slot="ok")
        i.fas.fa-check-circle.mr-2
        | OK
    ErrorDialog(:showDialog="showErrorDialog" :classList="['border','border-danger']")
      div(slot="header")
        i.fas.fa-exclamation-triangle.mr-2
        | エラー
      div(slot="body")
        ul
          li(v-for="(v,i) in errors" :key="i") {{v}}
      div(slot="footer")
        .d-flex
          button.btn.btn-primary.mr-0.ml-auto(@click="closeErrorDialog")
            i.fas.fa-check-circle.mr-2
            | OK
</template>

<script>
import CommonDialog from '@/components/common/CommonDialog'
import DiffPanel from '@/components/review/ReviewFormDiff'
import DiffImage from '@/components/review/ReviewFormImage'
import History from '@/components/review/ReviewFormHistory'
import ScenarioEdit from '@/components/scenario/ScenarioForm'

// import { Diff2Html } from 'diff2html'
import 'diff2html/dist/diff2html.min.css'

var axios = require('axios')

export default {
  name: 'ReviewForm',
  components: {
    'DiffDialog': CommonDialog,
    'ErrorDialog': CommonDialog,
    'PageDiffPanel': DiffPanel,
    'PartDiffPanel': DiffPanel,
    DiffImage,
    History,
    ScenarioEdit
  },
  data () {
    return {
      activeTabId: 1,
      targetSchedule: null,
      previousSchedule: null,
      errors: [],
      showDiffDialog: false,
      showErrorDialog: false,
      scenarioName: null,
      pageDiffFileName: 'index.html',
      partDiffFileName: 'parts.html',
      imageDiffFileName: 'screenshot.png',
      targetTimestamp: null,
      previousTimestamp: null,
      triggerPageDiff: false,
      triggerPartDiff: false,
      triggerImageDiff: false,
      nocompared: false
    }
  },
  props: ['scenarioId', 'newId', 'oldId', 'panelHeight'],
  methods: {
    isActiveTab: function (id) {
      return (parseInt(this.activeTabId) === id)
    },
    getRecentlySchedule: function (id) {
      const targetUrl = `${this.$apiUrl}/schedules/${id}/recent`
      axios.get(targetUrl)
        .then(res => {
          if (res.status !== 200) throw new Error('正しいデータを取得できませんでした')
          if (res.data.length === 1) {
            this.activeTabId = 5
            this.nocompared = true
            // throw new Error('スクレイピング結果が１件しかありません。')
          }
          return res.data
        })
        .then(data => {
          this.targetSchedule = data[0]
          this.targetTimestamp = this.formatDatetime(data[0].saveDir)

          if (data[1] != null) {
            this.previousSchedule = data[1]
            this.previousTimestamp = this.formatDatetime(data[1].saveDir)
          } else {
            this.previousSchedule = null
            this.previousTimestamp = null
          }
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
            if (res.status !== 200) throw new Error('データを取得できませんでした')

            this.scenario = res.data
            this.scenarioName = res.data.name
            // for breadcrumbs
            this.$emit('scenarioName', this.scenarioName)
          })
          .catch(err => console.error(err))
      }
    },
    getSchedule: async function (id) {
      if (id != null) {
        const targetUrl = `${this.$apiUrl}/schedule/${this.scenarioId}/${id}`
        var result = null
        await axios.get(targetUrl)
          .then(res => {
            // console.log(res)
            if (res.status !== 200 || res.data.length !== 1) throw new Error('error')
            return res.data.pop()
          })
          .then((data) => {
            result = data
          })
          .catch((err) => {
            // handle error
            console.log(err)
          })
        return result
      }
    },
    getDialogMessage: function () {
      return `差分ファイルが見つからなかったので、再作成しますか？`
    },
    openDiffDialog: function () { this.showDiffDialog = true },
    closeDiffDialog: function () { this.showDiffDialog = false },
    openErrorDialog: function () { this.showErrorDialog = true },
    closeErrorDialog: function () { this.showErrorDialog = false },
    doDiff: function (event) {
      this.$lock('再差分作成中...')
      const ret = {
        scenarioId: this.scenarioId,
        oldId: this.previousSchedule.saveDir,
        newId: this.targetSchedule.saveDir
      }
      const url = `${this.$apiUrl}/diff`
      axios
        .post(url, ret)
        .then(res => {
          if (res.status !== 200) throw new Error('error')
          this.showDiffDialog = false
        })
        .catch(err => console.error(err))
        .then(() => {
          var _self = this
          setTimeout(function () { _self.$unlock() }, 2000)
        })
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
    },
    async compareHistory (newId, oldId) {
      console.log(newId, oldId)

      await this.getSchedule(newId)
        .then(res => {
          this.targetSchedule = res
          this.targetTimestamp = this.formatDatetime(res.saveDir)
        })
      await this.getSchedule(oldId)
        .then(res => {
          this.previousSchedule = res
          this.previousTimestamp = this.formatDatetime(res.saveDir)
        })
      await this.doDiff()
      this.triggerPageDiff = true
      this.triggerPartDiff = true
      this.triggerImageDiff = true
    }
  },
  watch: {
    scenarioId: function () {
      this.getRecentlySchedule(this.scenarioId)
      this.getScenario(this.scenarioId)
    }
  },
  updated () {
    this.$emit('calcHeight')
  }
}
</script>

<style lang="scss" scoped>
.container-fluid{
  min-width: 640px;
}
.nav{
  li{
    label {
      background-color: #F6F6F6;
      border-color: #dee2e6;
      text-align: center;
      margin-bottom: 0 !important;
      margin-right: 2px;
      // border-bottom: 1px solid #999;
      width: 6em;
      font-size:.75em;
      cursor: pointer;
      &:hover{
        background-color:#FFF;
      }
      &:last-child{
        width: auto;
        margin-right: 0;
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
