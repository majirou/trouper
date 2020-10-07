<template lang="pug">
  div(
    :id="contextMenuId"
  )
    .card.shadow.border-dark
      .card-header.py-2
        slot(name="header")
      .card-body.p-2
        slot(name="body")
      .card-footer.p-2
        slot(name="footer")
</template>

<script>
export default {
  name: 'ContextMenu',
  props: {
    eventValue: {
      type: Object,
      default: () => {}
    },
    posX: {
      type: Number,
      default: () => 0
    },
    posY: {
      type: Number,
      default: () => 0
    },
    draggedX: {
      type: Number,
      default: () => 0
    },
    draggedY: {
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
      contextMenuId: 'context-wrapper'
    }
  },
  watch: {
    posX () {
      this.updatePosition()
    },
    posY () {
      this.updatePosition()
    },
    draggedX () {
      this.updatePosition()
    },
    draggedY () {
      this.updatePosition()
    }
  },
  mounted () {
    this.updatePosition()
  },
  methods: {
    updatePosition () {
      if (this.baseId == null) {
        return false
      }
      const b = document.querySelector(`#${this.baseId}`)

      if (b == null) {
        return false
      }
      const r = b.getBoundingClientRect()
      const t = document.querySelector(`#${this.contextMenuId}`)

      const rr = t.getBoundingClientRect()

      const _x = (this.posX + r.x + 5)
      const _y = (this.posY + r.y + 5)

      t.style.left = (((rr.width + rr.x) > r.width) ? _x - rr.width : _x) + 'px'
      t.style.top = (((rr.height + rr.y) > r.height) ? _y - (rr.width / 2) : _y) + 'px'
    }
  }
}
</script>

<style lang="scss" scoped>
#context-wrapper{
  position: fixed;
  z-index: 5000;
  li{
    cursor:pointer;
  }
}
.card-header:hover{
  cursor:move;
}
</style>
