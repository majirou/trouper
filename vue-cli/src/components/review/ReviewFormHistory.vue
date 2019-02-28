<template lang="pug">
  section.p-2.border.border-gray.border-top-0 履歴
    div {{scenarioId}}
      table
        thead
          tr
            th id
            th 実施日時
            th 比較対象A
            th 比較対象B
        tbody
          tr(v-for="(v,i) in historyList" :key="i")
            td {{v._id}}
            td {{v.saveDir}}
            td
              input(
                type="radio"
                name="old"
                :value="v._id"
                v-model="oldTarget"
                )
            td
              input(
                type="radio"
                name="new"
                :value="v._id"
                v-model="newTarget"
              )
    transition(name="fade")
      .d-flex.justify-content-between.h-100
</template>

<script>
var axios = require('axios')

export default {
  name: 'ReviewHistory',
  data () {
    return {
      historyList: null,
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
    }
  },
  watch: {
    scenarioId () { this.getHistory() },
    prevTarget () { this.oldTarget = this.prevTarget._id },
    currTarget () { this.newTarget = this.currTarget._id }
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
</style>
