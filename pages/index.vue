<template lang="pug">
  main
    MainGrid(
      :records="gridData"
      @modal="showRegisterModal"
    )
    RegisterModal(
      v-if = "visibleRegisterModal"
      @message = "setMessage"
      style="z-index: 1000;"
    )
    MessageModal(
      v-if="messageText"
      :mode="messageMode"
      :text="messageText"
      @clear="clearMessage"
      @cancel="hideMessageModal"
      @ok="hideMessageModal"
      style="z-index: 2000;"
    )
</template>

<script>
import MainGrid from '~/components/ProgramGrid.vue'
import RegisterModal from '~/components/ProgramForm.vue'
import MessageModal from '~/components/MessageModal.vue'

export default {
  components: {
    MainGrid, RegisterModal, MessageModal
  },
  data () {
    return {
      gridData: this.getTableData(),
      visibleRegisterModal: false,
      // message modal
      visibleMessageModal: false,
      messageMode: 0, // 0:none , 1:info , 2:success, 3:warning , 4:danger
      messageText: null
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
          this.gridData = res.data
        }).catch((err) => {
          // handle error
          console.log(err)
        })
    },
    showRegisterModal () {
      this.visibleRegisterModal = true
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
