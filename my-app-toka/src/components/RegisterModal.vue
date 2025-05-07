<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="auth-modal" :class="{ 'modal-entering': animateIn }">
      <button class="close-btn" @click="closeModal">
        <i class="material-icons">close</i>
      </button>

      <div class="auth-header">
        <div class="auth-icon pulse">
          <i class="material-icons">person_add</i>
        </div>
        <h2>Создать аккаунт</h2>
        <p>Присоединяйтесь к нашему сообществу</p>
      </div>

      <form class="auth-form" @submit.prevent="handleRegister">
        <div class="input-group" v-for="field in fields" :key="field.id">
          <i class="material-icons">{{ field.icon }}</i>
          <input
            :type="field.type"
            v-model="field.model"
            :placeholder="field.placeholder"
            :required="field.required"
            @focus="field.active = true"
            @blur="field.active = false"
            :class="{ 'input-active': field.active }"
          />
        </div>

        <div class="terms-agreement">
          <label class="checkbox-container">
            <input type="checkbox" v-model="agreeTerms" required />
            <span class="checkmark"></span>
            <span class="terms-text">
              Я согласен с <a href="#">Условиями</a> и <a href="#">Политикой</a>
            </span>
          </label>
        </div>

        <button type="submit" class="btn-primary">
          <i class="material-icons">how_to_reg</i>
          <span>Зарегистрироваться</span>
        </button>

        <div class="auth-divider">
          <span class="divider-line"></span>
          <span class="divider-text">или</span>
          <span class="divider-line"></span>
        </div>

        <button type="button" class="btn-social google">
          <i class="material-icons">mail</i>
          <span>Продолжить с Google</span>
        </button>
        <div class="auth-footer">
          Уже есть аккаунт?
          <router-link to="/login" @click.prevent="switchToLogin"
            >Войти</router-link
          >
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['close', 'switch-to-login'])

const animateIn = ref(false)
const agreeTerms = ref(false)

const fields = ref([
  {
    id: 1,
    icon: 'person',
    type: 'text',
    model: '',
    placeholder: 'Ваше имя',
    required: true,
    active: false,
  },
  {
    id: 2,
    icon: 'email',
    type: 'email',
    model: '',
    placeholder: 'Ваш email',
    required: true,
    active: false,
  },
  {
    id: 3,
    icon: 'lock',
    type: 'password',
    model: '',
    placeholder: 'Пароль',
    required: true,
    active: false,
  },
  {
    id: 4,
    icon: 'lock_outline',
    type: 'password',
    model: '',
    placeholder: 'Подтвердите пароль',
    required: true,
    active: false,
  },
])

onMounted(() => {
  setTimeout(() => (animateIn.value = true), 10)
})

const handleRegister = () => {
  console.log('Registering...')
  emit('close')
}

import { useRouter } from 'vue-router'

const router = useRouter()

const closeModal = () => {
  animateIn.value = false // Запускаем анимацию закрытия
  setTimeout(() => {
    emit('close') // Закрываем модалку
    router.push('/') // Перенаправляем на главную
  }, 300) // После завершения анимации
}

const switchToLogin = () => {
  animateIn.value = false
  setTimeout(() => emit('switch-to-login'), 300)
}
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn var(--transition-normal) var(--ease-out);
}

.auth-modal {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border);
  transform: translateY(20px);
  opacity: 0;
  transition: all var(--transition-normal) var(--ease-bounce);

  &.modal-entering {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  width: var(--icon-size);
  height: var(--icon-size);
  border-radius: 50%;
  background: var(--bg-secondary);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--bg-tertiary);
    transform: rotate(90deg);
  }

  .material-icons {
    color: var(--text-primary);
    font-size: var(--text-lg);
  }
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-lg);

  .auth-icon {
    width: var(--icon-size);
    height: var(--icon-size);
    margin: 0 auto var(--space-md);
    background: var(--primary-bg);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--primary);

    &.pulse {
      animation: pulse 2s infinite var(--ease-out);
    }

    .material-icons {
      font-size: var(--text-2xl);
      color: var(--primary);
    }
  }

  h2 {
    color: var(--text-primary);
    font-size: var(--text-xl);
    margin: 0 0 var(--space-xs);
    font-weight: 600;
  }

  p {
    color: var(--text-secondary);
    font-size: var(--text-sm);
    margin: 0;
  }
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  transition: all var(--transition-normal);

  &:hover {
    border-color: var(--border-dark);
  }

  .material-icons {
    padding: 0 var(--space-md);
    color: var(--text-tertiary);
    font-size: var(--text-lg);
  }

  input {
    flex: 1;
    padding: var(--space-sm) var(--space-md) var(--space-sm) 0;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-size: var(--text-base);

    &::placeholder {
      color: var(--text-tertiary);
    }

    &:focus {
      outline: none;
    }

    &.input-active {
      & ~ .material-icons {
        color: var(--primary);
      }
    }
  }

  &.input-active {
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
  }
}

.terms-agreement {
  margin: var(--space-xs) 0;

  .checkbox-container {
    display: flex;
    align-items: center;
    cursor: pointer;
    position: relative;
    padding-left: 28px;
    color: var(--text-secondary);
    font-size: var(--text-xs);
    user-select: none;

    input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;

      &:checked ~ .checkmark {
        background-color: var(--primary);
        border-color: var(--primary);

        &:after {
          display: block;
        }
      }
    }

    .checkmark {
      position: absolute;
      top: 0;
      left: 0;
      height: 18px;
      width: 18px;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);

      &:after {
        content: '';
        position: absolute;
        display: none;
        left: 6px;
        top: 2px;
        width: 5px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }

    a {
      color: var(--primary);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  width: 100%;
  padding: var(--space-sm);
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);

  &:hover {
    background: var(--primary-dark);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
  }

  .material-icons {
    font-size: var(--text-lg);
  }
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  color: var(--text-tertiary);
  font-size: var(--text-sm);

  .divider-line {
    flex: 1;
    height: 1px;
    background: var(--border);
  }
}

.btn-social {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  width: 100%;
  padding: var(--space-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--bg-tertiary);
  }

  &.google {
    .material-icons {
      color: #db4437;
    }
  }

  .material-icons {
    font-size: var(--text-lg);
  }
}

.auth-footer {
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--text-sm);

  a {
    color: var(--primary);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>
