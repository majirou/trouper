<template lang="pug">
  section.p-2.border.border-gray.border-top-0
    .badge.badge-light シナリオID: {{scenarioId}}
    table.table.table-striped.mt-3
      thead
        tr
          th スケジュールID
          th 実施日時
          th.old {{prevTarget._id}}
          th.new {{currTarget._id}}
          th.text-center 無効化
      tbody
        tr(v-for="(v,i) in historyList" :key="i")
          td {{v._id}}
          td
            //- なぜか下記のやり方でないとうまくいかなかったので…（本当は:class=で実行したかった
            span.old(v-if="prevTarget._id === v._id") {{formatTimestamp(v.saveDir)}}
            span.new(v-else-if="currTarget._id === v._id") {{formatTimestamp(v.saveDir)}}
            span(v-else) {{formatTimestamp(v.saveDir)}}
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
            button.btn.btn-sm.btn-danger.py-0(@click="voidSchedule" :value="v._id") 無効化
    .text-right
      button.btn.btn-primary(@click="createCompare()") 比較する
</template>

<script>
import CommonDialog from '@/components/common/CommonDialog'
var axios = require('axios')

export default {
  name: 'ReviewHistory',
  components: {
    'ErrorDialog': CommonDialog
  },
  data () {
    return {
      historyList: [],
      selected: null,
      oldTarget: null,
      newTarget: null
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
    voidSchedule (event) {
      console.log(event, event.currentTarget.value)
    },
    formatTimestamp (dir) {
      return `${dir.substr(0, 4)}/${dir.substr(4, 2)}/${dir.substr(6, 2)} ${dir.substr(8, 2)}:${dir.substr(10, 2)}:${dir.substr(12, 2)}`
    },
    createCompare () {
      this.$emit('compare', this.newTarget, this.oldTarget)
    }
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
</style>
