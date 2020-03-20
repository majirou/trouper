<template>
  <div>
    <nuxt />
  </div>
</template>

<style>

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
