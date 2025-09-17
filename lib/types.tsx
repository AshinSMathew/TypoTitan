export type User = {
  id: string
  uid: string
  name: string
  email: string
}

export type Player = {
  id: string
  name: string
  wpm: number
  accuracy: number
  progress: number
  isFinished: boolean
  errors: number
}

export type Command = {
  id: string
  text: string
  difficulty: "easy" | "medium" | "hard"
  category: string
}