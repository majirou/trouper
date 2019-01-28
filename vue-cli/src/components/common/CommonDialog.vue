<template lang="pug">
  transition(name="dialog")
    div.dialog-mask(v-if="showDialog")
      div.dialog-wrapper
        div.dialog-container
          div.dialog-header.d-flex
            slot(name="header") default header
          div.dialog-body
            slot(name="body") default body
          div.dialog-footer
            slot(name="footer")
              div.d-flex
                button.btn.btn-secondary(@click="$emit('cancel')") キャンセル
                button.btn.btn-primary.mr-0.ml-auto(@click="$emit('ok')")
                  slot(name="ok") OK
</template>

<script>
export default {
  name: 'CommonDialog',
  data () {
    return {
      errors: []
    }
  },
  props: ['showDialog']
}
</script>

<style scoped>
button{
  width:8em;
}
.dialog-mask {
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
.dialog-wrapper {
  display: table-cell;
  vertical-align: middle;
}
.dialog-container {
  /*
  width: 70vw;
  min-width: 600px;
  */
  width:360px;
  max-width:480px;
  margin: .5em auto;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
  padding: .5em 1em ;
}

.dialog-header {
  padding: 1em;
  border-bottom: 1px solid #CCC;
}
.dialog-body {
  padding: 1em;
}
.dialog-footer {
  padding: 1em;
}

/*
.dialog-header {
  padding-top: .75em;
  padding-bottom: .75em;
}
*/

/*
 * The following styles are auto-applied to elements with
 * transition="dialog" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the dialog transition by editing
 * these styles.
 */

.dialog-enter {
  opacity: 0;
}

.dialog-leave-active {
  opacity: 0;
}

.dialog-enter .dialog-container,
.dialog-leave-active .dialog-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
label {
    margin-bottom: 0;
    color: #666;
    font-size:.75em;
}
</style>
