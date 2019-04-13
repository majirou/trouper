<template lang="pug">
  main
    //-
      header
        nav.navbar.navbar-expand.navbar-dark.bg-dark
          ul.navbar-nav.mr-auto
            li.nav-item
              router-link.nav-link(to="/") Main
            li.nav-item
              router-link.nav-link(to="/help") Help
    header.breadcrumbs.mb-1
      nav.bg-dark.text-light
        ul.nav
          li.nav-item(v-for="(v,i) in bc" :key="i")
            span.nav-link(@click="movePage(v.href)") {{v.text}}
    router-view(@breadcrumbs="setBreadcrumbs")
</template>

<script>
export default {
  name: 'MainApp',
  data () {
    return {
      bc: null
    }
  },
  mounted () {
    const qs = document.location.search
    if (qs != null && qs !== '') {
      const hash = qs.slice(1).split('&').filter(m => {
        const _m = m.split('=')
        return (_m[0] === 'backto') ? _m[1].replace(/%2F/g, '/') : false
      })
      if (hash.length === 1) {
        const redirectUrl = hash.pop().split('=')[1].replace(/%2F/g, '/')
        this.$router.push(redirectUrl)
      }
    }
  },
  methods: {
    setBreadcrumbs (bc) {
      this.bc = bc
    },
    movePage (href) {
      this.$router.push(href)
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
header {
  margin-bottom: 1em;
}

::placeholder {
  color: #999;
  font-size: 0.75em;
  font-style: italic;
}
</style>
<style scoped lang="scss">
.breadcrumbs{
  li{
    .nav-link{
      display: initial !important;
      &:hover{
        cursor: pointer;
        text-decoration: underline;
      }
    }
    &:after {
      font-family: "Font Awesome 5 Free";
      font-weight: 900;
      content: "\f105";
      pointer-events: none;
    }
    &:last-child {
      pointer-events: none;
      color: #999;
      .btn-link{
        color: inherit !important;
      }
    }
    &:last-child:after{
      content: "" !important;
    }
  }
}
</style>
<style>
.router-link-exact-active.router-link-active {
    color: #F0F0F0 !important;
    border-bottom: 3px solid #F0F0F0;
    padding-bottom: 0;
}
.lock-mask {
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

.lock-wrapper {
  display: table-cell;
  vertical-align: middle;
  cursor: wait;
}

.lock-container {
  max-width: 20em;
  width: 16em;
  margin: 0px auto;
  background-color: #fff;
  border-radius: .25em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
  padding: 1em;
  border: 3px solid #000;
  text-align: center;
}

</style>
