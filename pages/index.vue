<template lang="pug">
  main
    MainGrid(
      :records="gridData"
    )
</template>

<script>
import MainGrid from '~/components/ReviewGrid.vue'

export default {
  components: {
    MainGrid
  },
  data () {
    return {
      gridData: this.getTableData()
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
    }
  }
}
</script>

<style src='@/node_modules/tabulator-tables/dist/css/tabulator.min.css'></style>
<style lang="scss">

</style>
