<template lang="pug">
  section.home
    MainGrid
</template>

<script>
import MainGrid from '@/components/review/ReviewGrid.vue'

export default {
  name: 'Home',
  components: {
    MainGrid
  },
  mounted: function () {
    const home = this.$router.options.routes[0]
    this.$emit('breadcrumbs', [
      { text: home.name, href: home.path }
    ])
  }
}
</script>
