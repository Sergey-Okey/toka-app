<template>
  <div class="home">
    <div class="title-block">
      <h1>Ваш Личный Помощник в Мире Задач</h1>
      <span class="slogan">
        Делайте больше, тратя меньше времени. С нашим приложением каждая задача
        становится на своё место, а каждый день — продуктивным.</span
      >
    </div>
    <div class="card-info">
      <div class="card-items">
        <span class="card-title"> Управление задачами стало проще! </span>
        <div class="card-list">
          <div class="list-items">
            <i class="material-icons">rule</i>
            <span class="tree-text">
              Запишите свои планы одним касанием. Забудьте о сложных
              интерфейсах!
            </span>
          </div>
          <div class="list-items">
            <i class="material-icons">rule</i>
            <span class="tree-text">
              Сортируйте, расставляйте приоритеты и назначайте сроки выполнения
              задач.
            </span>
          </div>
          <div class="list-items">
            <i class="material-icons">rule</i>
            <span class="tree-text">
              Никогда не пропустите важное событие. Получайте своевременные
              напоминания.
            </span>
          </div>
        </div>
      </div>
      <div class="card-items">
        <span class="card-title">
          Эффективное планирование дня начинается здесь!
        </span>
        <div class="card-list">
          <div class="list-items">
            <i class="material-icons">toggle_on</i>
            <span class="tree-text">
              Создавайте ежедневные планы и следите за своими делами в одном
              месте.
            </span>
          </div>
          <div class="list-items">
            <i class="material-icons">toggle_on</i>
            <span class="tree-text">
              Анализируйте свою продуктивность и улучшайте результаты.
            </span>
          </div>
          <div class="list-items">
            <i class="material-icons">toggle_on</i>
            <span class="tree-text"> Аналитика и отчёты. </span>
          </div>
        </div>
      </div>
      <div class="card-items">
        <span class="card-title">Планируй. Выполняй. Успевай.</span>
        <div class="card-list">
          <div class="list-items">
            <i class="material-icons">check_box</i>
            <span class="tree-text">
              Оценивай свои достижения и ставь новые цели.
            </span>
          </div>
          <div class="list-items">
            <i class="material-icons">check_box</i>
            <span class="tree-text"> Выгружай статистику своих успехов </span>
          </div>
          <div class="list-items">
            <i class="material-icons">check_box</i>
            <span class="tree-text"> Аналитика и отчёты. </span>
          </div>
        </div>
      </div>
    </div>
    <span class="title">
      Умная AI аналитика, простой и информативный Dashboard
    </span>
    <div class="dasboard-preview">
      <img src="#" alt="dasboard-preview" />
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
      outline: 2px solid #31a974;
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
    color: #31a974; /* Или любой другой цвет */
    font-size: 1.5rem; /* Размер иконки */
  }
  .dasboard-preview {
    margin-top: 100px;
  }
}
</style>
