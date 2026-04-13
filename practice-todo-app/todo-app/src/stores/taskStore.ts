import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const CATEGORIES = [
  '書類作成', '開発（PJ）', 'テスト（PJ）',
  '開発（社内）', 'テスト（社内）', '調査/分析/学習', 'その他'
] as const

export interface Task {
	id:         number
	title:      string
	done:       boolean
	detail?:    string
	dueDate?:   string  // "YYYY-MM-DD"
	createdAt?: string  // "YYYY-MM-DD"
	category?:  string
}

const API = ''  // 同一オリジン（本番）/ dev時は vite proxy で解決

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])
  const isLoggedIn = ref(false)

  async function fetchTasks() {
    const res = await fetch(`${API}/api/tasks`, { credentials: 'include' })
    if (res.ok) {
      tasks.value = await res.json()
    }
  }

  async function checkAuth(): Promise<boolean> {
    const res = await fetch(`${API}/api/auth/me`, { credentials: 'include' })
    if (res.ok) {
      isLoggedIn.value = true
      await fetchTasks()
      return true
    }
    return false
  }

  async function login(username: string, password: string): Promise<boolean> {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      credentials: 'include',
      redirect: 'manual'
    })
    if (res.ok || res.status === 0) {
      isLoggedIn.value = true
      await fetchTasks()
      return true
    }
    return false
  }

  async function register(username: string, password: string): Promise<boolean> {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    })
    return res.ok
  }

  async function logout(): Promise<void> {
    await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' })
    isLoggedIn.value = false
    tasks.value = []
  }

  async function addTask(title: string, detail?: string, dueDate?: string, category?: string) {
    const res = await fetch(`${API}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, detail: detail || null, dueDate: dueDate || null, category: category || null }),
      credentials: 'include'
    })
    if (res.ok) {
      await fetchTasks()
    }
  }

  async function toggleDone(id: number) {
    const res = await fetch(`${API}/api/tasks/${id}/toggle`, {
      method: 'PATCH',
      credentials: 'include'
    })
    if (res.ok) {
      const updated: Task = await res.json()
      const idx = tasks.value.findIndex(t => t.id === id)
      if (idx !== -1) tasks.value[idx] = updated
    }
  }

  async function updateTask(id: number, title: string, detail?: string, dueDate?: string, category?: string) {
    const res = await fetch(`${API}/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, detail: detail || null, dueDate: dueDate || null, category: category || null }),
      credentials: 'include'
    })
    if (res.ok) {
      const updated: Task = await res.json()
      const idx = tasks.value.findIndex(t => t.id === id)
      if (idx !== -1) tasks.value[idx] = updated
    }
  }

  async function deleteTask(id: number) {
    const res = await fetch(`${API}/api/tasks/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (res.ok || res.status === 204) {
      tasks.value = tasks.value.filter(t => t.id !== id)
    }
  }

  const activeCount = computed(() => tasks.value.filter(t => !t.done).length)

  return { tasks, isLoggedIn, checkAuth, fetchTasks, login, register, logout, addTask, toggleDone, updateTask, deleteTask, activeCount }
})
