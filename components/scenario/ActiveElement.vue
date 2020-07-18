<template lang="pug">
  .card.flex-row
    .card-header.border-bottom-0.border-right.py-1.text-center
      span Target
    .card-body.p-1.overflow-auto
      .d-flex
        .capsel
          .l TAG
          .r {{element.tag}}
        .capsel
          .l ID
          .r {{element.id}}
        .capsel
          .l CLASS
          .r {{element.className}}
        .capsel
          .l NAME
          .r {{element.name}}
        .capsel
          .l INDEX
          .r {{element.index}}
    .card-footer.border-top-0.border-left.py-1
      .d-flex
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
    'element': {
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
    parent () {
      this.$emit('parent', this.element)
    },
    clear () {
      Object.keys(this.element).forEach((key) => {
        this.element[key] = null
      })
      this.$emit('clear')
    }
  }
}
</script>

<style lang="scss" scoped>
.capsel{
  margin-right: 0.5em;
  display: flex;
  .l{
    border-top-left-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;
    padding: 0 0.25em;
    color: #31708f;
    background-color: #d9edf7;
    border: 1px solid #31708f;
  }
  .r{
    background-color: #FFF;
    border-top-right-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
    padding: 0 0.25em;
    border: 1px solid var(--dark);
    border-left: none;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>

<style lang="scss">
/*スクロールバー全体*/
::-webkit-scrollbar {
  width: 0.25em;
}

/*スクロールバーの軌道*/
::-webkit-scrollbar-track {
  border-radius: 10px;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, .1);
}

/*スクロールバーの動く部分*/
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 50, .5);
  border-radius: 10px;
  box-shadow:0 0 0 1px rgba(255, 255, 255, .3);
}
</style>
