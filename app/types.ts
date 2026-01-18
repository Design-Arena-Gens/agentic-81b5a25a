export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface FileItem {
  name: string
  language: string
  content: string
}
