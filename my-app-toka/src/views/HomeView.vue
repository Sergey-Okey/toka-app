<template>
  <div class="home">
    <!-- Hero-секция -->
    <section class="hero">
      <div class="hero-content">
        <h1>Ваш цифровой ассистент для максимальной продуктивности</h1>
        <p class="subtitle">
          Интеллектуальная система управления задачами, которая адаптируется под
          ваш стиль работы
        </p>
        <div class="cta-buttons">
          <router-link to="/register" class="cta-primary"
            >Начать бесплатно</router-link
          >
          <router-link to="/features" class="cta-secondary">
            <i class="material-icons">play_circle</i>
            Смотреть демо
          </router-link>
        </div>
      </div>
      <div class="hero-image">
        <img
          src="@/assets/images/dashboard-preview.png"
          alt="Превью интерфейса"
        />
      </div>
    </section>

    <!-- Блок преимуществ -->
    <section class="benefits">
      <div class="section-header">
        <h2>Почему выбирают Toka</h2>
        <p>Инновационные технологии для вашей эффективности</p>
      </div>

      <div class="benefits-grid">
        <div class="benefit-card">
          <div class="icon-wrapper">
            <i class="material-icons">auto_awesome</i>
          </div>
          <h3>AI-аналитика</h3>
          <p>
            Умные алгоритмы анализируют вашу продуктивность и дают
            персонализированные рекомендации
          </p>
        </div>

        <div class="benefit-card">
          <div class="icon-wrapper">
            <i class="material-icons">sync_alt</i>
          </div>
          <h3>Кроссплатформенность</h3>
          <p>
            Доступ к задачам с любого устройства: веб, мобильные приложения,
            десктоп
          </p>
        </div>

        <div class="benefit-card">
          <div class="icon-wrapper">
            <i class="material-icons">lock</i>
          </div>
          <h3>Безопасность</h3>
          <p>
            End-to-end шифрование и регулярное резервное копирование ваших
            данных
          </p>
        </div>
      </div>
    </section>

    <!-- Блок интеграций -->
    <section class="integrations">
      <div class="section-header">
        <h2>Интеграции с популярными сервисами</h2>
        <p>Работайте в привычной экосистеме</p>
      </div>

      <div class="logos-grid">
        <div
          class="logo-item"
          v-for="(logo, index) in integrations"
          :key="index"
        >
          <img :src="logo.img" :alt="logo.name" />
        </div>
      </div>
    </section>

    <!-- Блок отзывов -->
    <section class="testimonials">
      <div class="section-header">
        <h2>Что говорят наши пользователи</h2>
        <p>Более 10,000 довольных клиентов по всему миру</p>
      </div>

      <div class="testimonials-slider">
        <div
          class="testimonial-card"
          v-for="(review, index) in reviews"
          :key="index"
        >
          <div class="rating">
            <i class="material-icons" v-for="star in 5" :key="star">
              {{ star <= review.rating ? 'star' : 'star_border' }}
            </i>
          </div>
          <p class="quote">"{{ review.text }}"</p>
          <div class="author">
            <img :src="review.avatar" :alt="review.name" />
            <div>
              <h4>{{ review.name }}</h4>
              <p>{{ review.position }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA секция -->
    <section class="final-cta">
      <h2>Готовы повысить свою продуктивность?</h2>
      <p>
        Присоединяйтесь к 50,000+ профессионалам, которые уже используют Toka
      </p>
      <router-link to="/register" class="cta-primary"
        >Попробовать бесплатно</router-link
      >
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const integrations = ref([
  { name: 'Google Calendar', img: '/images/logos/google-calendar.png' },
  { name: 'Slack', img: '/images/logos/slack.png' },
  { name: 'Microsoft Teams', img: '/images/logos/teams.png' },
  { name: 'Trello', img: '/images/logos/trello.png' },
  { name: 'Notion', img: '/images/logos/notion.png' },
  { name: 'Zoom', img: '/images/logos/zoom.png' },
])

const reviews = ref([
  {
    text: 'Toka полностью изменила мой подход к организации работы. Теперь я успеваю в 2 раза больше!',
    rating: 5,
    name: 'Анна Ковалёва',
    position: 'Project Manager',
    avatar: '/images/avatars/avatar1.jpg',
  },
  {
    text: 'Лучшее приложение для управления задачами, которое я использовал. AI-аналитика просто потрясающая!',
    rating: 4,
    name: 'Дмитрий Смирнов',
    position: 'UX Designer',
    avatar: '/images/avatars/avatar2.jpg',
  },
  {
    text: 'Простота использования и мощные функции - идеальное сочетание. Рекомендую всем коллегам!',
    rating: 5,
    name: 'Ольга Петрова',
    position: 'Marketing Director',
    avatar: '/images/avatars/avatar3.jpg',
  },
])
</script>

<style lang="scss" scoped>
.home {
  width: 100%;
  color: var(--text-primary);

  overflow-x: hidden;
}

/* Hero секция */
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xl) var(--space-xl);
  max-width: 1400px;
  margin: 0 auto;
  gap: var(--space-xl);

  &-content {
    flex: 1;
    max-width: 600px;

    h1 {
      font-size: clamp(var(--text-2xl), 5vw, 3.5rem);
      line-height: 1.2;
      margin-bottom: var(--space-md);
    }

    .subtitle {
      font-size: var(--text-lg);
      color: var(--text-secondary);
      margin-bottom: var(--space-xl);
      line-height: 1.6;
    }
  }

  &-image {
    flex: 1;
    img {
      width: 100%;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
    }
  }
}

.cta-buttons {
  display: flex;
  gap: var(--space-md);
  align-items: center;

  a {
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--radius-md);
    font-weight: 600;
    text-decoration: none;
    transition: all var(--transition-normal) var(--ease-out);
    display: flex;
    align-items: center;
    gap: var(--space-xs);

    i {
      font-size: var(--text-lg);
    }
  }

  .cta-primary {
    background-color: var(--primary);
    color: white;

    &:hover {
      background-color: rgba(var(--primary-rgb), 0.9);
      transform: translateY(-2px);
    }
  }

  .cta-secondary {
    border: 1px solid var(--border);
    color: var(--text-primary);

    &:hover {
      background-color: var(--bg-secondary);
      border-color: var(--primary);
    }
  }
}

/* Общие стили секций */
.section-header {
  text-align: center;
  margin-bottom: var(--space-xl);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 var(--space-md);

  h2 {
    font-size: clamp(var(--text-xl), 4vw, 2.5rem);
    margin-bottom: var(--space-sm);
  }

  p {
    color: var(--text-secondary);
    font-size: var(--text-lg);
  }
}

/* Секция преимуществ */
.benefits {
  padding: var(--space-xl) 0;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-lg);
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.benefit-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  border: 1px solid var(--border);
  transition: all var(--transition-normal) var(--ease-out);

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
    border-color: var(--primary);
  }

  .icon-wrapper {
    width: 60px;
    height: 60px;
    background: rgba(var(--primary-rgb), 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--space-md);

    i {
      font-size: var(--text-2xl);
      color: var(--primary);
    }
  }

  h3 {
    font-size: var(--text-lg);
    margin-bottom: var(--space-sm);
  }

  p {
    color: var(--text-secondary);
    line-height: 1.6;
  }
}

/* Секция интеграций */
.integrations {
  padding: var(--space-xl) 0;
}

.logos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-xl);
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
  align-items: center;

  .logo-item {
    display: flex;
    justify-content: center;
    padding: var(--space-md);
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    transition: all var(--transition-normal) var(--ease-out);

    &:hover {
      transform: scale(1.05);
    }

    img {
      max-width: 100%;
      height: 40px;
      object-fit: contain;
      filter: grayscale(100%);
      opacity: 0.7;
      transition: all var(--transition-normal) var(--ease-out);
    }

    &:hover img {
      filter: grayscale(0);
      opacity: 1;
    }
  }
}

/* Секция отзывов */
.testimonials {
  padding: var(--space-xl) 0;
}

.testimonials-slider {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-lg);
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.testimonial-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  border: 1px solid var(--border);

  .rating {
    color: var(--primary);
    margin-bottom: var(--space-md);
    display: flex;
    gap: 2px;
  }

  .quote {
    font-style: italic;
    margin-bottom: var(--space-lg);
    line-height: 1.6;
  }

  .author {
    display: flex;
    align-items: center;
    gap: var(--space-md);

    img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
    }

    h4 {
      margin-bottom: 2px;
    }

    p {
      color: var(--text-tertiary);
      font-size: var(--text-sm);
    }
  }
}

/* Финальная CTA секция */
.final-cta {
  text-align: center;
  padding: var(--space-xl) var(--space-md);
  max-width: 800px;
  margin: 0 auto;

  h2 {
    font-size: clamp(var(--text-xl), 4vw, 2.5rem);
    margin-bottom: var(--space-md);
  }

  p {
    color: var(--text-secondary);
    margin-bottom: var(--space-xl);
    font-size: var(--text-lg);
  }
}

/* Адаптивность */
@media (max-width: 1024px) {
  .hero {
    flex-direction: column;
    text-align: center;
    padding: var(--space-xl) var(--space-md);

    &-content {
      max-width: 100%;
    }

    .cta-buttons {
      justify-content: center;
    }
  }

  .benefits-grid,
  .testimonials-slider {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .cta-buttons {
    flex-direction: column;
  }

  .logos-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .logos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
