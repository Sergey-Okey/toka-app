import { ref, computed, Ref, onMounted } from 'vue'
import { defineStore } from 'pinia'

export interface Task {
  id: string
  title: string
  completed: boolean
  dueDate?: string
  completedDate?: string
  createdAt?: string
  category?: string
  priority?: string
  tags?: string[]
}

export const useTaskStore = defineStore('tasks', () => {
  const tasks: Ref<Task[]> = ref([])

  // Инициализация и загрузка из localStorage
  onMounted(() => {
    loadTasks()
  })

  const loadTasks = (): void => {
    try {
      const stored = localStorage.getItem('tasks')
      if (stored) {
        tasks.value = JSON.parse(stored)
      }
    } catch (e) {
      console.warn('Ошибка чтения задач:', e)
    }
  }

  const saveTasks = (): void => {
    localStorage.setItem('tasks', JSON.stringify(tasks.value))
  }

  // Основные методы работы с задачами
  const addTask = (task: Task): void => {
    tasks.value.unshift({
      ...task,
      id: task.id || Date.now().toString(),
      createdAt: task.createdAt || new Date().toISOString(),
      completed: task.completed || false,
      tags: task.tags || [],
      priority: task.priority || 'medium',
    })
    saveTasks()
  }

  const updateTask = (updatedTask: Task): void => {
    const index = tasks.value.findIndex((t) => t.id === updatedTask.id)
    if (index !== -1) {
      tasks.value[index] = {
        ...tasks.value[index],
        ...updatedTask,
      }
      saveTasks()
    }
  }

  const saveTask = (task: Task): void => {
    task.id ? updateTask(task) : addTask(task)
  }

  const deleteTask = (taskId: string): void => {
    tasks.value = tasks.value.filter((task) => task.id !== taskId)
    saveTasks()
  }

  const toggleTaskCompletion = (taskId: string): void => {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task) {
      task.completed = !task.completed
      task.completedDate = task.completed ? new Date().toISOString() : undefined
      saveTasks()
    }
  }

  // Методы для поиска и фильтрации
  const getTaskById = (id: string): Task | undefined => {
    return tasks.value.find((task) => task.id === id)
  }

  const getTasksForDate = (date?: Date): Task[] => {
    if (!date) return tasks.value
    return tasks.value.filter((task) => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const hasTasksForDate = (date: Date): boolean => {
    return tasks.value.some((task) => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Вспомогательные методы
  const isTaskOverdue = (task: Task): boolean => {
    if (task.completed || !task.dueDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(task.dueDate) < today
  }

  // Computed свойства
  const totalTasks = computed(() => tasks.value.length)
  const activeTasks = computed(
    () => tasks.value.filter((t) => !t.completed).length
  )
  const completedTasks = computed(
    () => tasks.value.filter((t) => t.completed).length
  )
  const overdueTasks = computed(
    () => tasks.value.filter((t) => isTaskOverdue(t)).length
  )

  const taskCategories = computed(() => {
    const categories = new Set(
      tasks.value.map((t) => t.category).filter(Boolean)
    )
    return Array.from(categories)
  })

  const taskPriorities = computed(() => {
    const priorities = new Set(
      tasks.value.map((t) => t.priority).filter(Boolean)
    )
    return Array.from(priorities)
  })

  const taskTags = computed(() => {
    const allTags = tasks.value.flatMap((t) => t.tags || [])
    return Array.from(new Set(allTags))
  })

  return {
    // Данные
    tasks,

    // Методы
    addTask,
    updateTask,
    saveTask,
    deleteTask,
    toggleTaskCompletion,
    getTaskById,
    getTasksForDate,
    hasTasksForDate,
    isTaskOverdue,
    loadTasks,

    // Computed свойства
    totalTasks,
    activeTasks,
    completedTasks,
    overdueTasks,
    taskCategories,
    taskPriorities,
    taskTags,
  }
})
