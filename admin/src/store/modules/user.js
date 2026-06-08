import { defineStore } from 'pinia'
import { adminLogin } from '@/api/auth'
import router from '@/router'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('admin_token') || '',
    userInfo: JSON.parse(localStorage.getItem('admin_user') || 'null')
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => state.userInfo?.username || ''
  },

  actions: {
    async login(loginForm) {
      const res = await adminLogin(loginForm)
      this.token = res.accessToken
      this.userInfo = {
        userId: res.userId,
        nickname: res.nickname,
        realName: res.realName,
        role: res.role,
      }
      localStorage.setItem('admin_token', res.accessToken)
      localStorage.setItem('admin_user', JSON.stringify(this.userInfo))
      return res
    },

    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      router.push('/login')
    }
  }
})
