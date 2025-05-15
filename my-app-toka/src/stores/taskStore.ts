import { ref, computed, Ref, watch } from 'vue'
import { defineStore } from 'pinia'

export interface Task {
  id: string
  title: string
  completed: boolean
  dueDate?: string
  completedDate?: string
  createdAt: string
  category?: string
  priority?: 'none' | 'low' | 'medium' | 'high'
  tags?: string[]
}

export interface DailyStats {
  date: string
  productivity: number
  completed: number
  total: number
}

export const useTaskStore = defineStore('tasks', () => {
  const tasks: Ref<Task[]> = ref([])
  const history: Ref<DailyStats[]> = ref([])
  const isLoading = ref(false)
  const initialized = ref(false)
  const logs: Ref<string[]> = ref([])

  const generateId = (): string =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 9)

  const safeParse = <T>(json: string | null): T | null => {
    if (!json) return null
    try {
      return JSON.parse(json) as T
    } catch {
      return null
    }
  }

  const loadFromLocalStorage = (): void => {
    if (initialized.value) return
    isLoading.value = true
    try {
      const storedTasks = safeParse<Task[]>(localStorage.getItem('tasks'))
      const storedHistory = safeParse<DailyStats[]>(
        localStorage.getItem('taskHistory')
      )
      const storedLogs = safeParse<string[]>(localStorage.getItem('taskLogs'))

      if (storedTasks) tasks.value = storedTasks
      if (storedHistory) history.value = storedHistory
      if (storedLogs) logs.value = storedLogs
    } catch (e) {
      console.error('Ошибка загрузки:', e)
    } finally {
      isLoading.value = false
      initialized.value = true
    }
  }

  let saveTimeout: ReturnType<typeof setTimeout> | null = null
  const saveToLocalStorage = (): void => {
    if (isLoading.value) return
    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem('tasks', JSON.stringify(tasks.value))
        localStorage.setItem('taskHistory', JSON.stringify(history.value))
        localStorage.setItem('taskLogs', JSON.stringify(logs.value))
      } catch (e) {
        console.error('Ошибка сохранения:', e)
      }
    }, 300)
  }

  const updateDailyStats = (): void => {
    const today = new Date().toISOString().slice(0, 10)
    const existingIndex = history.value.findIndex((h) => h.date === today)

    const total = tasks.value.length
    const completed = tasks.value.filter((t) => t.completed).length
    const productivity = total > 0 ? Math.round((completed / total) * 100) : 0

    const newStats: DailyStats = { date: today, productivity, completed, total }

    if (existingIndex >= 0) {
      history.value[existingIndex] = newStats
    } else {
      history.value.push(newStats)
      if (history.value.length > 30) history.value.shift()
    }
  }

  const addLog = (message: string): void => {
    const timestamp = new Date().toISOString()
    logs.value.push(`${timestamp}: ${message}`)
    if (logs.value.length > 100) logs.value.shift()
  }

  const initStore = (): void => {
    loadFromLocalStorage()
    updateDailyStats()
  }

  const addTask = (
    task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedDate'>
  ): string => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date().toISOString(),
      completed: false,
      completedDate: undefined,
    }
    tasks.value.unshift(newTask)
    addLog(`Добавлена задача: ${newTask.title}`)
    updateDailyStats()
    saveToLocalStorage()
    return newTask.id
  }

  const updateTask = (id: string, updates: Partial<Task>): void => {
    const index = tasks.value.findIndex((t) => t.id === id)
    if (index === -1) {
      addLog(`Ошибка: задача с id ${id} не найдена для обновления`)
      return
    }
    const oldTask = tasks.value[index]
    const newCompleted = updates.completed ?? oldTask.completed

    const completedDate =
      !oldTask.completed && newCompleted
        ? new Date().toISOString()
        : oldTask.completed && !newCompleted
        ? undefined
        : oldTask.completedDate

    tasks.value[index] = {
      ...oldTask,
      ...updates,
      completedDate,
    }
    addLog(`Обновлена задача: ${tasks.value[index].title}`)
    updateDailyStats()
    saveToLocalStorage()
  }

  const deleteTask = (id: string): void => {
    const task = tasks.value.find((t) => t.id === id)
    if (!task) {
      addLog(`Ошибка: задача с id ${id} не найдена для удаления`)
      return
    }
    tasks.value = tasks.value.filter((t) => t.id !== id)
    addLog(`Удалена задача: ${task.title}`)
    updateDailyStats()
    saveToLocalStorage()
  }

  const toggleTaskCompletion = (id: string): void => {
    const task = tasks.value.find((t) => t.id === id)
    if (!task) {
      addLog(`Ошибка: задача с id ${id} не найдена для переключения статуса`)
      return
    }
    const completed = !task.completed
    task.completed = completed
    task.completedDate = completed ? new Date().toISOString() : undefined
    addLog(
      `Задача ${task.title} ${completed ? 'завершена' : 'возвращена в работу'}`
    )
    updateDailyStats()
    saveToLocalStorage()
  }

  const getTasksForDate = (date?: Date): Task[] => {
    if (!date) return tasks.value
    const dateStr = date.toISOString().slice(0, 10)
    return tasks.value.filter((task) => task.dueDate?.startsWith(dateStr))
  }

  const hasTasksForDate = (date: Date): boolean =>
    getTasksForDate(date).length > 0

  const isTaskOverdue = (task: Task): boolean => {
    if (task.completed || !task.dueDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(task.dueDate) < today
  }

  const totalTasks = computed(() => tasks.value.length)
  const activeTasks = computed(
    () => tasks.value.filter((t) => !t.completed && !isTaskOverdue(t)).length
  )
  const completedTasks = computed(
    () => tasks.value.filter((t) => t.completed).length
  )
  const overdueTasks = computed(
    () => tasks.value.filter((t) => isTaskOverdue(t) && !t.completed).length
  )

  const categories = computed(() => {
    const allCategories = tasks.value
      .map((t) => t.category)
      .filter(Boolean) as string[]
    return Array.from(new Set(allCategories))
  })

  const priorities = computed(() => ['none', 'low', 'medium', 'high'] as const)

  const tags = computed(() => {
    const allTags = tasks.value.flatMap((t) => t.tags || [])
    return Array.from(new Set(allTags))
  })

  const weeklyProductivity = computed(() => {
    const last7Days = history.value.slice(-7)
    if (last7Days.length === 0) return 0
    const sum = last7Days.reduce((acc, day) => acc + day.productivity, 0)
    return Math.round(sum / last7Days.length)
  })

  const predictProductivity = computed(() => {
    const recent = history.value.slice(-7).map((d) => d.productivity)
    if (recent.length < 2) return weeklyProductivity.value
    const trend = recent[recent.length - 1] - recent[0]
    return weeklyProductivity.value + Math.round(trend / 7)
  })

  const urgentTasks = computed(() => {
    const now = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(now.getDate() + 1)
    return tasks.value.filter((t) => {
      if (!t.dueDate || t.completed) return false
      const due = new Date(t.dueDate)
      return due <= tomorrow && t.priority === 'high'
    })
  })

  const productivityMap = computed(() =>
    history.value.reduce<Record<string, number>>((map, h) => {
      map[h.date] = h.productivity
      return map
    }, {})
  )

  watch(
    tasks,
    () => {
      updateDailyStats()
      saveToLocalStorage()
    },
    { deep: true, flush: 'post' }
  )

  const getStats = () => ({
    total: totalTasks.value,
    active: activeTasks.value,
    completed: completedTasks.value,
    overdue: overdueTasks.value,
    weeklyProductivity: weeklyProductivity.value,
    predictedProductivity: predictProductivity.value,
    urgentCount: urgentTasks.value.length,
  })

  return {
    tasks,
    history,
    isLoading,
    logs,

    initStore,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getTasksForDate,
    hasTasksForDate,
    isTaskOverdue,

    totalTasks,
    activeTasks,
    completedTasks,
    overdueTasks,
    categories,
    priorities,
    tags,
    weeklyProductivity,
    predictProductivity,
    urgentTasks,
    productivityMap,

    getStats,
  }
})
