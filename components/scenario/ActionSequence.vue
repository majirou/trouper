<template lang="pug">
  .card.h-100
    .card-header.p-1.text-center
      span Sequences
    .card-body.p-1
      ul(class="list-unstyled")
        li(v-for="(v,i) in sequenceList")
          button(class="btn btn-sm border-primary w-100 py-0") {{v.actionValue.text}}
          .text-center.arrow
            font-awesome-icon(icon="chevron-down")
</template>

<script>
export default {
  name: 'ActionSequence',
  props: {
    'sequenceList': {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
</style>

<style lang="scss">
ul li:last-child .arrow{
  display:none;
}
</style>
