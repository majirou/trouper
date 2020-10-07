<template lang="pug">
  .container-fluid
    .tbl-header
      button.btn.btn-sm.btn-primary(@click="showRegisterModal")
        font-awesome-icon(icon="plus")
    .tbl-body
      div(:id="tableId")
</template>

<script>
import Tabulator from 'tabulator-tables' // import Tabulator library
import { dom } from '@fortawesome/fontawesome-svg-core'
dom.watch()

// const Tabulator = require('tabulator-tables')

export default {
  name: 'ReviewGrid',
  components: {
  },
  props: {
    'records': {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      tableId: 'table'
    }
  },
  watch: {
    records () {
      this.setTabulatorData(this.records)
    }
  },
  mounted () {
    this.initTabulator()
  },
  methods: {
    setTabulatorData (data) {
      if (data == null) {
        return null
      }
      const _d = []
      data.forEach((v) => {
        _d.push({
          _id: v._id,
          name: v.schedule.name,
          url: v.url,
          date: v.schedule.date,
          // dir:
          interval: v.schedule.interval,
          created: v.created
        })
      })
      this.table.setData(_d)
    },
    initTabulator () {
      this.table = new Tabulator('#' + this.tableId, {
        height: this.calcHeight('px'),
        layout: 'fitDataFill',
        placeholder: 'No Data Set',
        columns: this.getColumns()
      })
    },
    calcHeight (unit = null) {
      const _getHeightWithMargin = (className) => {
        const _elem = document.getElementsByClassName(className)
        let _h = 0
        if (_elem != null) {
          Object.keys(_elem).forEach((_v) => {
            const _style = window.getComputedStyle(_elem[_v])
            _h += parseInt(_style.height) + parseInt(_style.marginTop) + parseInt(_style.marginBottom)
          })
        }
        return _h
      }
      const _wh = window.innerHeight
      const _tbHeight = _getHeightWithMargin('tbl-header')
      const _tbBody = _getHeightWithMargin('tbl-body')
      const _h = _wh - _tbHeight - _tbBody
      return (unit == null) ? _h : `${_h}${unit}`
    },
    getColumns () {
      const columns = [
        // { formatter: () => '<font-awesome-icon icon="plus" />',
        { formatter: () => '<i class="fas fa-edit" ></i>',
          width: 40,
          align: 'center',
          cellClick: (event, cell) => {
            console.log(event, cell)
            // const ak = cell._cell.row.data._id
            // this.$router.push({ path: `/review/${ak}` })
          }
        },
        { title: 'ID', field: '_id', visible: false },
        { title: 'シナリオ名', field: 'name' },
        { title: 'URL', field: 'url' },
        { title: '次回予定日', field: 'date' },
        { title: '間隔', field: 'interval' },
        { title: 'DIR', field: 'dir' },
        { title: '状況', field: 'status' },
        { formatter: () => '<span class="bg-danger text-white px-1 rounded"><i class="fas fa-trash-alt" ></i></span>',
          width: 40,
          align: 'center',
          cellClick: (event, cell) => {
            const _d = cell.getData()
            this.showDeleteModal({
              id: _d._id,
              name: _d.name,
              url: _d.url
            })
          }
        }
      ]

      columns.forEach((v, i) => {
        if (v.headerFilter == null) {
          columns[i].headerFilter = 'input'
        }
      })
      return columns
    },
    showRegisterModal () {
      this.$emit('register')
    },
    showDeleteModal (obj) {
      this.$emit('delete', obj)
    }
  }
}
</script>

<style lang="scss">
.tbl-header{
  margin: 0.5em 0;
  display: flex;
  justify-content: flex-end;
}
.tbl-body{
  margin: 0.5em 0;
}
</style>
