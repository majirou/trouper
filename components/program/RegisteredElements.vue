<template lang="pug">
  .card.flex-row.mt-1
    .card-header.border-bottom-0.border-right.py-1
      span 登録要素
    .card-body.p-1
      .d-flex
        .badge.badge-primery(v-for="(v,i) in elems")
          span TAG: {{v.tag}}
          span ID: {{v.id}}
          span CLASS: {{v.className}}
          span NAME: {{v.name}}
          span INDEX: {{v.index}}
</template>

<script>
export default {
  name: 'RegisteredElements',
  props: {
    'elems': {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  mounted () {
  },
  methods: {
  }
}
</script>

<style lang="scss">
</style>
