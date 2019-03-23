<template lang="pug">
  transition(name="modal")
    .modal-mask(v-if="showModal")
      .modal-wrapper
        .modal-container
          .modal-header.d-flex
            div シナリオ{{type}}
            .small.text-secondary(v-if="scenario") ID:{{scenario._id}}
          .modal-body
            .form-group
              label Base URL:
              input.form-control(disabled :value="url")
            .row
              .col-12.form-group
                label シナリオ名:
                input.form-control(type="text" v-model="scenarioName")
              .col-4.form-group
                label 次回予定日:
                input.form-control(type="date" v-model="nextCrawlingDate")
              .col-4.form-group
                label 実行間隔:
                div
                  .btn-group.btn-group-toggle.w-100
                    label.btn.border.border-primary.w-100(
                      :class="{active:isActiveInterval(1)}"
                    )
                      input(type="radio" v-model="interval" value="1")
                      | 週１
                    label.btn.border.border-primary.w-100(
                      :class="{active:isActiveInterval(2)}"
                    )
                      input(type="radio" v-model="interval" value="2")
                      | 月１
                    //-
                      label.btn.btn-primary
                        input(type="radio" v-model="interval")
                        | 年１
              .col-4.form-group
                label Notification:
                .btn-group.btn-group-toggle.w-100
                  label.btn.border.border-primary(
                    v-for="(v,i) in notifications"
                    :key="i"
                    :class="{active:isActiveNotification(v.value)}"
                  ) {{v.text}}
                    input(type="checkbox" :value="v.value" v-model="notification")
              .col-8.form-group
                label Mail:
                // input.form-control(type="email" v-model="notificationMail")
                select.form-control(v-model="notificationMail")
                  option(v-for="(v,i) in users" :value="v.mail") {{v.mail}}
            .alert.alert-danger.my-1(v-show="errors.length>0")
              ul.mb-0.pl-3
                li(v-for="(v,i) in errors" :key="i") {{v}}
          .modal-footer
            button.btn.btn-secondary.mr-3(@click="close") CLOSE
            button.btn.btn-primary(@click="save") SAVE
</template>

<script>
import users from '@/assets/users.json'

export default {
  name: 'Scenario',
  data () {
    return {
      notification: null,
      notifications: [
        { text: 'All', value: 1 },
        { text: 'Part', value: 2 },
        { text: 'Capture', value: 4 }
      ],
      scenarioName: null,
      notificationMail: null,
      nextCrawlingDate: null,
      interval: 1, // 1: weekly , 2: monthly
      errors: [],
      users
    }
  },
  props: ['showModal', 'url', 'siteTitle', 'registeringErrors', 'dir', 'scenario', 'type'],
  methods: {
    close: function () {
      this.$emit('close')
    },
    init: function () {
      var now = new Date()
      var y = now.getFullYear()
      var m = ('00' + (now.getMonth() + 1)).slice(-2)
      var d = ('00' + now.getDate()).slice(-2)
      this.nextCrawlingDate = y + '-' + m + '-' + d
      this.notification = [1, 2, 4]
      this.scenarioName = null
      this.notificationMail = null
    },
    save: function () {
      this.error = []
      // validation
      if (!this.scenarioName) {
        this.errors.push('シナリオ名を入力してください')
      }
      if (!this.nextCrawlingDate) {
        this.errors.push('次回クロール予定日を入力してください')
      }
      if (this.error.length === 0) {
        // no error
        const ret = {
          url: this.url,
          name: this.scenarioName,
          date: this.nextCrawlingDate,
          notify: this.notification,
          mail: this.notificationMail,
          interval: this.interval,
          dir: this.dir
        }
        this.close()
        this.$emit('save', ret)
      }
    },
    isActiveInterval (num) {
      return num === parseInt(this.interval)
    },
    isActiveNotification (num) {
      return (this.notification.find(n => n === num) != null)
    }
  },
  mounted: function () {
    this.init()
  },
  watch: {
    siteTitle: function () {
      this.scenarioName = '' + this.siteTitle.trim()
    },
    registeringErrors: function () {
      console.error(this.errors, this.registeringErrors)
    },
    scenario: function () {
      this.scenarioName = this.scenario.name
      this.notificationMail = this.scenario.mail
      this.notification = this.scenario.notify
      const tmpDate = new Date(this.scenario.date)
      const y = tmpDate.getFullYear()
      const m = ('00' + (tmpDate.getMonth() + 1)).slice(-2)
      const d = ('00' + tmpDate.getDate()).slice(-2)
      this.nextCrawlingDate = y + '-' + m + '-' + d
      // this.nextCrawlingDate = this.scenario.date
      this.interval = this.scenario.interval
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 75vw;
  min-width: 600px;
  margin: 0px auto;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-body {
  margin: 0;
}

.modal-header {
  padding-top: .75em;
  padding-bottom: .75em;
}

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
label {
  margin-bottom: 0;
  color: #666;
  font-size:.75em;
  &.btn{
    font-size: 1rem;
  }
}
.btn{
  &.active{
    color: #fff;
    background-color: #0062cc;
    border-color: #005cbf;
  }
}
</style>
