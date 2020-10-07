<template lang="pug">
  ContextMenu(
    :pos-x = "x"
    :pos-y = "y"
    :base-id = "baseId"
    :class="{'d-none': !visibleContextMenu}"
  )
    template(slot="header")
      div action
    template(slot="body")
      ActiveElementComponent(
        :element="activeElement"
      )
      ActionForm.mt-1.w-auto(
        :element="activeElement"
        @change="setTemporaryAction"
      )
    template(slot="footer")
      .w-100.d-flex.justify-content-between
        button.btn.btn-sm.btn-secondary(@click="hideContextMenu") CLOSE
        div
          button.btn.btn-sm.btn-primary.mr-3(
            @click="selectParentNode"
            :disabled="disabled"
          ) PARENT
          button.btn.btn-sm.btn-warning.mr-2.ml-auto(
            @click="addActionSequence"
            :disabled="!isEnabledToAdd"
          )
            font-awesome-icon.mr-2(icon="plus")
            | ADD
</template>

<script>
import ActionForm from '@/components/scenario/ActionForm.vue'
import ActiveElementComponent from '@/components/scenario/ActiveElement.vue'
import ContextMenu from '~/components/common/ContextMenu'

export default {
  name: 'TargetContextMenu',
  components: {
    ActionForm, ActiveElementComponent, ContextMenu
  },
  props: {
    activeElement: {
      type: Object,
      default: () => null
    },
    visible: {
      type: Boolean,
      default: () => false
    },
    posX: {
      type: Number,
      default: () => 0
    },
    posY: {
      type: Number,
      default: () => 0
    },
    baseId: {
      type: String,
      default: () => null
    }
  },
  data () {
    return {
      x: 0,
      y: 0,
      temporaryAction: null
    }
  },
  computed: {
    disabled () {
      return false
    },
    visibleContextMenu () {
      let _r = null
      if (this.activeElement == null) {
        _r = false
      } else {
        let _c = 0
        Object.values(this.activeElement).forEach((v) => {
          _c += (v == null) ? 0 : 1
        })
        _r = (_c > 0)
      }
      return _r
    },
    isEnabledToAdd () {
      return this.temporaryAction != null &&
        this.temporaryAction.actionValue != null &&
        this.temporaryAction.actionValue.id != null &&
        this.activeElement != null &&
        this.activeElement.className != null &&
        this.activeElement.id != null &&
        this.activeElement.index != null &&
        this.activeElement.name != null &&
        this.activeElement.tag != null
    }
  },
  watch: {
    posX () {
      this.updatePosition()
    },
    posY () {
      this.updatePosition()
    }
  },
  mounted () {
  },
  methods: {
    selectParentNode (element) {
      this.$emit('parent', element)
    },
    clearNode (element) {
      this.$emit('clear', element)
      this.hideContextMenu()
    },
    setTemporaryAction (value) {
      this.temporaryAction = value
      this.$emit('temporary', value)
    },
    addActionSequence (value) {
      console.log('addActionSequence', value)
      this.$emit('add', value)
    },
    hideContextMenu () {
      this.$emit('clear', null)
    },
    updatePosition () {
      this.x = this.posX * 1
      this.y = this.posY * 1
    }
  }
}
</script>
