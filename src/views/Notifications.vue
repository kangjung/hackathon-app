<template>
  <section class="notifications">
    <div v-if="!authStore.isAdmin" class="support-box">
      <h2>운영자에게 문의하기</h2>
      <p class="sub">문의를 보내면 운영자 계정이 확인 후 답변하며, 답변은 알림 목록에도 표시됩니다.</p>
      <form class="support-form" @submit.prevent="submitSupportMessage">
        <textarea
          v-model.trim="supportDraft"
          rows="3"
          placeholder="문의 내용을 입력하세요. 예) 계정 문제, 제출 오류, 정책 질문 등"
        />
        <button type="submit">문의 보내기</button>
      </form>
      <ul v-if="mySupportMessages.length" class="support-history">
        <li v-for="item in mySupportMessages" :key="item.id">
          <p class="q"><strong>내 문의</strong> · {{ item.question }}</p>
          <p class="meta">{{ formatDate(item.createdAt) }}</p>
          <p v-if="item.reply" class="a"><strong>운영자 답변</strong> · {{ item.reply }}</p>
          <p v-else class="pending">답변 대기 중</p>
        </li>
      </ul>
    </div>

    <div v-else class="support-box">
      <h2>사용자 문의함</h2>
      <p class="sub">운영자 전용 화면입니다. 답변을 등록하면 사용자 알림에 즉시 반영됩니다.</p>
      <ul v-if="pendingSupportMessages.length" class="support-history">
        <li v-for="item in pendingSupportMessages" :key="item.id">
          <p class="q"><strong>{{ item.userNickname }}</strong> (@{{ item.userId }})</p>
          <p class="q">{{ item.question }}</p>
          <p class="meta">{{ formatDate(item.createdAt) }}</p>
          <div class="reply-row">
            <textarea
              v-model.trim="adminReplyDrafts[item.id]"
              rows="2"
              placeholder="답변 내용을 입력하세요"
            />
            <button type="button" @click="submitAdminReply(item.id)">답변 보내기</button>
          </div>
        </li>
      </ul>
      <p v-else class="sub">대기 중인 문의가 없습니다.</p>
    </div>

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
import { formatDateTimeKorean } from '../utils/dateTime'
import { useHackathonStore } from '../stores/hackathon'
import StatusState from '../components/StatusState.vue'

const authStore = useAuthStore()
const hackathonStore = useHackathonStore()
const filter = ref('all')
const supportDraft = ref('')
const adminReplyDrafts = ref({})

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

const mySupportMessages = computed(() => {
  if (!userId.value || authStore.isAdmin) return []
  return hackathonStore.getSupportMessagesByUser(userId.value)
})

const pendingSupportMessages = computed(() =>
  authStore.isAdmin ? hackathonStore.getPendingSupportMessages() : []
)

const submitSupportMessage = () => {
  if (!userId.value) return
  try {
    hackathonStore.sendSupportMessage({
      userId: userId.value,
      userNickname: authStore.currentUser?.nickname,
      question: supportDraft.value
    })
    supportDraft.value = ''
    alert('문의가 접수되었습니다. 운영자 답변이 등록되면 알림에서 확인할 수 있습니다.')
  } catch (error) {
    alert(error instanceof Error ? error.message : '문의 접수 중 오류가 발생했습니다.')
  }
}

const submitAdminReply = (messageId) => {
  if (!authStore.isAdmin || !userId.value) return

  try {
    hackathonStore.replySupportMessage({
      messageId,
      adminId: userId.value,
      reply: adminReplyDrafts.value[messageId]
    })
    delete adminReplyDrafts.value[messageId]
    alert('답변을 등록했습니다.')
  } catch (error) {
    alert(error instanceof Error ? error.message : '답변 등록 중 오류가 발생했습니다.')
  }
}

const formatDate = (value) => formatDateTimeKorean(value)
</script>

<style scoped>
.notifications { max-width: 980px; margin: 1.6rem auto; padding: 0 1rem; }
.support-box { margin-bottom: 1.1rem; border: 1px solid #dbe4f6; border-radius: 12px; background: #fff; padding: 0.9rem; }
.support-box h2 { margin: 0 0 0.25rem; color: #1e293b; font-size: 1.1rem; }
.support-form { display: grid; gap: 0.55rem; margin-top: 0.65rem; }
.support-form textarea, .reply-row textarea { border: 1px solid #d0d8e6; border-radius: 10px; padding: 0.6rem; resize: vertical; }
.support-history { list-style: none; padding: 0; margin: 0.75rem 0 0; display: grid; gap: 0.65rem; }
.support-history li { border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.7rem; background: #f8fafc; }
.q, .a, .pending { margin: 0.2rem 0; color: #334155; }
.pending { color: #64748b; font-weight: 600; }
.reply-row { margin-top: 0.45rem; display: grid; gap: 0.5rem; }
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
