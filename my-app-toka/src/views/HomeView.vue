<template>
  <div class="home">
    <section class="title-block">
      <h1>Ваш Личный Помощник в Мире Задач</h1>
      <p class="slogan">
        Делайте больше, тратя меньше времени. С нашим приложением каждая задача
        <br />
        становится на своё место, а каждый день — продуктивным.
      </p>
    </section>

    <section class="card-info">
      <div v-for="(card, index) in cards" :key="index" class="card-item">
        <h2 class="card-title">{{ card.title }}</h2>
        <div class="card-list">
          <div v-for="(item, i) in card.items" :key="i" class="list-item">
            <i class="material-icons">{{ item.icon }}</i>
            <span class="text">{{ item.text }}</span>
          </div>
        </div>
      </div>
    </section>

    <h2 class="dashboard-title">
      Умная AI-аналитика, простой и информативный Dashboard
    </h2>

    <section class="dashboard-preview">
      <Dashboard />
    </section>
  </div>
</template>

<script setup lang="ts">
import Dashboard from '@/components/Dashboard.vue'

const cards = [
  {
    title: 'Управление задачами стало проще!',
    items: [
      { icon: 'rule', text: 'Запишите свои планы одним касанием.' },
      { icon: 'rule', text: 'Сортируйте задачи и назначайте сроки.' },
      { icon: 'rule', text: 'Получайте своевременные напоминания.' },
    ],
  },
  {
    title: 'Эффективное планирование дня начинается здесь!',
    items: [
      { icon: 'toggle_on', text: 'Создавайте ежедневные планы.' },
      { icon: 'toggle_on', text: 'Анализируйте свою продуктивность.' },
      { icon: 'toggle_on', text: 'Генерируйте аналитические отчёты.' },
    ],
  },
  {
    title: 'Планируй. Выполняй. Успевай.',
    items: [
      { icon: 'check_box', text: 'Оценивайте достижения и ставьте цели.' },
      { icon: 'check_box', text: 'Выгружайте статистику успехов.' },
      { icon: 'check_box', text: 'Аналитика и отчёты в один клик.' },
    ],
  },
]
</script>

<style lang="scss" scoped>
.home {
  width: 100%;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;

  .title-block {
    max-width: 100%;
    text-align: center;
    margin: 7rem 0;

    h1 {
      font-size: clamp(2rem, 5vw, 3rem);
      margin-bottom: 1rem;
    }

    .slogan {
      color: #b0b0b0;
      font-size: 1rem;
      line-height: 1.5;
      margin: 0 auto;
    }
  }

  .card-info {
    display: flex;
    width: 100%;
    gap: 2rem;
    justify-content: center;
    margin-bottom: 4rem;
  }

  .card-item {
    width: 320px;
    padding: 2rem 1.5rem;
    backdrop-filter: blur(50px);
    border-radius: 1.2rem;
    border: 1px solid rgba(221, 221, 221, 0.5);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 0 30px rgba(49, 169, 116, 0.4);
      border-color: #31a974;
    }

    .card-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .card-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .list-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .material-icons {
          color: #31a974;
          font-size: 1.5rem;
        }

        .text {
          color: #9b9a9a;
          text-align: left;
          flex: 1;
        }
      }
    }
  }

  .dashboard-title {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 700;
    text-align: center;
    margin-top: 7rem;
    max-width: 100%;
  }

  .dashboard-preview {
    width: 100%;
    max-width: 1200px;
    margin-bottom: 4rem;
  }
}

/* Адаптив */
@media (max-width: 768px) {
  .card-info {
    gap: 1.5rem;
    flex-wrap: wrap;
  }
  .title-block {
    .slogan {
      width: 90%;
    }
  }

  .card-item {
    width: 100%;
  }

  .dashboard-preview {
    padding: 0 1rem;
  }
}
</style>
