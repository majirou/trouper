<template lang="pug">
  .card.flex-row.mt-1
    .card-header.border-bottom-0.border-right.py-1
      span 登録要素
    .card-body.p-1
      .d-flex
        .badge.badge-primary(v-for="(v,i) in elems")
          span {{v.tag}}
        //
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

<style lang="scss" scoped>
.card-body{
  overflow-x: scroll;
  width: 50vw;

  .badge{
    margin-right: 0.5em;
  }

  /*スクロールバー全体*/
  &::-webkit-scrollbar {
      width: 10px;
  }

  /*スクロールバーの軌道*/
  &::-webkit-scrollbar-track {
    border-radius: 10px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, .1);
  }

  /*スクロールバーの動く部分*/
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 50, .5);
    border-radius: 10px;
    box-shadow:0 0 0 1px rgba(255, 255, 255, .3);
  }
}
</style>
