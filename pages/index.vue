<template lang="pug">
  main
    MainGrid(
      :records="gridData"
      @register="showRegisterModal"
      @delete="showDeleteModal"
    )
    Modal#message(
      v-if="messageText"
      @cancel="hideMessageModal"
      @ok="hideMessageModal"
      :mode="messageMode"
      :zIndex=10000
      :visibleHeader="true"
      :visibleFooter="true"
      :visibleClose="false"
      :containerStyle="{width: '70%'}"
    )
      template(slot="header")
        .p-0 {{messageMode}}
      template(slot="body")
        p.alert(:class="" ) {{messageText}}
      template(slot="footer")
        button.btn.btn-secondary(@click="hideMessageModal") CLOSE
    Modal#register(
      v-if="visibleRegisterModal"
      @close="hideRegisterModal"
      :visibleFooter="true"
      :containerStyle="{padding: '0.125em 0',width: '98%',margin:'1%'}"
    )
      template(slot="body")
        ScenarioEditor(
          :scenario="scenarioData"
          @message = "setMessage"
          @close = "hideRegisterModal"
        )
      template(slot="footer")
        .w-100.d-flex.justify-content-between
          button.btn.btn-secondary(@click="hideRegisterModal") CANCEL
          button.btn.btn-warning.mr-0.ml-auto(@click="registerScenario")
            slot(name="ok")
              font-awesome-icon(icon="save").mr-2
              | REGISTER
    Modal#delete(
      v-if="visibleDeleteModal"
      @close="hideDeleteModal"
      :visibleHeader="true"
      :visibleFooter="true"
      :visibleClose="false"
      :mode="4"
      :width="`50%`"
    )
      template(slot="header")
        .p-0 削除の確認
      template(slot="body")
        p.alert(:class="" )
          b.h3 {{deleteTarget.name}}({{deleteTarget.url}}) <br>
          | 削除してよろしいですか？
      template(slot="footer")
        .w-100.d-flex.justify-content-between
          button.btn.btn-secondary(@click="hideDeleteModal") キャンセル
          button.btn.btn-danger.mr-0.ml-auto(@click="deleteRecord")
            slot(name="ok")
              font-awesome-icon(icon="trash").mr-2
              | DELETE
</template>

<script>
import MainGrid from '~/components/scenario/ScenarioGrid'
import Modal from '~/components/common/BaseModal'
import ScenarioEditor from '~/components/scenario/ScenarioEditor'

export default {
  name: 'Scenario',
  components: {
    MainGrid,
    Modal,
    ScenarioEditor
  },
  data () {
    return {
      gridData: this.getTableData(),
      scenarioData: {
        title: null,
        date: null,
        mail: null,
        interval: 1,
        scenes: []
      },
      visibleRegisterModal: false,
      // message modal
      visibleMessageModal: false,
      messageMode: 0, // 0:none , 1:info , 2:success, 3:warning , 4:danger
      messageText: null,
      // delete modal
      visibleDeleteModal: false,
      deleteTarget: null,
      // url
      registerApiUrl: '/scenes'
    }
  },
  methods: {
    getTableData () {
      const url = `/programs/`
      const params = {
        page: this.currentPage,
        size: this.paginationSize
      }

      this.$axios
        .get(url, params)
        .then((res) => {
          if (res.status !== 200) {
            throw new Error('error')
          }
          this.gridData = Array.isArray(res.data.result) ? res.data.result : []
        }).catch((err) => {
          // handle error
          console.error(err)
        })
    },
    deleteRecord () {
      const url = `/program/${this.deleteTarget.id}`

      this.$axios
        .delete(url)
        .then((res) => {
          console.log(res)
          if (res.status !== 200) {
            throw new Error('error')
          }
          this.getTableData()
        }).catch((err) => {
          // handle error
          console.error(err)
        })
    },
    showRegisterModal () {
      this.visibleRegisterModal = true
    },
    hideRegisterModal () {
      this.visibleRegisterModal = false
    },
    showDeleteModal (obj) {
      this.visibleDeleteModal = true
      this.deleteTarget = obj
    },
    hideDeleteModal () {
      this.visibleDeleteModal = false
    },
    setMessage (mode, text) {
      this.messageMode = mode // 0:none , 1:info , 2:success, 3:warning , 4:danger
      this.messageText = text
    },
    clearMessage () {
      this.messageMode = 0
      this.messageText = null
    },
    hideMessageModal () {
      this.clearMessage()
    },
    registerScenario () {
      const postData = {
        scenario: this.scenarioData
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

<style src='@/node_modules/tabulator-tables/dist/css/tabulator.min.css'></style>
<style lang="scss">
</style>
