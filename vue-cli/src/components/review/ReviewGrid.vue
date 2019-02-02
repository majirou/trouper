<template lang="pug">
  div.container-fluid
    div.d-flex.mb-2
      router-link.btn.btn-primary.mr-2(to="/register")
        i.fas.fa-plus
      button.btn.btn-primary.mr-2(@click="reload")
        i.fas.fa-sync-alt
      input.form-control.w-50(@change="search" placeholder="検索キーワード")
      div.ml-auto.mr-0
        button.btn.btn-primary(:class="{disabled: !isEnable}" @click="confirmScraping")
          i.fas.fa-swimmer
    div#table
    CrawlingDialog(
      :showDialog="showCrawlingDialog"
      @cancel="closeCrawlingDialog"
      @ok="doCrawling"
    )
      div(slot="header")
        i.fas.fa-question-circle.mr-2
        | 即時クローリング確認
      div(slot="body" v-html="this.getDialogMessage()")
      span(slot="ok")
        i.fas.fa-swimmer.mr-2
        | OK
    TrashDialog(
      :showDialog="showTrashDialog"
    )
      div(slot="header" class="text-danger font-weight-bold")
        i.fas.fa-question-circle.mr-2
        | シナリオ削除
      div(slot="body" v-html="this.getTrashDialogMessage()")
      div(slot="footer")
        div.d-flex
          button.btn.btn-secondary(@click="closeTrashDialog") キャンセル
          button.btn.btn-danger.mr-0.ml-auto(
            @click="deleteScenario" style="width: 6.5em !important;"
          )
            i.fas.fa-trash.mr-2
            | 削除
</template>

<script>
import CommonDialog from '@/components/common/CommonDialog'

var axios = require('axios')
var Tabulator = require('tabulator-tables') // import Tabulator library

export default {
  name: 'ReviewGrid',
  components: {
    'CrawlingDialog': CommonDialog,
    'TrashDialog': CommonDialog
  },
  data () {
    return {
      table: null,
      tableId: 'table',
      tableData: null,
      grid: 'This is grid',
      currentPage: 1,
      paginationSize: 20,
      // activeKey: null,
      activeClass: 'active',
      showCrawlingDialog: false,
      showTrashDialog: false
    }
  },
  computed: {
    isEnable: function () {
      // return !(this.activeKey)
      return (this.table && this.table.getSelectedData().length === 1)
    }
  },
  methods: {
    getTableData: function () {
      axios.get(this.$apiUrl + '/scenarios/', {
        params: {
          page: this.currentPage, size: this.paginationSize
        }
      }).then((res) => {
        // console.log(res)
        if (res.status !== 200) {
          throw new Error('error')
        }
        this.tableData = res.data
        this.table.addData(res.data, false)
      }).catch((err) => {
        // handle error
        console.log(err)
      })
    },
    search: function (event) {
      const params = {
        multiSearch: event.target.value
      }
      this.table.setData(this.$apiUrl + '/scenarios/', params)
    },
    reload: function () { this.table.setData() },
    confirmScraping: function (event) {
      if (!this.isEnable) {
        console.error(event, this.table)
        return 0
      }
      let row = this.table.getSelectedData()
      if (row.length === 1) {
        this.showCrawlingDialog = true
        console.log(this)
      }
      console.log(event, this.table.getSelectedData())
    },
    getDialogMessage: function () {
      if (!this.isEnable) return null
      // isEnableなので下記の個数などはチェックしなくていい
      const tab = this.table.getSelectedData().pop()
      return `シナリオ「${tab.name}」\n${tab.url}\nを現時点のサイトを取得し、差分評価をします`.replace(/\n/g, '<br>')
    },
    getTrashDialogMessage: function () {
      if (!this.isEnable) return null
      // isEnableなので下記の個数などはチェックしなくていい
      const tab = this.table.getSelectedData().pop()
      return `シナリオ「${tab.name}」\nを削除します。`.replace(/\n/g, '<br>')
    },
    closeCrawlingDialog: function () { this.showCrawlingDialog = false },
    closeTrashDialog: function () { this.showTrashDialog = false },
    doCrawling: function (event) {
      // 即時クロールを実施
      const data = this.table.getSelectedData()
      if (data.length === 1) {
        this.$lock('クロール中...')
        axios
          .post(this.$apiUrl + '/schedule/now', { id: data[0]._id })
          .then(res => {
            console.log(res)
            if (res.status !== 200) throw new Error('error')
            this.showCrawlingDialog = false
          })
          .catch(err => console.error(err))
          .then(() => this.$unlock())
      }
    },
    deleteScenario: function () {
      const data = this.table.getSelectedData()
      if (data.length === 1) {
        this.$lock('削除中...')
        const url = `${this.$apiUrl}/scenario/${data[0]._id}`
        axios
          .delete(url)
          .then(res => {
            console.log(res)
            if (res.status !== 200) throw new Error('error')
          })
          .catch(err => console.error(err))
          .then(() => {
            // 動作を少し遅らせ、処理している感じを出す
            setTimeout(() => { this.showTrashDialog = false }, 1000)
            setTimeout(() => this.reload(), 1000)
            setTimeout(() => this.$unlock(), 1500)
          })
      }
    }
  },
  mounted: function () {
    this.table = new Tabulator('#' + this.tableId, {
      height: '75vh',
      layout: 'fitColumns',
      placeholder: 'No Data Set',
      columns: [
        { title: 'ID', field: '_id', width: 250, visible: false },
        { formatter: () => '<i class="fas fa-edit"></i>',
          width: 40,
          align: 'center',
          cellClick: (e, cell) => this.$router.push(`/edit/${cell._cell.row.data._id}`)
        },
        { title: 'シナリオ名', field: 'name', width: 400 },
        { title: '次回予定日', field: 'date', width: 100, formatter: cell => cell.getValue().substring(0, 10) },
        // { title: '最終実施日', field: 'execDate' },
        { title: 'DIR', field: 'dir', width: 150 },
        { title: 'URL', field: 'url' },
        { formatter: () => '<i class="fas fa-trash"></i>',
          width: 40,
          align: 'center',
          cellClick: (e, cell) => { this.showTrashDialog = true }
        }
        // { title: 'D', field: 'delete' }
      ],
      rowClick: (e, row) => {
        // 全体を解除して、現在選択をアクティブへ
        this.table.deselectRow()
        row.select()
      },
      rowDblClick: (e, row) => {
        const ak = row._row.data._id
        this.$router.push({ path: `/review/${ak}` })
      },
      ajaxURL: `${this.$apiUrl}/scenarios`,
      ajaxProgressiveLoad: 'scroll',
      ajaxProgressiveLoadDelay: 200,
      // ajaxFiltering: true,
      ajaxParams: null,
      paginationSize: 10
    })
  }
}
</script>
<style src='@/../node_modules/tabulator-tables/dist/css/tabulator.min.css'></style>
<style scoped>
#table{
  height: 50vh;
}
</style>
<style lang="scss">
/* tabulator系はインスタンス化後に反映するためグローバルに記述 */
.tabulator {
  border-right: none;
  border-radius: 2px;

  .tabulator-header {
    background-color: #FFF;

    .tabulator-col{
      background: linear-gradient(#FFFFFF99, #c5c5c599);
    }
  }
  .tabulator-row{
    &.tabulator-selected{
      background-color: #007bff;
      color:#FFF !important;
    }
    &.tabulator-selectable:hover {
      background-color: #81bcff;
      color:#FFF ;
      cursor: pointer;
    }
    .fa-edit:hover {
      color: #0069d9;
    }
    .fa-trash:hover {
        color: darken(#F00,10%)
    }
  }
}
</style>
