<template>
  <router-link to="/login">
    <button class="button">Вход</button>
  </router-link>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.button {
  background-color: #31a974;
  border-radius: 1.5rem; /* Исправлено на правильное значение */
  border: solid 1px #dddddd82;
  padding: 10px 30px;
  box-shadow: 0 0 10px 0 #31a974;
  cursor: pointer;
  font-weight: 600;
  color: #000;
  text-decoration: none;
  transition: all 0.3s ease; /* Плавный переход для всех состояний */

  /* Стили при наведении */
  &:hover {
    background-color: #28a763;
    box-shadow: 0 0 15px 0 #28a763;
  }

  /* Стили при фокусе */
  &:focus {
    outline: none;
    border: solid 2px #31a974;
  }
}
</style>
