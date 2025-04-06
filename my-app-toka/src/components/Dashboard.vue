<template>
  <div class="dashboard">
    <h2 class="title">Обзор продуктивности</h2>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.dashboard {
  padding: 20px;

  .title {
    font-size: 1.8rem;
    margin-bottom: 20px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }

  .card-content {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px;

    i {
      font-size: 2rem;
      color: #31a974;
    }

    h3 {
      font-size: 1.5rem;
      margin: 0;
    }
  }

  .chart-container {
    margin-top: 20px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 10px;
    padding: 20px;
  }
}
</style>
