<template>
  <div class="home">
    <div class="title-block">
      <h1>Ваш Личный Помощник в Мире Задач</h1>
      <span class="slogan">
        Делайте больше, тратя меньше времени. С нашим приложением каждая задача
        становится на своё место, а каждый день — продуктивным.
      </span>
    </div>

    <div class="card-info">
      <div v-for="(card, index) in cards" :key="index" class="card-items">
        <span class="card-title">{{ card.title }}</span>
        <div class="card-list">
          <div v-for="(item, i) in card.items" :key="i" class="list-items">
            <i class="material-icons">{{ item.icon }}</i>
            <span class="tree-text">{{ item.text }}</span>
          </div>
        </div>
      </div>
    </div>
    <span class="title">
      Умная AI аналитика, простой и информативный Dashboard
    </span>
    <div class="dasboard-preview">
      <Dashboard />
    </div>
  </div>
</template>

<script setup lang="ts">
import Dashboard from '@/components/Dashboard.vue'

const cards = [
  {
    title: 'Управление задачами стало проще!',
    items: [
      {
        icon: 'rule',
        text: 'Запишите свои планы одним касанием. Забудьте о сложных интерфейсах!',
      },
      {
        icon: 'rule',
        text: 'Сортируйте, расставляйте приоритеты и назначайте сроки выполнения задач.',
      },
      {
        icon: 'rule',
        text: 'Никогда не пропустите важное событие. Получайте своевременные напоминания.',
      },
    ],
  },
  {
    title: 'Эффективное планирование дня начинается здесь!',
    items: [
      {
        icon: 'toggle_on',
        text: 'Создавайте ежедневные планы и следите за своими делами в одном месте.',
      },
      {
        icon: 'toggle_on',
        text: 'Анализируйте свою продуктивность и улучшайте результаты.',
      },
      { icon: 'toggle_on', text: 'Аналитика и отчёты.' },
    ],
  },
  {
    title: 'Планируй. Выполняй. Успевай.',
    items: [
      {
        icon: 'check_box',
        text: 'Оценивай свои достижения и ставь новые цели.',
      },
      { icon: 'check_box', text: 'Выгружай статистику своих успехов.' },
      { icon: 'check_box', text: 'Аналитика и отчёты.' },
    ],
  },
]
</script>

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

  .card-info {
    display: flex;
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 20px;
    margin-bottom: 100px;
  }

  .card-items {
    cursor: pointer;
    width: 320px;
    backdrop-filter: blur(10px);
    background-color: #ffffff1b;
    border-radius: 2ric;
    outline: solid 1px #dddddd82;
    padding: 2rem 1rem;
    position: relative;
    transition:
      transform 0.5s ease,
      outline 0.5s ease,
      box-shadow 0.5s ease;

    &:hover {
      transform: scale(1.01);
      transition: 0.5s ease;
      outline: 1px solid #31a974;
      box-shadow: 0 0 50px 0 #31a9754d;
    }

    .card-title {
      display: flex;
      font-size: 1.5rem;
      text-align: center;
      font-weight: 800;
      height: 110px;
      transition: text-shadow 0.3s ease-in-out;
      margin-bottom: 1rem;
    }
  }
  .card-list {
    display: flex;
    flex-direction: column;
    margin: auto 0;
    gap: 0.5rem;
    .list-items {
      display: flex;
      gap: 10px;
      .tree-text {
        display: flex;
        text-align: left;
        color: rgb(155, 154, 154);
      }
    }
  }
  .material-icons {
    color: #31a974;
    font-size: 1.5rem;
  }
  .dasboard-preview {
    margin-top: 100px;
  }
}
</style>
