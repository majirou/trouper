<template lang="pug">
  div
    .card.flex-row.my-2
      .card-header.border-bottom-0.border-right.py-1.text-center
        span Target
      .card-body.p-1.overflow-auto
        .d-flex.flex-column
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
</template>

<script>
export default {
  name: 'ActiveElement',
  props: {
    element: {
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
  }
}
</script>

<style lang="scss" scoped>
.card-header {
  width: 6em;
  text-align: center;
}
.capsel{
  margin-bottom: 0.25em;
  display: flex;
  .l{
    border-top-left-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;
    padding: 0 0.25em;
    color: #31708f;
    background-color: #d9edf7;
    border: 1px solid #31708f;
    width: 4em;
    text-align: center;
  }
  .r{
    background-color: #FFF;
    border-top-right-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
    padding: 0 0.25em;
    border: 1px solid var(--dark);
    border-left: none;
    overflow: scroll;
    white-space: nowrap;
    width: 10em;
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
