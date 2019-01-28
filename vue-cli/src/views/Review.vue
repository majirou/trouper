<template lang="pug">
  section
    ReviewForm(:scenarioId="scenarioId" :newId="newId" :oldId="oldId" :panelHeight="panelHeight")
</template>

<script>
import ReviewForm from '@/components/review/ReviewForm.vue'

export default {
  name: 'ViewReview',
  data () {
    return {
      scenarioId: null,
      newId: null,
      oldId: null,
      panelHeight: 100
    }
  },
  components: {
    ReviewForm
  },
  methods: {
    resize: function () {
      console.log('resize')
    }
  },
  mounted: function () {
    this.scenarioId = this.$route.params.id
    this.newId = this.$route.params.newid
    this.oldId = this.$route.params.oldid
  },
  updated: function () {
    // console.log('updated')
    // diffパネルの高さ設定
    if (document.getElementsByTagName('header')) {
      const headerMargin = parseInt(window.getComputedStyle(document.getElementsByTagName('header')[0]).marginBottom)
      const bodyOffsetHeight = document.getElementsByTagName('header')[0].offsetHeight
      const navsOffsetHeight = document.getElementsByClassName('nav')[0].offsetHeight
      const marginBottom = parseInt(window.getComputedStyle(document.getElementsByTagName('body')[0]).fontSize)

      const bodyHeight = window.innerHeight -
                        bodyOffsetHeight -
                        headerMargin -
                        navsOffsetHeight -
                        marginBottom
      this.panelHeight = bodyHeight + 'px'
      // document.getElementsByClassName('diff-panel')[0].style.height = bodyHeight + 'px'
    }
  }
}
</script>
