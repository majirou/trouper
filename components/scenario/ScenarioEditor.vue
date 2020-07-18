<template lang="pug">
  div
    .row.form-group.p-3
      .col-12
        .d-flex.justify-content-between
          label Scenes:
          button.btn.btn-sm.btn-primary(@click="showSceneModal")
            font-awesome-icon(icon="plus")
      .col-12.scenes
        .card-deck
          .card(v-for="(v,i) in scenarioData.scenes")
            div {{v}}
      .col-12.col-md-4
        label Scenario Title:
        input.border-primary.form-control(
          type="text" v-model="scenarioData.title"
        )
      .col-12.col-md-2
        label Scheduled Date:
        input.border-primary.form-control(
          type="date" v-model="scenarioData.date"
        )
      .col-12.col-md-3
        label Interval:
        .btn-group.btn-group-toggle.w-100
          label.btn.border.border-primary.mt-0(
            v-for="(v,i) in intervalList"
            :class="{'btn-primary':isActiveInterval(v.value)}"
            @click="scenarioData.interval = v.value"
          ) {{v.text}}

      .col-12.col-md-4
        label E-Mail:
        input.border-primary.form-control(
          type="email" v-model="scenarioData.mail"
        )
    Modal#scene(
      v-if="visibleSceneModal"
      @cancel="hideSceneModal"
      @close="hideSceneModal"
      @ok="hideSceneModal"
      :visibleClose="false"
      :visibleFooter="true"
      :containerStyle="containerStyle"
      :footerStyle="footerStyle"
      :zIndex=2000
    )
      template(slot="body")
        RegisterForm(
          @message = "setMessage"
          @close = "hideRegisterModal"
        )
      template(slot="footer")
        .w-100.d-flex.justify-content-between
          button.btn.btn-secondary(@click="hideSceneModal") CLOSE
          button.btn.btn-warning.mr-0.ml-auto(
            @click="register"
          )
            slot(name="ok")
              font-awesome-icon(icon="save").mr-2
              | REGISTER
</template>

<script>
import Modal from '~/components/common/BaseModal'
import RegisterForm from '~/components/scenario/SceneForm'

export default {
  name: 'ScenarioEditor',
  components: {
    Modal,
    RegisterForm
  },
  props: {
    scenarioData: {
      type: Object,
      default: () => {
        return {
          title: null,
          date: null,
          mail: null,
          interval: 1,
          scenes: []
        }
      }
    }
  },
  data () {
    return {
      intervalList: [
        { text: 'DAY', value: 0 },
        { text: 'WEEK', value: 1 },
        { text: 'MONTH', value: 2 }
      ],
      visibleSceneModal: false,
      visibleRegisterModal: false,
      containerStyle: {
        width: '100vw',
        height: '100vh',
        margin: 0,
        'border-radius': 0
      },
      footerStyle: {
        'padding-top': '0.125em',
        'padding-bottom': '0.125em'
      }
    }
  },
  watch: {
  },
  mounted () {
  },
  methods: {
    isActiveInterval (value) {
      return (parseInt(this.scenarioData.interval) === parseInt(value))
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
    setMessage (a, b, c, d) {
      console.log(a, b, c, d)
      // this.$emit('message', 3, message)
    },
    register () {

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
}
</style>
