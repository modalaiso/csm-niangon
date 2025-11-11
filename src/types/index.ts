import { Role, PostType, PostStatus } from '@prisma/client'

export type { Role, PostType, PostStatus }

export interface User {
  id: string
  email: string
  nom: string
  prenom: string
  username: string
  classe: string
  role: Role
  bio?: string | null
  avatar?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  id: string
  type: PostType
  title: string
  slug: string
  content?: string | null
  summary: string
  thumbnail?: string | null
  mediaUrl?: string | null
  authorId: string
  views: number
  status: PostStatus
  tags: string[]
  info?: string | null
  publishedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}
