<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="auth-modal" :class="{ 'modal-entering': animateIn }">
      <button class="close-btn" @click="closeModal">
        <i class="material-icons">close</i>
      </button>

      <div class="auth-header">
        <div class="auth-icon pulse">
          <i class="material-icons">account_circle</i>
        </div>
        <h2>Добро пожаловать</h2>
        <p>Войдите в свой аккаунт</p>
      </div>

      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="input-group">
          <i class="material-icons">email</i>
          <input
            type="email"
            v-model="email"
            placeholder="Ваш email"
            required
            @focus="activeField = 'email'"
            @blur="activeField = null"
            :class="{ 'input-active': activeField === 'email' }"
          />
        </div>

        <div class="input-group">
          <i class="material-icons">lock</i>
          <input
            type="password"
            v-model="password"
            placeholder="Пароль"
            required
            @focus="activeField = 'password'"
            @blur="activeField = null"
            :class="{ 'input-active': activeField === 'password' }"
          />
        </div>

        <div class="auth-actions">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe" />
            <span class="checkmark"></span>
            <span>Запомнить меня</span>
          </label>
          <a href="#" class="forgot-password">Забыли пароль?</a>
        </div>

        <button type="submit" class="btn-primary">
          <i class="material-icons">login</i>
          <span>Войти</span>
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
          Нет аккаунта?
          <routerLink to="/register" @click.prevent="switchToRegister"
            >Зарегистрироваться</routerLink
          >
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['close', 'switch-to-register'])

const animateIn = ref(false)
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const activeField = ref(null)

onMounted(() => {
  setTimeout(() => (animateIn.value = true), 10)
})

const handleLogin = () => {
  console.log('Login with:', email.value, password.value)
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

const switchToRegister = () => {
  animateIn.value = false
  setTimeout(() => emit('switch-to-register'), 300)
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

.auth-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: var(--space-xs) 0;

  .remember-me {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    color: var(--text-secondary);
    font-size: var(--text-sm);
    cursor: pointer;
    position: relative;
    padding-left: 24px;

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
      left: 0;
      height: 16px;
      width: 16px;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);

      &:after {
        content: '';
        position: absolute;
        display: none;
        left: 5px;
        top: 2px;
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
  }

  .forgot-password {
    color: var(--primary);
    font-size: var(--text-sm);
    text-decoration: none;
    transition: all var(--transition-fast);

    &:hover {
      text-decoration: underline;
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
    transition: all var(--transition-fast);

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

@media (max-width: 480px) {
  .auth-modal {
    padding: var(--space-lg);
    margin: 0 var(--space-md);
  }

  .auth-header {
    margin-bottom: var(--space-md);

    .auth-icon {
      width: 60px;
      height: 60px;

      .material-icons {
        font-size: var(--text-xl);
      }
    }
  }
}
</style>
