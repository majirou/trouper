<template lang="pug">
  .card
    .card-header.py-1 選択中の要素
    .card-body.p-1
      ul.list-group.list-group-horizontal.list-unstyled
        li TAG: {{elem.tag}}
        li ID: {{elem.id}}
        li CLASS: {{elem.className}}
        li NAME: {{elem.name}}
        li INDEX: {{elem.index}}
</template>

<script>
export default {
  name: 'ActiveElement',
  props: {
    'elem': {
      type: Object,
      default: () => {
        return {
          tag: null,
          id: null,
          className: null,
          name: null,
          index: null
        }
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
