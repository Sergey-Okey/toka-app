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
