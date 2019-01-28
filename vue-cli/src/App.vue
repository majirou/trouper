<template lang="pug">
  section
    header
      nav.navbar.navbar-expand.navbar-dark.bg-dark
        ul.navbar-nav.mr-auto
          li.nav-item
            router-link.nav-link(to="/") Main
          li.nav-item
            router-link.nav-link(to="/help") Help
          li.nav-item
            router-link.nav-link(to="/about") About
    router-view
</template>

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
