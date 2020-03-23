<template lang="pug">
  .row.form-group.mt-3
    .col-8
      label 名称:
      input.border-primary.form-control(type="text" v-model="scheduleData.name")
    .col-4
      label 次回予定日:
      input.border-primary.form-control(type="date" v-model="scheduleData.date")
    .col-4
      label 実行間隔:
      .btn-group.btn-group-toggle.w-100
        label.btn.border.border-primary.mt-0(
          v-for="(v,i) in intervalList"
          :class="{'btn-primary':isActiveInterval(v.value)}"
          @click="scheduleData.interval = v.value"
        ) {{v.text}}
    .col-4
      label 通知:
      .btn-group.btn-group-toggle.w-100
        label.btn.border.border-primary.mt-0(
          v-for="(v,i) in notificationList"
          :key="i"
          :class="{'btn-primary':isActiveNotification(v.value)}"
        ) {{v.text}}
          input(type="checkbox" :value="v.value" v-model="scheduleData.notification")
    .col-4
      label Mail:
      select.border-primary.form-control(v-model="scheduleData.mail")
        option(v-for="(v,i) in mailList" :value="v.mail") {{v.mail}}
</template>

<script>
import MailConfig from '~/assets/mail.config.json'

export default {
  name: 'ScheduleForm',
  props: {
    pageTitle: {
      type: String,
      default: () => {
        return ''
      }
    },
    scheduleData: {
      type: Object,
      default: () => {
        return {
          name: null,
          date: null,
          interval: 1,
          notification: [1],
          mail: null
        }
      }
    }
  },
  data () {
    return {
      intervalList: [
        { text: '週１', value: 1 },
        { text: '月１', value: 2 }
      ],
      notificationList: [
        { text: 'All', value: 1 },
        { text: 'Part', value: 2 },
        { text: 'Capture', value: 4 },
        { text: 'Text', value: 8 }
      ],
      mailList: MailConfig
    }
  },
  watch: {
    pageTitle () {
      this.scheduleData.name = this.pageTitle
    }
  },
  mounted () {
  },
  methods: {
    isActiveInterval (value) {
      return (parseInt(this.scheduleData.interval) === parseInt(value))
    },
    isActiveNotification (num) {
      return (this.scheduleData.notification == null) ? null : (this.scheduleData.notification.find(n => n === num) != null)
    }
  }
}
</script>

<style lang="scss" scoped>
label {
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.btn-group-toggle{
  .btn.active{

  }
}
</style>
