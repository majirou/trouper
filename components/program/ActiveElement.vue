<template lang="pug">
  .card.flex-row
    .card-header.border-bottom-0.border-right.py-1
      span 選択要素
    .card-body.p-1
      .d-flex
        span TAG: {{elem.tag}}
        span ID: {{elem.id}}
        span CLASS: {{elem.className}}
        span NAME: {{elem.name}}
        span INDEX: {{elem.index}}
    .card-footer.border-top-0.border-left.py-1
      .d-flex
        button.btn.btn-sm.btn-primary.py-0.px-1.align-baseline.mr-2(
          @click="add"
          :disabled="disable"
        ) ADD
        button.btn.btn-sm.btn-primary.py-0.px-1.align-baseline.mr-2(
          @click="parent"
          :disabled="disable"
        ) PARENT
        button.btn.btn-sm.btn-primary.py-0.px-1.align-baseline(
          @click="clear"
          :disabled="disable"
        ) CLEAR
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
    },
    'disable': {
      type: Boolean,
      default: true
    }
  },
  mounted () {
  },
  methods: {
    add () {
      this.$emit('add', this.elem)
    },
    parent () {
      this.$emit('parent', this.elem)
    },
    clear () {
      this.$emit('clear')
    }
  }
}
</script>

<style lang="scss" scoped>
.card-body{
  span:after{
    content:', ';
  }
}
</style>
