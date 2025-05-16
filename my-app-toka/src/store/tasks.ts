import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Ref } from 'vue'

export interface TaskTag {
  id: string
  name: string
  color: string
}

export interface Task {
  id: string
  title: string
  description: string
  priority: number // 1-5
  tags: TaskTag[]
  createdAt: string
  completedAt: string | null
  timeSpent: number // в минутах
  estimatedTime: number // в минутах
}

export const useTaskStore = defineStore('tasks', () => {
  const tasks: Ref<Task[]> = ref([])
  const tags: Ref<TaskTag[]> = ref([])

  // Инициализация из localStorage
  const initFromLocalStorage = () => {
    const savedTasks = localStorage.getItem('tasks')
    const savedTags = localStorage.getItem('tags')

    if (savedTasks) tasks.value = JSON.parse(savedTasks)
    if (savedTags) tags.value = JSON.parse(savedTags)

    // Дефолтные теги если нет сохраненных
    if (tags.value.length === 0) {
      tags.value = [
        { id: '1', name: 'Работа', color: '#31a974' },
        { id: '2', name: 'Личное', color: '#2196f3' },
        { id: '3', name: 'Срочно', color: '#f44336' },
      ]
      saveTags()
    }
  }

  // Сохранение в localStorage
  const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks.value))
  }

  const saveTags = () => {
    localStorage.setItem('tags', JSON.stringify(tags.value))
  }

  // Добавление задачи
  const addTask = (
    task: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'timeSpent'>
  ) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completedAt: null,
      timeSpent: 0,
    }
    tasks.value.unshift(newTask)
    saveTasks()
    return newTask
  }

  // Отметка как выполненной
  const completeTask = (id: string, timeSpent: number) => {
    const task = tasks.value.find((t) => t.id === id)
    if (task) {
      task.completedAt = new Date().toISOString()
      task.timeSpent = timeSpent
      saveTasks()
    }
  }

  // Удаление задачи
  const deleteTask = (id: string) => {
    tasks.value = tasks.value.filter((t) => t.id !== id)
    saveTasks()
  }

  // Добавление тега
  const addTag = (tag: Omit<TaskTag, 'id'>) => {
    const newTag: TaskTag = {
      ...tag,
      id: Date.now().toString(),
    }
    tags.value.push(newTag)
    saveTags()
    return newTag
  }

  // Аналитика
  const getPriorityStats = computed(() => {
    const completedTasks = tasks.value.filter((t) => t.completedAt)
    const stats: Record<
      number,
      { count: number; totalTime: number; avgTime: number }
    > = {}

    for (let i = 1; i <= 5; i++) {
      const priorityTasks = completedTasks.filter((t) => t.priority === i)
      const totalTime = priorityTasks.reduce((sum, t) => sum + t.timeSpent, 0)

      stats[i] = {
        count: priorityTasks.length,
        totalTime,
        avgTime: priorityTasks.length
          ? Math.round(totalTime / priorityTasks.length)
          : 0,
      }
    }

    return stats
  })

  const getTagStats = computed(() => {
    const completedTasks = tasks.value.filter((t) => t.completedAt)
    const stats: Record<
      string,
      { name: string; color: string; count: number }
    > = {}

    tags.value.forEach((tag) => {
      const tagTasks = completedTasks.filter((t) =>
        t.tags.some((t) => t.id === tag.id)
      )
      stats[tag.id] = {
        name: tag.name,
        color: tag.color,
        count: tagTasks.length,
      }
    })

    return stats
  })

  // Инициализация при создании
  initFromLocalStorage()

  return {
    tasks,
    tags,
    addTask,
    completeTask,
    deleteTask,
    addTag,
    getPriorityStats,
    getTagStats,
  }
})
