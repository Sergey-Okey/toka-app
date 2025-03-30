<template>
  <div class="home">
    <div class="title-block">
      <h1>Ваш Личный Помощник в Мире Задач</h1>
      <span class="slogan"
        >Делайте больше, тратя меньше времени. С нашим приложением каждая задача
        становится на своё место, а каждый день — продуктивным.</span
      >
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.home {
  width: 100%;

  .title-block {
    height: 500px;
    padding: 20% 0;
    display: flex;
    flex-direction: column;
    align-items: center;

    h1 {
      font-size: 3rem;
    }
    .slogan {
      display: flex;
      color: #b0b0b0dd;
      max-width: 50rem;
    }
  }
}
</style>
