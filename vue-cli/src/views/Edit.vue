<template>
  <section>
    <ScenarioForm :scenarioId="scenarioId"></ScenarioForm>
  </section>
</template>

<script>
import ScenarioForm from '@/components/scenario/ScenarioForm.vue'

export default {
  name: 'ViewScenarioEditor',
  data () {
    return {
      scenarioId: null
    }
  },
  components: {
    ScenarioForm
  },
  mounted: function () {
    this.scenarioId = this.$route.params.id
  }
}
</script>
