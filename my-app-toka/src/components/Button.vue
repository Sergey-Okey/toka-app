<template>
  <button class="button">
    <router-link to="/login">Вход</router-link>
  </button>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.button {
  background-color: #31a974;
  border-radius: 1.5ric;
  border: solid 1px #dddddd82;
  padding: 10px 30px;
  box-shadow: 0 0 10px 0 #31a974;
  cursor: pointer;

  a {
    text-decoration: none;
    list-style: none;
    color: rgb(0, 0, 0);
    font-weight: 600;
  }
}
</style>
