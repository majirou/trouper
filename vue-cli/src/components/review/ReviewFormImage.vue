<template lang="pug">
  section.diff-panel.p-2.border.border-gray.border-top-0
    .d-flex
      .w-100.mr-1(:class="{'d-none':isMaximum(2)}" v-show="prevImageSource != null")
        .d-flex.mb-1
          i.btn.far.fa-window-minimize.fa-fw.mr-1(@click="maximizeImage()")
          i.btn.far.fa-window-maximize.fa-fw(@click="maximizeImage(1)" :class="{disable: isMaximum(1)}")
          i.btn.far.fa-clone.fa-fw(@click="toggleFilter(1)")
          .ml-auto.mr-0
            i.btn.fas.fa-sync-alt.fa-fw.mr-2(@click="checkSource")
            span.old.rounded.px-2 {{prevTimestamp}}
      .w-100.mr-1(:class="{'d-none':isMaximum(1)}")
        .d-flex.mb-1
          i.btn.far.fa-window-minimize.fa-fw.mr-1(@click="maximizeImage()" v-show="prevImageSource != null")
          i.btn.far.fa-window-maximize.fa-fw(@click="maximizeImage(2)" :class="{disable: isMaximum(2)}" v-show="prevImageSource != null")
          i.btn.far.fa-clone.fa-fw(@click="toggleFilter(2)" v-show="prevImageSource != null")
          .ml-auto.mr-0
            i.btn.fas.fa-sync-alt.fa-fw.mr-2(@click="checkSource" v-show="prevImageSource != null")
            span.new.rounded.px-2 {{currTimestamp}}
    .d-flex(style="overflow: scroll;margin-top: 1.25em;")
      div(style="position:relative" :class="{'d-none':isMaximum(2)}")
        img.w-100.border(:src="prevImageSource")
        img.w-100.border(:src="diffImageSource" style="position:absolute;left:0;opacity:.75" :class="{'d-none':!isFiltered(1)}")
      div(style="position:relative" :class="{'d-none':isMaximum(1)}")
        img.w-100.border(:src="currImageSource")
        img.w-100.border(:src="diffImageSource" style="position:absolute;left:0;opacity:.75" :class="{'d-none':!isFiltered(2)}")
</template>

<script>
// var axios = require('axios')

export default {
  name: 'ReviewFormImage',
  data () {
    return {
      currImageSource: null,
      prevImageSource: null,
      diffImageSource: null,
      activeImagePanel: 0,
      activeFilter: 0
    }
  },
  props: ['currTarget', 'prevTarget', 'fileName', 'currTimestamp', 'prevTimestamp', 'triggerDiff'],
  methods: {
    maximizeImage: function (num) {
      this.activeImagePanel = num || 0
    },
    isMaximum: function (num) {
      return this.activeImagePanel === num
    },
    toggleFilter: function (num) {
      // console.log(this.activeFilter, num, this.activeFilter & num)
      this.activeFilter = this.isFiltered(num) ? this.activeFilter - num : this.activeFilter + num
    },
    isFiltered: function (num) {
      return (this.activeFilter & num) === num
    },
    checkSource (event) {
      var now = new Date()
      var y = now.getFullYear()
      var m = ('00' + (now.getMonth() + 1)).slice(-2)
      var d = ('00' + now.getDate()).slice(-2)
      var h = ('00' + now.getHours()).slice(-2)
      var i = ('00' + now.getMinutes()).slice(-2)
      var s = ('00' + now.getSeconds()).slice(-2)

      this.diffImageSource = `${this.$dataUrl}/scenario/` +
                              `${this.currTarget.scenarioId}/` +
                              `${this.currTarget.saveDir}/` +
                              `diff_image_${this.prevTarget.saveDir}.png?v=${y}${m}${d}${h}${i}${s}`
    }
  },
  computed: {
    enableDiff: function () {
      return (this.currImageSource != null && this.prevImageSource != null)
    }
  },
  watch: {
    currTarget: function () {
      this.currImageSource = `${this.$dataUrl}/scenario/` +
                             `${this.currTarget.scenarioId}/` +
                             `${this.currTarget.saveDir}/` +
                             `${this.fileName}`
    },
    prevTarget: function () {
      this.prevImageSource = `${this.$dataUrl}/scenario/` +
                             `${this.prevTarget.scenarioId}/` +
                             `${this.prevTarget.saveDir}/` +
                             `${this.fileName}`
    },
    enableDiff: function () {
      if (this.enableDiff) {
        this.diffImageSource = `${this.$dataUrl}/scenario/` +
                               `${this.currTarget.scenarioId}/` +
                               `${this.currTarget.saveDir}/` +
                               `diff_image_${this.prevTarget.saveDir}.png`
      }
    },
    triggerDiff () {
      if (this.triggerDiff) {
        this.diffImageSource = `${this.$dataUrl}/scenario/` +
                               `${this.currTarget.scenarioId}/` +
                               `${this.currTarget.saveDir}/` +
                               `diff_image_${this.prevTarget.saveDir}.png`
        this.$emit('ignite')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.old{
  background-color: #e9aeae;
}
.new{
  background-color: #b4e2b4;
}
.nav{
  li{
    &:last-child{
      label{
        background-color: #dee2e6;
        width: auto;
        &:hover{
          background-color: #dee2e6;
        }
      }
    }
    label {
      text-align: center;
      margin-bottom: 0px !important;
      border-bottom: none;
      width: 6em;
      font-size:.75em;
      cursor: pointer;
      &:hover{
        background-color:#FFF;
      }
    }
  }
  input {
    display: none;
    &:checked + label {
      background-color: #FFF;
    }
  }
}
.diff-panel{
  // overflow: scroll;
  display: flex;
  flex-direction: column;
  .adjuster{
    margin-bottom: 11px;
  }
  .disable {
    opacity: .25;
    cursor: not-allowed;
  }
}
.fade-enter-active ,
.fade-leave-active {
  transition: width .25s ease-in, opacity .25s ease-out;
}
.fade-leave ,fade-enter-to{
  opacity: 1;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
  width: 0% !important;
}
.fa-fw {
  padding-top: .25em;
}
</style>
