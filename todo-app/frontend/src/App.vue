<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from './stores/taskStore'

const store = useTaskStore()

// 起動時: 10秒のローディング後に認証チェック
const isLoading = ref(true)

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 10000))
  await store.checkAuth()
  isLoading.value = false
})

const username = ref('')
const password = ref('')
const isRegisterMode = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  if (isRegisterMode.value) {
    const ok = await store.register(username.value, password.value)
    if (ok) {
      isRegisterMode.value = false
      errorMessage.value = '登録完了。ログインしてください。'
    } else {
      errorMessage.value = '登録に失敗しました。'
    }
  } else {
    const ok = await store.login(username.value, password.value)
    if (!ok) {
      errorMessage.value = 'ユーザー名またはパスワードが違います。'
    }
  }
}

const newTitle = ref('')
const newDetail = ref('')
const newDueDate = ref('')

async function handleAdd() {
  if (!newTitle.value.trim()) return
  await store.addTask(newTitle.value, newDetail.value, newDueDate.value)
  newTitle.value = ''
  newDetail.value = ''
  newDueDate.value = ''
}

// フィルタータブ
type Filter = 'all' | 'active' | 'done'
const filter = ref<Filter>('all')

const filteredTasks = computed(() => {
  const base = filter.value === 'active' ? store.tasks.filter(t => !t.done)
             : filter.value === 'done'   ? store.tasks.filter(t => t.done)
             : store.tasks
  return [...base].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0
  })
})

// 編集モーダル
const editingTask = ref<{ id: number; title: string; detail: string; dueDate: string; category: string } | null>(null)

function openEdit(task: { id: number; title: string; detail?: string; dueDate?: string; category?: string }) {
  editingTask.value = {
    id: task.id,
    title: task.title,
    detail: task.detail ?? '',
    dueDate: task.dueDate ?? '',
    category: task.category ?? ''
  }
}

async function submitEdit() {
  if (!editingTask.value || !editingTask.value.title.trim()) return
  await store.updateTask(
    editingTask.value.id,
    editingTask.value.title,
    editingTask.value.detail,
    editingTask.value.dueDate,
    editingTask.value.category
  )
  editingTask.value = null
}

// 期日のフォーマット・状態判定
function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}/${m}/${day}`
}

function dueDateStatus(dateStr?: string, done?: boolean): 'overdue' | 'today' | 'soon' | 'normal' | null {
  if (!dateStr || done) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due   = new Date(dateStr + 'T00:00:00')
  const diff  = Math.floor((due.getTime() - today.getTime()) / 86400000)
  if (diff < 0)  return 'overdue'
  if (diff === 0) return 'today'
  if (diff <= 3)  return 'soon'
  return 'normal'
}

function dueDateLabel(dateStr?: string, done?: boolean): string {
  if (!dateStr || done) return ''
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due   = new Date(dateStr + 'T00:00:00')
  const diff  = Math.floor((due.getTime() - today.getTime()) / 86400000)
  if (diff < 0)  return `${Math.abs(diff)}日超過`
  if (diff === 0) return '今日まで'
  return `あと${diff}日`
}
</script>

<template>
  <!-- 起動ローディング -->
  <div v-if="isLoading" class="loading-screen">
    <div class="loading-logo">
      <span class="logo-mark">✦</span>
      <span class="logo-text">FOCUS</span>
    </div>
    <div class="loading-spinner"></div>
  </div>

  <!-- 未ログイン時 -->
  <div v-else-if="!store.isLoggedIn" class="auth-screen">
    <div class="auth-bg">
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>
      <div class="bg-grid"></div>
    </div>
    <div class="auth-card">
      <div class="auth-logo">
        <span class="logo-mark">✦</span>
        <span class="logo-text">FOCUS</span>
      </div>
      <h1 class="auth-heading">{{ isRegisterMode ? 'CREATE\nACCOUNT' : 'WELCOME\nBACK' }}</h1>
      <div v-if="errorMessage" class="message" :class="{ success: errorMessage.includes('完了') }">
        <span class="message-icon">{{ errorMessage.includes('完了') ? '✓' : '!' }}</span>
        {{ errorMessage }}
      </div>
      <div class="auth-form">
        <div class="field">
          <label>ユーザー名</label>
          <input v-model="username" placeholder="username" autocomplete="username" />
          <span class="field-line"></span>
        </div>
        <div class="field">
          <label>パスワード</label>
          <input v-model="password" type="password" placeholder="••••••••" @keydown.enter="handleSubmit" />
          <span class="field-line"></span>
        </div>
        <button class="auth-btn" @click="handleSubmit">
          <span>{{ isRegisterMode ? '登録する' : 'ログイン' }}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <p class="auth-toggle" @click="isRegisterMode = !isRegisterMode">
        {{ isRegisterMode ? '← ログインはこちら' : '新規登録はこちら →' }}
      </p>
    </div>
  </div>

  <!-- ログイン後 -->
  <div v-else class="app-screen">
    <header class="app-header">
      <div class="header-inner">
        <div class="header-logo">
          <span class="logo-mark">✦</span>
          <span class="logo-text">FOCUS</span>
        </div>
        <div class="header-right">
          <div class="header-stat">
            <span class="stat-num">{{ store.activeCount }}</span>
            <span class="stat-label">残タスク</span>
          </div>
          <button class="logout-btn" @click="store.logout()" title="ログアウト">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M9 10l3-3-3-3M12 7H5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- タスク追加フォーム -->
      <div class="add-form">
        <div class="add-inputs">
          <input
            v-model="newTitle"
            class="input-main"
            placeholder="新しいタスクを追加..."
            @keydown.enter="handleAdd"
          />
          <div class="add-sub-row">
            <input
              v-model="newDetail"
              class="input-sub"
              placeholder="詳細メモ（任意）"
            />
            <div class="date-field">
              <label class="date-label">期日</label>
              <input
                v-model="newDueDate"
                type="date"
                class="input-date"
              />
            </div>
          </div>
        </div>
        <button class="add-btn" @click="handleAdd" :disabled="!newTitle.trim()">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 3V15M3 9H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- フィルタータブ -->
      <div class="filter-tabs">
        <button
          v-for="tab in ([{ k: 'all', l: 'すべて' }, { k: 'active', l: '未完了' }, { k: 'done', l: '完了' }] as const)"
          :key="tab.k"
          class="filter-tab"
          :class="{ active: filter === tab.k }"
          @click="filter = tab.k"
        >{{ tab.l }}</button>
      </div>
    </header>

    <main class="task-list">
      <div v-if="filteredTasks.length === 0" class="empty-state">
        <div class="empty-ring">
          <div class="empty-ring-inner"></div>
        </div>
        <p class="empty-title">タスクがありません</p>
        <p class="empty-sub">{{ filter === 'all' ? '上のフォームからタスクを追加してください' : 'このフィルターに該当するタスクはありません' }}</p>
      </div>

      <div
        v-else
        v-for="(task, index) in filteredTasks"
        :key="task.id"
        class="task-item"
        :class="{ 'task-done': task.done }"
        :style="{ '--i': index }"
      >
        <span class="task-num">{{ String(index + 1).padStart(2, '0') }}</span>
        <button class="task-check" @click="store.toggleDone(task.id)" :aria-label="task.done ? '未完了に戻す' : '完了にする'">
          <span class="check-box">
            <svg v-if="task.done" width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </button>
        <div class="task-body">
          <span class="task-title">{{ task.title }}</span>
          <span v-if="task.detail" class="task-detail">{{ task.detail }}</span>
        </div>
        <div class="task-right">
          <span class="task-created">{{ task.createdAt ? formatDate(task.createdAt) : '——' }}</span>
          <span class="task-arrow">≫≫≫</span>
          <span
            v-if="task.dueDate"
            class="task-due"
            :class="`due-${dueDateStatus(task.dueDate, task.done)}`"
          >{{ formatDate(task.dueDate) }}</span>
          <span v-else class="task-due-empty">——</span>
          <button class="edit-btn" type="button" @click="openEdit(task)" aria-label="編集">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8.5 1.5a1.414 1.414 0 012 2L3.5 10.5l-3 .5.5-3 7.5-6.5z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="delete-btn" type="button" @click="store.deleteTask(task.id)" aria-label="削除">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <span class="task-accent-bar"></span>
      </div>
    </main>

    <!-- 編集モーダル -->
    <div v-if="editingTask" class="modal-overlay" @click.self="editingTask = null">
      <div class="modal-card">
        <p class="modal-title">タスクを編集</p>
        <div class="modal-fields">
          <div class="field">
            <label>タイトル</label>
            <input v-model="editingTask.title" placeholder="タイトル" @keydown.enter="submitEdit" />
            <span class="field-line"></span>
          </div>
          <div class="field">
            <label>詳細メモ</label>
            <input v-model="editingTask.detail" placeholder="詳細メモ（任意）" />
            <span class="field-line"></span>
          </div>
          <div class="field">
            <label>期日</label>
            <input v-model="editingTask.dueDate" type="date" class="input-date" />
            <span class="field-line"></span>
          </div>
          <div class="field">
            <label>カテゴリー</label>
            <select v-model="editingTask.category" class="input-select">
              <option value="">未設定</option>
              <option v-for="cat in ['書類作成','開発（PJ）','テスト（PJ）','開発（社内）','テスト（社内）','調査/分析/学習','その他']" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <span class="field-line"></span>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="modal-cancel" @click="editingTask = null">キャンセル</button>
          <button type="button" class="modal-save" @click="submitEdit" :disabled="!editingTask.title.trim()">保存</button>
        </div>
      </div>
    </div>

    <footer class="app-footer">
      <span>{{ store.tasks.length }} タスク合計</span>
      <span>{{ store.tasks.filter(t => t.done).length }} 完了</span>
    </footer>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg:        #080A14;
  --surface:   #0F1120;
  --surface2:  #1A1E30;
  --border:    #2A2E48;
  --border2:   #3D4470;
  --text:      #EDE9DE;
  --muted:     #9098BE;
  --accent:    #E8A030;
  --accent-lo: rgba(232, 160, 48, 0.12);
  --blue:      #6B96F0;
  --red:       #F06050;
  --green:     #50D88A;
  --yellow:    #EED050;
}

html, body {
  height: 100%;
  background: var(--bg);
  color: var(--text);
  font-family: 'Space Mono', monospace;
  -webkit-font-smoothing: antialiased;
}

#app {
  min-height: 100vh;
}
</style>

<style scoped>
/* ==============================
   LOADING SCREEN
============================== */
.loading-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  background: var(--bg);
}

.loading-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid var(--border2);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ==============================
   AUTH SCREEN
============================== */
.auth-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.auth-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
}

.bg-orb-1 {
  width: 560px;
  height: 560px;
  background: radial-gradient(circle, rgba(232,160,48,0.18), transparent 65%);
  top: -160px;
  right: -180px;
  animation: drift 9s ease-in-out infinite;
}

.bg-orb-2 {
  width: 460px;
  height: 460px;
  background: radial-gradient(circle, rgba(78,120,232,0.12), transparent 65%);
  bottom: -120px;
  left: -120px;
  animation: drift 12s ease-in-out infinite reverse;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 48px 48px;
  opacity: 0.35;
  mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%);
}

@keyframes drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(18px, -28px) scale(1.04); }
  66%       { transform: translate(-12px, 16px) scale(0.97); }
}

.auth-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 430px;
  padding: 52px 44px 44px;
  background: var(--surface);
  border: 1px solid var(--border2);
  box-shadow: 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04);
  animation: cardReveal 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes cardReveal {
  from { opacity: 0; transform: translateY(28px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 40px;
}

.logo-mark {
  color: var(--accent);
  font-size: 16px;
}

.logo-text {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.35em;
  color: var(--muted);
}

.auth-heading {
  font-family: 'Cormorant Garamond', serif;
  font-size: 68px;
  font-weight: 700;
  line-height: 1.0;
  letter-spacing: -0.01em;
  color: var(--text);
  white-space: pre-line;
  margin-bottom: 40px;
}

.message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  margin-bottom: 24px;
  font-size: 11px;
  letter-spacing: 0.06em;
  border-left: 2px solid var(--red);
  color: var(--red);
  background: rgba(232, 85, 64, 0.07);
}

.message.success {
  border-color: var(--green);
  color: var(--green);
  background: rgba(64, 200, 122, 0.07);
}

.message-icon {
  font-weight: 700;
  font-size: 12px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.field {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field label {
  font-size: 10px;
  letter-spacing: 0.18em;
  color: var(--muted);
  text-transform: uppercase;
}

.field input {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border2);
  padding: 10px 0;
  font-family: 'Space Mono', monospace;
  font-size: 14px;
  color: var(--text);
  outline: none;
}

.field input::placeholder {
  color: var(--muted);
  opacity: 0.6;
}

.field-line {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 1px;
  width: 0;
  background: var(--accent);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.field:focus-within .field-line {
  width: 100%;
}

.auth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px 24px;
  background: var(--accent);
  color: var(--bg);
  border: none;
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  margin-top: 4px;
}

.auth-btn:hover  { opacity: 0.86; }
.auth-btn:active { transform: scale(0.98); }

.auth-toggle {
  margin-top: 22px;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.2s;
  user-select: none;
}

.auth-toggle:hover { color: var(--text); }

/* ==============================
   APP SCREEN
============================== */
.app-screen {
  min-height: 100vh;
  max-width: 700px;
  margin: 0 auto;
  padding: 0 28px;
  display: flex;
  flex-direction: column;
}

.app-header {
  padding: 52px 0 24px;
  border-bottom: 1px solid var(--border);
  animation: slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.header-inner {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 32px;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-right {
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.header-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}

.stat-num {
  font-family: 'Cormorant Garamond', serif;
  font-size: 56px;
  font-weight: 700;
  line-height: 1;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--muted);
  text-transform: uppercase;
}

.logout-btn {
  background: none;
  border: 1px solid var(--border2);
  color: var(--muted);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 4px;
  transition: border-color 0.2s, color 0.2s;
}

.logout-btn:hover {
  border-color: var(--red);
  color: var(--red);
}

/* タスク追加フォーム */
.add-form {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.add-inputs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.add-sub-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.input-main,
.input-sub {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border2);
  padding: 9px 0;
  font-family: 'Space Mono', monospace;
  color: var(--text);
  outline: none;
  width: 100%;
  transition: border-color 0.25s;
}

.input-main { font-size: 14px; }
.input-sub  { font-size: 12px; flex: 1; }

.input-main:focus,
.input-sub:focus { border-color: var(--accent); }

.input-main::placeholder,
.input-sub::placeholder { color: var(--muted); opacity: 0.55; }

.date-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.date-label {
  font-size: 9px;
  letter-spacing: 0.18em;
  color: var(--muted);
  text-transform: uppercase;
}

.input-date {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border2);
  padding: 9px 0;
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  color: var(--text);
  outline: none;
  color-scheme: dark;
  transition: border-color 0.25s;
  width: 120px;
}

.input-date:focus { border-color: var(--accent); }

.input-select {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border2);
  padding: 9px 0;
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  color: var(--text);
  outline: none;
  width: 100%;
  cursor: pointer;
  transition: border-color 0.25s;
}

.input-select:focus { border-color: var(--accent); }

.input-select option {
  background: var(--surface);
  color: var(--text);
}

.add-btn {
  width: 46px;
  height: 46px;
  background: var(--surface2);
  border: 1px solid var(--border2);
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s;
  margin-top: 4px;
}

.add-btn:hover:not(:disabled) {
  background: var(--accent-lo);
  border-color: var(--accent);
  color: var(--accent);
}

.add-btn:active:not(:disabled) { transform: scale(0.95); }

.add-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* フィルタータブ */
.filter-tabs {
  display: flex;
  gap: 0;
  margin-top: 20px;
  border-bottom: 1px solid var(--border);
}

.filter-tab {
  background: none;
  border: none;
  padding: 8px 16px;
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.2s, border-color 0.2s;
}

.filter-tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.filter-tab:hover:not(.active) { color: var(--text); }

/* ==============================
   TASK LIST
============================== */
.task-list {
  flex: 1;
  padding: 8px 0 40px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 96px 0;
  color: var(--muted);
  animation: fadeIn 0.6s ease both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.empty-ring {
  width: 56px;
  height: 56px;
  border: 1px solid var(--border2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  animation: spin 12s linear infinite;
}

.empty-ring-inner {
  width: 28px;
  height: 28px;
  border: 1px solid var(--accent);
  border-radius: 50%;
  opacity: 0.5;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.empty-title {
  font-size: 13px;
  letter-spacing: 0.06em;
}

.empty-sub {
  font-size: 11px;
  opacity: 0.5;
}

.task-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 4px 0 8px 0;
  border-bottom: 1px solid var(--border);
  animation: taskSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--i, 0) * 0.06s);
  transition: background 0.2s;
  overflow: hidden;
}

@keyframes taskSlideIn {
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
}

.task-item:hover {
  background: var(--surface);
  margin: 0 -28px;
  padding-left: 28px;
  padding-right: 28px;
}

.task-accent-bar {
  position: absolute;
  left: -28px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--accent);
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.task-item:hover .task-accent-bar {
  transform: scaleY(1);
}

.task-done {
  opacity: 0.38;
}

.task-num {
  font-size: 11px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  margin-top: 3px;
  min-width: 22px;
  transition: color 0.2s;
}

.task-item:hover .task-num {
  color: var(--accent);
}

.task-check {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  margin-top: 1px;
}

.check-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 1px solid var(--border2);
  transition: border-color 0.2s, background 0.2s;
}

.task-done .check-box {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
}

.task-check:hover .check-box {
  border-color: var(--accent);
}

.task-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.task-title {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text);
  transition: color 0.2s;
}

.task-done .task-title {
  text-decoration: line-through;
  color: var(--muted);
}

.task-detail {
  font-family: 'Space Mono', monospace;
  font-style: italic;
  font-size: 11px;
  color: var(--muted);
  opacity: 0.8;
  line-height: 1.4;
}

/* 期日バッジ */
.task-due {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  letter-spacing: 0.06em;
  width: fit-content;
}

.due-normal  { color: var(--muted); }
.due-soon    { color: var(--yellow); }
.due-today   { color: var(--accent); font-weight: 700; }
.due-overdue { color: var(--red); font-weight: 700; }

.task-created,
.task-due-empty {
  font-size: 10px;
  color: var(--muted);
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.task-arrow {
  font-size: 10px;
  color: var(--muted);
  letter-spacing: -0.1em;
  opacity: 0.5;
}

/* 追加日・期日・編集・削除の右列 */
.task-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 編集・削除ボタン共通 */
.edit-btn,
.delete-btn {
  background: none;
  border: none;
  color: transparent;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
}

.task-item:hover .edit-btn,
.task-item:hover .delete-btn {
  color: var(--muted);
}

.edit-btn:hover  { color: var(--blue) !important; }
.delete-btn:hover { color: var(--red) !important; }

/* 編集モーダル */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.15s ease both;
}

.modal-card {
  width: 100%;
  max-width: 420px;
  background: var(--surface);
  border: 1px solid var(--border2);
  padding: 36px 36px 28px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.5);
  animation: cardReveal 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.modal-title {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 28px;
}

.modal-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 28px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-cancel {
  background: none;
  border: 1px solid var(--border2);
  color: var(--muted);
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.1em;
  padding: 10px 18px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.modal-cancel:hover { border-color: var(--text); color: var(--text); }

.modal-save {
  background: var(--accent);
  border: none;
  color: var(--bg);
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 10px 18px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.modal-save:hover:not(:disabled) { opacity: 0.85; }
.modal-save:disabled { opacity: 0.35; cursor: not-allowed; }

/* ==============================
   FOOTER
============================== */
.app-footer {
  display: flex;
  justify-content: space-between;
  padding: 16px 0 32px;
  border-top: 1px solid var(--border);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--muted);
  text-transform: uppercase;
}
</style>
