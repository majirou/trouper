<template lang="pug">
  div
    .row.form-group.p-3
      .col-12
        .d-flex.justify-content-between
          label Scenes:
      .col-12.scenes
        .card-deck.h-100.mx-0
          .card(v-for="(v,i) in scenario.scenes")
            .card-header {{v.url}}
            .card-body
              div {{v.dir}}
              div Actions: {{v.actions.length}}
          button.btn.btn-outline-primary(@click="showSceneModal")
            font-awesome-icon(icon="plus")

      .col-12.col-md-4
        label Scenario Title:
        input.border-primary.form-control(
          type="text" v-model="scenario.title"
        )
      .col-12.col-md-2
        label Scheduled Date:
        input.border-primary.form-control(
          type="date" v-model="scenario.date"
        )
      .col-12.col-md-3
        label Interval:
        .btn-group.btn-group-toggle.w-100
          label.btn.border.border-primary.mt-0(
            v-for="(v,i) in intervalList"
            :class="{'btn-primary':isActiveInterval(v.value)}"
            @click="scenario.interval = v.value"
          ) {{v.text}}

      .col-12.col-md-4
        label E-Mail:
        input.border-primary.form-control(
          type="email" v-model="scenario.mail"
        )
    SceneModal(
      v-if="visibleSceneModal"
      @close="hideSceneModal"
      @register="registerScene"
    )
</template>

<script>
import SceneModal from '~/components/scenario/SceneModal.vue'

export default {
  name: 'ScenarioEditor',
  components: {
    SceneModal
  },
  props: {
    scenario: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      intervalList: [
        { text: 'DAY', value: 0 },
        { text: 'WEEK', value: 1 },
        { text: 'MONTH', value: 2 }
      ],
      visibleRegisterModal: false,
      visibleSceneModal: false
    }
  },
  watch: {
  },
  mounted () {
  },
  methods: {
    isActiveInterval (value) {
      return (parseInt(this.scenario.interval) === parseInt(value))
    },
    showSceneModal () {
      this.visibleSceneModal = true
    },
    hideSceneModal () {
      this.visibleSceneModal = false
    },
    showRegisterModal () {
      this.visibleRegisterModal = true
    },
    hideRegisterModal () {
      this.visibleRegisterModal = false
    },
    setMessage (mode, text) {
      this.$emit('message', mode, text)
    },
    registerScene (sceneData) {
      this.scenario.scenes.push(sceneData)
      this.hideSceneModal()
    }
  }
}
</script>

<style lang="scss" scoped>
.scenes{
  height: 10rem;
  border-top: 1px solid var(--primary);
  border-bottom: 1px solid var(--primary);
  margin: 0.5em 0;
  padding: 0.5em;
  .btn{
    margin-right: 15px;
    margin-left: 15px;
    height: 4em;
    width: 4em;
    margin-top: auto;
    margin-bottom: auto;
  }

  .card-header{
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  @media (min-width: 576px){
    .card{
      width: 30vw;
      max-width: 30vw;
      min-width: 30vw;
      font-size: 0.9em;
    }
  }
  @media (min-width: 992px){
    .card{
      width: 20vw;
      max-width: 20vw;
      min-width: 20vw;
    }
  }
}
</style>
