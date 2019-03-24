<template lang="pug">
  section.p-2.border.border-gray.border-top-0
    .badge.badge-light シナリオID: {{scenarioId}}
    table.table.table-striped.mt-3
      thead
        tr
          th スケジュールID
          th 実施日時
          th.old 比較対象１
          // {{getPrevId}}
          th.new 比較対象２
          // {{getcurrId}}
          th.text-center 無効化
      tbody(v-if="historyList.length > 0" )
        tr(v-for="(v,i) in historyList" :key="i")
          td {{v._id}}
          td
            span(:class="getCellClass(v._id)") {{formatTimestamp(v.saveDir)}}
          td.old
            label
              input(
                type="radio"
                name="old"
                :value="v._id"
                v-model="oldTarget"
                )
              div
          td.new
            label
              input(
                type="radio"
                name="new"
                :value="v._id"
                v-model="newTarget"
              )
              div
          td.text-center(style="position: relative;top: -2px;")
            button.btn.btn-sm.btn-danger.py-0(@click="openVoidDialog" :value="v._id") 無効化
            span {{v.voided}}
    .text-right
      button.btn.btn-primary(
        @click="createCompare()"
        v-show="historyList.length > 2"
      ) 比較する
    VoidDialog(:showDialog="showVoidDialog")
      div(slot="header")
        i.fas.fa-question-circle.mr-2
        | 無効化
      div(slot="body") このスケジュール結果を無効化しますか？
      div(slot="footer")
        div.d-flex
          button.btn.btn-secondary(@click="closeVoidDialog")
            | キャンセル
          button.btn.btn-danger.mr-0.ml-auto(@click="doVoid")
            i.fas.fa-ban.mr-2
            | 無効化
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
var axios = require('axios')

export default {
  name: 'ReviewHistory',
  components: {
    'ErrorDialog': CommonDialog,
    'VoidDialog': CommonDialog
  },
  data () {
    return {
      historyList: [],
      selected: null,
      oldTarget: null,
      newTarget: null,
      showVoidDialog: false,
      showErrorDialog: false,
      errors: []
    }
  },
  props: ['scenarioId', 'currTarget', 'prevTarget', 'fileName', 'currTimestamp', 'prevTimestamp'],
  methods: {
    getHistory () {
      const targetUrl = `${this.$apiUrl}/history/${this.scenarioId}`
      axios.get(targetUrl)
        .then(res => {
          if (res.status !== 200) throw new Error('error')
          return res.data
        })
        .then(data => {
          this.historyList = data
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
    formatTimestamp (dir) {
      return `${dir.substr(0, 4)}/${dir.substr(4, 2)}/${dir.substr(6, 2)} ${dir.substr(8, 2)}:${dir.substr(10, 2)}:${dir.substr(12, 2)}`
    },
    createCompare () {
      this.$emit('compare', this.newTarget, this.oldTarget)
    },
    openVoidDialog (event) {
      this.voidTarget = event.currentTarget.value
      this.showVoidDialog = true
    },
    closeVoidDialog () {
      this.voidTarget = null
      this.showVoidDialog = false
    },
    openErrorDialog () {
      this.showErrorDialog = true
    },
    closeErrorDialog () {
      this.errors = []
      this.showErrorDialog = false
    },
    doVoid () {
      console.log(this.voidTarget)
      const scheduleId = this.voidTarget
      const targetUrl = `${this.$apiUrl}/schedule/void/${scheduleId}`

      axios.put(targetUrl)
        .then(res => {
          if (res.status !== 200) throw new Error('error')
          return res.data
        })
        .then(data => {
          this.closeVoidDialog()
          this.$lock('無効化中...')
          this.getHistory()
        })
        .catch(err => {
          if (err.response.status === 404) {
            this.errors.push(err.response.config.url + ' is not found')
            this.showErrorDialog = true
          } else {
            console.error(err)
            this.errors.push(err.response.config.url)
            this.showErrorDialog = true
          }
        })
        .then(() => {
          var _self = this
          setTimeout(function () { _self.$unlock() }, 1000)
        })
    },
    getCellClass (id) {
      let rt = ''
      if (this.prevTarget != null && this.prevTarget._id === id) {
        rt = 'old'
      } else if (this.currTarget._id === id) {
        rt = 'new'
      }
      return rt
    }
  },
  computed: {
    getPrevId () { return this.prevTarget ? this.prevTarget._id : null },
    getcurrId () { return this.currTarget ? this.currTarget._id : null }
  },
  watch: {
    scenarioId () { this.getHistory() },
    prevTarget () {
      this.oldTarget = this.prevTarget._id
    },
    currTarget () {
      this.newTarget = this.currTarget._id
    }
  }
}
</script>

<style lang="scss" scoped>
@mixin _m($bg){
  background-color: $bg;
  padding:0;
  label{
    width: 100%;
    margin: 0;
    cursor: pointer;
    &:hover{
      background-color: darken($bg,20%);
    }
  }

  input[type="radio"] {
    display: none ;
    & + div {
      line-height: 1em;
      width: 100%;
      padding: .25em .5em;
      &:before{
        font-family: "Font Awesome 5 Free";
        content: "\f0c8";
        font-weight: 400;
      }
    }
    &:checked + div{
      line-height: 1em;
      width: 100%;
      padding: .25em .5em;
      &:before {
        font-family: "Font Awesome 5 Free";
        content: "\f14a 対象";
        font-weight: 900;
      }
    }
  }
}

.old{
  @include _m(#e9aeae);
}
.new{
  @include _m(#b4e2b4);
}
.table td {
  vertical-align: unset;
  margin: 0;
  padding: 0;
}

.table th ,
.table td {
  word-break: break-all
}
</style>
