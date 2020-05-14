<template lang="pug">
  main
    MainGrid(
      :records="gridData"
      @register="showRegisterModal"
      @delete="showDeleteModal"
    )
    Modal#register(
      v-if="visibleRegisterModal"
      @close="hideRegisterModal"
    )
      template(slot="body")
        RegisterForm(
          @message = "setMessage"
          @close = "hideRegisterModal"
        )
    Modal#message(
      v-if="messageText"
      @cancel="hideMessageModal"
      @ok="hideMessageModal"
      :zIndex=10000
      :visibleFooter="true"
    )
      template(slot="body")
        p.alert(:class="" ) {{messageMode}} {{messageText}}
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
          button.btn.btn-primary.mr-0.ml-auto(@click="hideDeleteModal")
            slot(name="ok") OK
</template>

<script>
import MainGrid from '~/components/program/ProgramGrid'
import Modal from '~/components/common/BaseModal'
import RegisterForm from '~/components/program/ProgramForm'

export default {
  components: {
    MainGrid,
    Modal,
    RegisterForm
  },
  data () {
    return {
      gridData: this.getTableData(),
      visibleRegisterModal: false,
      // message modal
      visibleMessageModal: false,
      messageMode: 0, // 0:none , 1:info , 2:success, 3:warning , 4:danger
      messageText: null,
      // delete modal
      visibleDeleteModal: false,
      deleteTarget: null
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
          this.gridData = res.data.result
        }).catch((err) => {
          // handle error
          console.log(err)
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
      console.log('setMessage', mode, text)
      this.messageMode = mode // 0:none , 1:info , 2:success, 3:warning , 4:danger
      this.messageText = text
    },
    clearMessage () {
      this.messageMode = 0
      this.messageText = null
    },
    hideMessageModal () {
      this.clearMessage()
    }
  }
}
</script>

<style src='@/node_modules/tabulator-tables/dist/css/tabulator.min.css'></style>
<style lang="scss">
</style>
