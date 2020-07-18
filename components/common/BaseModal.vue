<template lang="pug">
  transition(name="modal")
    .modal-mask(:style="{'z-index':zIndex}")
      .modal-wrapper
        .modal-container(
          :style="containerStyle"
        )
          .modal-close(@click.stop="closeAction" v-if="visibleClose")
            a.close-btn
          .modal-header.d-flex(v-if="visibleHeader" :class="getHeaderClass()")
            slot(name="header") default header
          .modal-body
            slot(name="body") default body
          .modal-footer(v-if="visibleFooter" :style="footerStyle")
            slot(name="footer")
              .d-flex
                button.btn.btn-secondary(@click="cancelAction") キャンセル
                button.btn.btn-primary.mr-0.ml-auto(@click="okAction")
                  slot(name="ok") OK
</template>

<script>
export default {
  name: 'BaseModal',
  props: {
    containerStyle: {
      type: Object,
      default: () => {
        return {}
      }
    },
    footerStyle: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 0:none , 1:info , 2:success, 3:warning , 4:danger
    mode: {
      type: Number,
      default: 0
    },
    zIndex: {
      type: Number,
      default: 1000
    },
    visibleClose: {
      type: Boolean,
      default: true
    },
    visibleHeader: {
      type: Boolean,
      default: false
    },
    visibleFooter: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      baseColor: null,
      textColor: null
    }
  },
  mounted () {
    // 0:none , 1:info , 2:success, 3:warning , 4:danger
    switch (this.mode) {
      case 1: // info
        this.baseColor = 'info'
        this.textColor = 'white'
        break
      case 2: // success
        this.baseColor = 'success'
        this.textColor = 'white'
        break
      case 3: // warning
        this.baseColor = 'warning'
        this.textColor = 'dark'
        break
      case 4: // danger
        this.baseColor = 'danger'
        this.textColor = 'white'
        break
      default:
        break
    }
  },
  methods: {
    cancelAction () {
      this.$emit('cancel')
    },
    okAction () {
      this.$emit('ok')
    },
    closeAction () {
      this.$emit('close')
    },
    getHeaderClass () {
      return `bg-${this.baseColor} text-${this.textColor} h4`
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
    // padding: 0 1em;
  }
  .modal-container {
    margin: .5em auto;
    background-color: #fff;
    border-radius: 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
    transition: all .3s ease;

    .modal-close{
      position: absolute;
      top: 0;
      left: 0;
      width: 33px;
      height: 33px;
      background-color: #eee;
      // z-index: 5000;
      opacity: 0.5;

      &:hover {
        cursor: pointer;
        opacity: 1;
      }

      .close-btn{
        &:before, &:after {
          position: absolute;
          left: 15px;
          content: ' ';
          height: 33px;
          width: 2px;
          background-color: #333;
        }
        &:before {
          transform: rotate(45deg);
        }
        &:after {
          transform: rotate(-45deg);
        }
      }
    }
    .modal-body{
      padding: 0;
    }
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
