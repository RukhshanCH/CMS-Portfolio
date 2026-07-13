export interface Project {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  technologies?: string[];
  imageUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  order?: number;
  createdAt?: string;
}

export interface Skill {
  name: string;
  level: number; // 1-5
}