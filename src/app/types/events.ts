export interface Event {
    id: number
    title: string
    start: Date
    end: Date
    priority: 'Low' | 'Medium' | 'High'
    description?: string
    businessId?: string
    projectId?: string
    tags: string[]
  }
  
  export interface Project {
    id: string
    name: string
    tasks: { id: string; title: string; priority: 'Low' | 'Medium' | 'High'; dueDate: string }[]
    tags: string[]
  }
  
  export interface Business {
    id: string
    name: string
    description: string
    projects: Project[]
  }
  
  export interface UserPreferences {
    userId: string
    interests: string[]
  }