<template lang="pug">
  .card.flex-row
    .card-header.border-bottom-0.border-right.px-2.py-1
      span Actions
    .card-body.p-1.d-flex
      select.mr-2(
        class="form-control form-control-sm"
        v-model="actionValue"
        @change="emitActionValue"
      )
        option
        option(
          v-for="(v,i) in actionsList"
          :value="v.id"
          :key="i"
          :disabled="isDisabledAction(v.id)"
        ) {{v.text}}
      input.form-control.form-control-sm(
        v-model="inputValue"
        v-if="actionValue === 1"
        @change="emitActionValue"
      )
</template>

<script>
import CapturingElements from '@/components/scenario/CapturingElements.vue'

export default {
  name: 'ActionForm',
  components: {
    CapturingElements
  },
  props: {
    'disabled': {
      type: Boolean,
      default: () => false
    },
    'element': {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      value: null,
      actionsList: [
        { id: 1, text: 'input' },
        { id: 2, text: 'click' },
        { id: 3, text: 'submit' },
        { id: 4, text: 'capture text' }
      ],
      actionValue: null,
      inputValue: null,
      targetValue: null
    }
  },
  computed: {
    isActiveElement () {
      let counter = 0
      Object.entries(this.element).forEach(([id, val]) => {
        if (val != null) {
          counter++
        }
      })
      return counter > 0
    }
  },
  watch: {
    actionValue () {
      if (this.actionValue !== 1) {
        this.inputValue = null
      }
    },
    isActiveElement () {
      if (!this.isActiveElement) {
        this.actionValue = null
      }
    }
  },
  mounted () {
  },
  methods: {
    emitActionValue (event) {
      // const v = (event.currentTarget == null) ? null : event.currentTarget.value
      const v = {
        actionValue: this.actionsList.find(v => v.id === this.actionValue),
        inputValue: this.inputValue
      }
      this.$emit('change', v)
    },
    isDisabledAction (id) {
      return (id === 5) ? this.disabled : !this.isActiveElement
    }
  }
}
</script>

<style lang="scss" scoped>
option:disabled {
  background-color: #999;
  color: #FFF;
}
.card-header {
  width: 6em;
  text-align: center;
}
</style>
