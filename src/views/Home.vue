<template>
  <div class="p-2 w-11/12 max-w-md h-1/2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-300 rounded-lg shadow-xl">
    <div class="h-full flex flex-col justify-evenly items-center">
      <h1 class=" text-center my-2 animate-pulse text-xl md:text-3xl font-black text-purple-900">
        Welcome,What's your name?
      </h1>
      <input
        v-model.trim="username"
        type="text"
        class="text-center my-2 px-1 focus:outline-none focus:ring focus:ring-purple-400 w-44 h-8 rounded-md"
      >
      <button
        class="my-2 focus:outline-none px-6 py-3 shadow rounded-full ring-4 ring-indigo-300 bg-indigo-400 text-white transition duration-500 hover:shadow-lg"
        @click="enterCheck"
      >
        Enter Room
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from '@vue/reactivity'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { socketInit } from '../libs/webSocket'
import WebRTC from '../libs/webRTC'
import { onMounted } from '@vue/runtime-core'
export default {
  name: 'Home',
  setup () {
    const username = ref('')
    const store = useStore()
    const router = useRouter()
    const webRTC = new WebRTC()

    onMounted(() => socketInit())

    async function enterCheck () {
      if (username.value === '') return alert('請輸入你的名稱！')

      try {
        const { state } = await webRTC.checkPermission()
        if (state === 'prompt') alert('請給予鏡頭和麥克風權限')
        const mediaStream = await webRTC.getPermission()
        store.dispatch('setUsername', username.value)
        store.dispatch('setMediaStream', mediaStream)
        router.push({ path: '/room' })
      } catch (error) {
        console.log(error)
        alert('使用者拒絕給予權限，無法進入聊天室')
      }
    }

    return {
      username,
      enterCheck
    }
  }
}
</script>
