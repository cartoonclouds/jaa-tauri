export interface Project {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface ProjectRow {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface CreateProjectInput {
  name: string
  description?: string | null
}

export interface UpdateProjectInput {
  id: string
  name?: string
  description?: string | null
}
