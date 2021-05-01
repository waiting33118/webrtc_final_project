import { createStore } from 'vuex'

export default createStore({
  state: {
    username: '',
    mediaStream: {}
  },
  mutations: {
    setMediaStream (state, mediaStream) {
      state.mediaStream = mediaStream
    },
    setUsername (state, username) {
      state.username = username
    }
  },
  actions: {
    setMediaStream ({ commit }, mediaStream) {
      commit('setMediaStream', mediaStream)
    },
    setUsername ({ commit }, username) {
      commit('setUsername', username)
    }
  },
  getters: {
    getUsername (state) {
      return state.username
    },
    getMediaStream (state) {
      return state.mediaStream
    }
  }
})
