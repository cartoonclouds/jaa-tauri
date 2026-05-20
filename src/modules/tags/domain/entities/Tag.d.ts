export interface Tag {
  id: string;
  name: string;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTagInput {
  name: string;
  color?: string | null;
}
