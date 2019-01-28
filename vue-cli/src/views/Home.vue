<template lang="pug">
  section.home
    MainGrid
</template>

<script>
// @ is an alias to /src
import MainGrid from '@/components/review/ReviewGrid.vue'

export default {
  name: 'maingrid',
  components: {
    MainGrid
  },
  mounted: function () {
    // this.$lock()
  }
}
</script>
