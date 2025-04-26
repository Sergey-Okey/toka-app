import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Task {
  id: number
  title: string
  dueDate: Date | null
  priority: 'none' | 'low' | 'medium' | 'high'
  tags: string[]
  completed: boolean
}

export const useTaskStore = defineStore('taskStore', () => {
  const tasks = ref<Task[]>([])
  const STORAGE_KEY = 'tasks'

  const loadTasks = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) tasks.value = JSON.parse(saved)
  }

  const saveTasks = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.value))
  }

  // Добавьте остальные методы (addTask, deleteTask и т.д.)

  return { tasks, loadTasks, saveTasks }
})
