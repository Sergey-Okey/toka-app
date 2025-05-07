import { ref, computed, Ref, onMounted } from 'vue'
import { defineStore } from 'pinia'

// Тип задачи
export interface Task {
  id: string
  title: string
  completed: boolean
  dueDate?: string
  completedDate?: string
  category?: string
  priority?: string
  tags?: string[]
}

// Определение хранилища задач
export const useTaskStore = defineStore('tasks', () => {
  const tasks: Ref<Task[]> = ref([]) // Инициализация с пустым массивом

  // Загрузка задач из localStorage только на клиенте
  onMounted(() => {
    try {
      const stored = localStorage.getItem('tasks')
      if (stored) {
        tasks.value = JSON.parse(stored)
      }
    } catch (e) {
      console.warn('Ошибка чтения задач из localStorage:', e)
    }
  })

  // Сохранение задач в localStorage
  const saveTasks = (): void => {
    localStorage.setItem('tasks', JSON.stringify(tasks.value))
  }

  const saveTask = (task: Task): void => {
    const index = tasks.value.findIndex((t) => t.id === task.id)
    if (index !== -1) {
      tasks.value[index] = task
    } else {
      tasks.value.unshift(task)
    }
    saveTasks()
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

  const isTaskOverdue = (task: Task): boolean => {
    if (task.completed || !task.dueDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(task.dueDate) < today
  }

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

  const avgTimeToComplete = computed(() => {
    const completedTasksList = tasks.value.filter(
      (task) => task.completed && task.dueDate && task.completedDate
    )
    if (completedTasksList.length === 0) return 0
    const totalTime = completedTasksList.reduce((acc, task) => {
      const dueDate = new Date(task.dueDate!)
      const completedDate = new Date(task.completedDate!)
      return acc + (completedDate.getTime() - dueDate.getTime())
    }, 0)
    return totalTime / completedTasksList.length / (1000 * 60) // в минутах
  })

  const maxTimeToComplete = computed(() => {
    const completedTasksList = tasks.value.filter(
      (task) => task.completed && task.dueDate && task.completedDate
    )
    if (completedTasksList.length === 0) return 0
    const times = completedTasksList.map((task) => {
      const dueDate = new Date(task.dueDate!)
      const completedDate = new Date(task.completedDate!)
      return (completedDate.getTime() - dueDate.getTime()) / (1000 * 60)
    })
    return Math.max(...times)
  })

  const taskCategories = computed(() => {
    const categories = new Set(
      tasks.value.map((task) => task.category).filter(Boolean)
    )
    return Array.from(categories)
  })

  const taskPriorities = computed(() => {
    const priorities = new Set(
      tasks.value.map((task) => task.priority).filter(Boolean)
    )
    return Array.from(priorities)
  })

  const taskTags = computed(() => {
    const allTags: string[] = tasks.value.flatMap((task) => task.tags ?? [])
    return Array.from(new Set(allTags))
  })

  return {
    tasks,
    totalTasks,
    activeTasks,
    completedTasks,
    overdueTasks,
    avgTimeToComplete,
    maxTimeToComplete,
    taskCategories,
    taskPriorities,
    taskTags,
    saveTask,
    deleteTask,
    toggleTaskCompletion,
    getTasksForDate,
    hasTasksForDate,
    isTaskOverdue,
  }
})
