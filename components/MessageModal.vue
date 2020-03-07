<template lang="pug">
  transition(name="modal")
    .modal-mask
      .modal-wrapper
        .modal-container
          .modal-header.d-flex
            slot(name="header") default header
          .modal-body
            slot(name="body") default body
          .modal-footer
            slot(name="footer")
              .d-flex
                button.btn.btn-secondary(@click="cancelAction") キャンセル
                button.btn.btn-primary.mr-0.ml-auto(@click="okAction")
                  slot(name="ok") OK
</template>

<script>
export default {
  name: 'MessageModal',
  props: {
    mode: {
      type: Number,
      default: 0
    },
    text: {
      type: String,
      default: ''
    }
  },
  methods: {
    cancelAction () {
      this.$emit('cancel')
    },
    okAction () {
      this.$emit('ok')
    }
  }
}
</script>

<style scoped lang="scss">
button{
  width:8em;
  margin-right:1em;
}
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}
.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}
.modal-container {
  // width: 360px;
  max-width: 70%;
  margin: .5em auto;
  background-color: #fff;
  border-width: .25em !important;
  border-radius: 0.125em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
  padding: .5em 1em ;
}

.modal-enter {
  opacity: 0;
}
.modal-leave-active {
  opacity: 0;
}
.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
