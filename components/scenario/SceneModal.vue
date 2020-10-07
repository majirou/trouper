<template lang="pug">
  Modal#scene(
    :visible-close="false"
    :visible-footer="true"
    :container-style="containerStyle"
    :footer-style="footerStyle"
    :z-index=2000
  )
    template(slot="body")
      SceneForm(
        :scene-data = "sceneData"
      )
    template(slot="footer")
      .w-100.d-flex.justify-content-between
        button.btn.btn-secondary(@click="hideModal") CLOSE
        button.btn.btn-warning.mr-0.ml-auto(
          @click="register"
          :disabled="!registerable"
        )
          slot(name="ok")
            font-awesome-icon(icon="save").mr-2
            | REGISTER
</template>

<script>
import Modal from '~/components/common/BaseModal.vue'
import SceneForm from '~/components/scenario/SceneForm.vue'

export default {
  name: 'SceneModal',
  components: {
    Modal,
    SceneForm
  },
  data () {
    return {
      visibleSceneModal: false,
      containerStyle: {
        width: '100vw',
        height: '100vh',
        margin: 0,
        'border-radius': 0,
        display: 'flex',
        'flex-direction': 'column'
      },
      footerStyle: {
        'padding-top': '0.125em',
        'padding-bottom': '0.125em',
        'position': 'sticky',
        'bottom': 0,
        'background': '#FFF'
      },
      sceneData: {
        url: null,
        dir: null,
        actions: []
      }
    }
  },
  computed: {
    registerable () {
      return this.sceneData.url != null &&
        this.sceneData.dir != null &&
        this.sceneData.actions.length > 0
    }
  },
  methods: {
    hideModal () {
      this.$emit('close')
    },
    register () {
      this.$emit('register', this.sceneData)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
