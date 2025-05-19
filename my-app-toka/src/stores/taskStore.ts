import { ref, computed, Ref, onMounted, watch } from 'vue'
import { defineStore } from 'pinia'

export interface Tag {
  name: string
  color?: string
}

export interface Task {
  id: string
  title: string
  completed: boolean
  dueDate?: string
  completedDate?: string
  createdAt?: string
  category?: string
  priority?: 'none' | 'low' | 'medium' | 'high'
  tags?: Tag[]
  description?: string
  timeSpent?: number
  lastModified?: string
}

export const useTaskStore = defineStore('tasks', () => {
  const tasks: Ref<Task[]> = ref([])
  const tagColors: Ref<Record<string, string>> = ref({})

  // Инициализация и загрузка данных
  onMounted(() => {
    loadTasks()
    loadTagColors()
  })

  // Загрузка задач из localStorage
  const loadTasks = (): void => {
    try {
      const stored = localStorage.getItem('tasks')
      if (stored) {
        tasks.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Ошибка загрузки задач:', e)
    }
  }

  // Загрузка цветов тегов из localStorage
  const loadTagColors = (): void => {
    try {
      const stored = localStorage.getItem('tagColors')
      if (stored) {
        tagColors.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Ошибка загрузки цветов тегов:', e)
    }
  }

  // Сохранение задач в localStorage
  const saveTasks = (): void => {
    localStorage.setItem('tasks', JSON.stringify(tasks.value))
  }

  // Сохранение цветов тегов в localStorage
  const saveTagColors = (): void => {
    localStorage.setItem('tagColors', JSON.stringify(tagColors.value))
  }

  // Автоматическое сохранение при изменении
  watch(tasks, saveTasks, { deep: true })
  watch(tagColors, saveTagColors, { deep: true })

  // Основные методы работы с задачами
  const addTask = (task: Omit<Task, 'id'>): Task => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: task.createdAt || new Date().toISOString(),
      completed: task.completed || false,
      tags: task.tags || [],
      priority: task.priority || 'medium',
      lastModified: new Date().toISOString(),
    }

    tasks.value.unshift(newTask)
    updateTagColors(newTask.tags || [])
    return newTask
  }

  const updateTask = (updatedTask: Task): Task | null => {
    const index = tasks.value.findIndex((t) => t.id === updatedTask.id)
    if (index !== -1) {
      tasks.value[index] = {
        ...tasks.value[index],
        ...updatedTask,
        lastModified: new Date().toISOString(),
      }
      updateTagColors(updatedTask.tags || [])
      return tasks.value[index]
    }
    return null
  }

  const deleteTask = (taskId: string): void => {
    tasks.value = tasks.value.filter((task) => task.id !== taskId)
  }

  const toggleTaskCompletion = (taskId: string): void => {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task) {
      task.completed = !task.completed
      task.completedDate = task.completed ? new Date().toISOString() : undefined
      task.lastModified = new Date().toISOString()
    }
  }

  // Методы для работы с тегами
  const updateTagColors = (tags: Tag[]): void => {
    tags.forEach((tag) => {
      if (tag.name && !tagColors.value[tag.name] && tag.color) {
        tagColors.value[tag.name] = tag.color
      }
    })
  }

  const getTagColor = (tagName: string): string => {
    return tagColors.value[tagName] || '#31a974'
  }

  // Методы поиска и фильтрации
  const getTaskById = (id: string): Task | undefined => {
    return tasks.value.find((task) => task.id === id)
  }

  const getTasksForDate = (date: Date): Task[] => {
    const dateStr = date.toISOString().split('T')[0]
    return tasks.value.filter((task) => task.dueDate?.startsWith(dateStr))
  }

  const hasTasksForDate = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0]
    return tasks.value.some((task) => task.dueDate?.startsWith(dateStr))
  }

  const isTaskOverdue = (task: Task): boolean => {
    if (task.completed || !task.dueDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(task.dueDate) < today
  }

  // Computed свойства
  const totalTasks = computed(() => tasks.value.length)
  const activeTasks = computed(() => tasks.value.filter((t) => !t.completed).length)
  const completedTasks = computed(() => tasks.value.filter((t) => t.completed).length)
  const overdueTasks = computed(() => tasks.value.filter((t) => isTaskOverdue(t)).length)

  const taskCategories = computed(() => {
    const categories = new Set(tasks.value.map((t) => t.category).filter(Boolean))
    return Array.from(categories) as string[]
  })

  const taskPriorities = computed(() => {
    return ['none', 'low', 'medium', 'high']
  })

  const allTags = computed(() => {
    const allTags = tasks.value.flatMap((t) => t.tags || [])
    return Array.from(new Set(allTags.map((t) => t.name)))
  })

  return {
    // Данные
    tasks,
    tagColors,

    // Методы
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getTaskById,
    getTasksForDate,
    hasTasksForDate,
    isTaskOverdue,
    getTagColor,

    // Computed свойства
    totalTasks,
    activeTasks,
    completedTasks,
    overdueTasks,
    taskCategories,
    taskPriorities,
    allTags,
  }
})
