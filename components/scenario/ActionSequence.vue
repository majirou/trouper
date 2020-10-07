<template lang="pug">
  .card.h-100
    .card-body.p-1
      ul.list-unstyled.d-flex
        li(v-for="(v,i) in sequenceList")
          button(class="btn btn-sm border-primary w-100 py-0")
            span.title {{v.actionValue.text}}<br>
            span {{getElementInfo(v.element)}}
</template>

<script>
export default {
  name: 'ActionSequence',
  props: {
    'sequenceList': {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
    getElementInfo (element) {
      const valid = (v) => {
        return (v != null) && v.length > 0
      }
      const tag = valid(element.tag) ? element.tag.toUpperCase() : ''
      const id = valid(element.id) ? `#${element.id}` : ''
      const className = valid(element.className) ? element.className : ''
      return tag + id + className
    }
  }
}
</script>

<style lang="scss" scoped>
.card{
  .list-unstyled{
    padding: 0.25em;
    margin:0;

    li{
      button {
        max-width: 10vw;
        min-width: 10vw;
        width: 10vw;
        padding: 0.5em;
        .title {
          font-weight: bold;
        }
      }
      &:after{
        margin: 0 0.5em;
        content: ">";
      }
      &:last-child:after{
        content: none;
      }
    }
  }
}
</style>

<style lang="scss">
ul li:last-child .arrow{
  display:none;
}
</style>
