<template>
  <section class="notifications">
    <div class="head">
      <div>
        <h1>알림</h1>
        <p class="sub">팀 신청, 신청 결과, 참가 해커톤 제출 알림을 한 곳에서 확인하세요.</p>
      </div>
      <button type="button" :disabled="!unreadCount" @click="markAllAsRead">모두 읽음 처리</button>
    </div>

    <div class="filters">
      <button type="button" :class="{ active: filter === 'all' }" @click="filter = 'all'">전체</button>
      <button type="button" :class="{ active: filter === 'unread' }" @click="filter = 'unread'">
        읽지 않음 ({{ unreadCount }})
      </button>
    </div>

    <ul v-if="visibleNotifications.length" class="notification-list">
      <li
        v-for="item in visibleNotifications"
        :key="item.id"
        class="notification-item"
        :class="{ unread: !item.isRead }"
      >
        <div class="content">
          <p class="title">{{ item.title }}</p>
          <p class="message">{{ item.message }}</p>
          <p class="meta">{{ formatDate(item.createdAt) }}</p>
        </div>
        <div class="actions">
          <router-link :to="item.link" @click="markRead(item.id)">바로가기</router-link>
          <button type="button" :disabled="item.isRead" @click="markRead(item.id)">읽음 처리</button>
        </div>
      </li>
    </ul>

    <StatusState v-else type="empty" message="표시할 알림이 없습니다." />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useHackathonStore } from '../stores/hackathon'
import StatusState from '../components/StatusState.vue'

const authStore = useAuthStore()
const hackathonStore = useHackathonStore()
const filter = ref('all')

onMounted(() => {
  hackathonStore.loadData()
})

const userId = computed(() => authStore.currentUser?.id || '')

const notifications = computed(() => {
  if (!userId.value) return []
  return hackathonStore.getNotificationsByUser(userId.value)
})

const unreadCount = computed(() => notifications.value.filter((item) => !item.isRead).length)

const visibleNotifications = computed(() =>
  filter.value === 'unread'
    ? notifications.value.filter((item) => !item.isRead)
    : notifications.value
)

const markRead = (notificationId) => {
  if (!userId.value) return
  hackathonStore.markNotificationRead({ userId: userId.value, notificationId })
}

const markAllAsRead = () => {
  if (!userId.value) return
  hackathonStore.markAllNotificationsRead(userId.value)
}

const formatDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('ko-KR', { hour12: false })
}
</script>

<style scoped>
.notifications { max-width: 980px; margin: 1.6rem auto; padding: 0 1rem; }
.head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
.sub { margin-top: 0.2rem; color: #475569; }
.filters { display: flex; gap: 0.6rem; margin: 1rem 0; }
.filters button.active { background: #1d4ed8; color: #fff; }
.notification-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.8rem; }
.notification-item { border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; padding: 0.85rem; display: flex; justify-content: space-between; gap: 1rem; }
.notification-item.unread { border-color: #93c5fd; background: #f8fbff; }
.title { margin: 0; font-weight: 700; color: #1e293b; }
.message { margin: 0.4rem 0; color: #334155; }
.meta { margin: 0; color: #64748b; font-size: 0.9rem; }
.actions { display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end; }
.actions a { color: #1d4ed8; text-decoration: none; }
button { border: none; border-radius: 10px; background: #e2e8f0; padding: 0.45rem 0.75rem; cursor: pointer; }
button:disabled { opacity: 0.45; cursor: not-allowed; }
@media (max-width: 768px) {
  .notification-item { flex-direction: column; }
  .actions { align-items: flex-start; }
}
</style>
