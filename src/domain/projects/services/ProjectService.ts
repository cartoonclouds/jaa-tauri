import type { DatabaseDriver } from '~/services/database/DatabaseDriver'
import type {
  CreateProjectInput,
  Project,
  UpdateProjectInput,
} from '../types'
import { ProjectRepository } from '../repositories/ProjectRepository'

export class ProjectService {
  private readonly projects: ProjectRepository

  constructor(db: DatabaseDriver) {
    this.projects = new ProjectRepository(db)
  }

  listProjects(): Promise<Project[]> {
    return this.projects.all()
  }

  getProject(id: string): Promise<Project | null> {
    return this.projects.find(id)
  }

  createProject(input: CreateProjectInput): Promise<Project> {
    const name = input.name.trim()

    if (!name) {
      throw new Error('Project name is required')
    }

    return this.projects.create({
      ...input,
      name,
    })
  }

  updateProject(input: UpdateProjectInput): Promise<Project> {
    if (input.name !== undefined && !input.name.trim()) {
      throw new Error('Project name cannot be empty')
    }

    return this.projects.update({
      ...input,
      name: input.name?.trim(),
    })
  }

  deleteProject(id: string): Promise<void> {
    return this.projects.delete(id)
  }
}
