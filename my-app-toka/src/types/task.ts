import { ref, computed, Ref } from 'vue'
import { defineStore } from 'pinia'

export interface Tag {
  name: string
  color: string
}

export interface Task {
  id: string
  title: string
  completed: boolean
  dueDate?: string
  completedDate?: string
  createdAt?: string
  priority?: 'none' | 'low' | 'medium' | 'high'
  tags?: Tag[]
  description?: string
  timeSpent?: number
  timerActive?: boolean
  lastModified?: string
}

export const useTaskStore = defineStore('tasks', () => {
  const tasks: Ref<Task[]> = ref([])
  const tagColors: Ref<Record<string, string>> = ref({})
  const activeTimers: Ref<Record<string, number>> = ref({})
  const timerStartTimestamps: Ref<Record<string, number>> = ref({})

  const init = () => {
    const stored = localStorage.getItem('tasks')
    if (stored) tasks.value = JSON.parse(stored)

    const storedColors = localStorage.getItem('tagColors')
    if (storedColors) tagColors.value = JSON.parse(storedColors)

    tasks.value.forEach((task) => {
      if (task.timerActive) {
        timerStartTimestamps.value[task.id] = performance.now()
        activeTimers.value[task.id] = window.setInterval(() => {
          const now = performance.now()
          const start = timerStartTimestamps.value[task.id]
          const elapsed = Math.floor((now - start) / 1000)
          task.timeSpent = (task.timeSpent || 0) + elapsed
          timerStartTimestamps.value[task.id] = now
          saveTasks()
        }, 1000)
      }
    })
  }

  const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks.value))
  }

  const saveTagColors = () => {
    localStorage.setItem('tagColors', JSON.stringify(tagColors.value))
  }

  const startTimer = (taskId: string) => {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task && !task.timerActive) {
      task.timerActive = true
      timerStartTimestamps.value[taskId] = performance.now()
      activeTimers.value[taskId] = window.setInterval(() => {
        const now = performance.now()
        const start = timerStartTimestamps.value[taskId]
        const elapsed = Math.floor((now - start) / 1000)
        task.timeSpent = (task.timeSpent || 0) + elapsed
        timerStartTimestamps.value[taskId] = now
        saveTasks()
      }, 1000)
      saveTasks()
    }
  }

  const stopTimer = (taskId: string) => {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task && task.timerActive) {
      const now = performance.now()
      const start = timerStartTimestamps.value[taskId]
      const elapsed = Math.floor((now - start) / 1000)
      task.timeSpent = (task.timeSpent || 0) + elapsed
      task.timerActive = false

      clearInterval(activeTimers.value[taskId])
      delete activeTimers.value[taskId]
      delete timerStartTimestamps.value[taskId]

      saveTasks()
    }
  }

  const addTask = (task: Omit<Task, 'id'>): Task => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: task.createdAt || new Date().toISOString(),
      completed: false,
      tags: task.tags || [],
      priority: task.priority || 'none',
      timeSpent: task.timeSpent || 0,
      timerActive: false,
      lastModified: new Date().toISOString(),
    }
    tasks.value.unshift(newTask)
    updateTagColors(newTask.tags || [])
    saveTasks()
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
      saveTasks()
      return tasks.value[index]
    }
    return null
  }

  const deleteTask = (taskId: string) => {
    stopTimer(taskId)
    tasks.value = tasks.value.filter((task) => task.id !== taskId)
    saveTasks()
  }

  const toggleTaskCompletion = (taskId: string) => {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task) {
      task.completed = !task.completed
      task.completedDate = task.completed ? new Date().toISOString() : undefined
      task.lastModified = new Date().toISOString()
      if (task.completed) stopTimer(taskId)
      saveTasks()
    }
  }

  const updateTagColors = (tags: Tag[]) => {
    let updated = false
    tags.forEach((tag) => {
      if (tag.name && !tagColors.value[tag.name]) {
        tagColors.value[tag.name] = tag.color
        updated = true
      }
    })
    if (updated) saveTagColors()
  }

  const getTagColor = (tagName: string): string => {
    return tagColors.value[tagName] || '#31a974'
  }

  const isTaskOverdue = (task: Task): boolean => {
    if (task.completed || !task.dueDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(task.dueDate) < today
  }

  const totalTasks = computed(() => tasks.value.length)
  const activeTasks = computed(() => tasks.value.filter((t) => !t.completed).length)
  const completedTasks = computed(() => tasks.value.filter((t) => t.completed).length)
  const overdueTasks = computed(() => tasks.value.filter((t) => isTaskOverdue(t)).length)
  const totalTimeSpent = computed(() =>
    tasks.value.reduce((sum, task) => sum + (task.timeSpent || 0), 0)
  )

  return {
    tasks,
    tagColors,

    totalTasks,
    activeTasks,
    completedTasks,
    overdueTasks,
    totalTimeSpent,

    init,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    startTimer,
    stopTimer,
    getTagColor,
    isTaskOverdue,
  }
})
