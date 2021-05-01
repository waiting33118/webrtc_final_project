<template>
  <div
    ref="roomEl"
    class="room h-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-auto gap-1"
  />
</template>

<script>
import { computed, onBeforeUnmount, onMounted, ref } from '@vue/runtime-core'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ws } from '../libs/webSocket'
import WebRTC from '../libs/webRTC'
import { v4 as uuidv4 } from 'uuid'
export default {
  name: 'Room',
  setup () {
    const store = useStore()
    const router = useRouter()
    const roomEl = ref(null)
    const username = computed(() => store.getters.getUsername)
    const mediaStream = computed(() => store.getters.getMediaStream)
    let webRTC
    let id
    let addVideoCount = 0

    if (username.value === '') {
      router.push({ path: '/' })
      return
    }

    ws.onmessage = async ({ data }) => {
      data = JSON.parse(data)
      console.log(data)

      if (data.event === 'newUserJoin') {
        const offer = await webRTC.createOffer()
        await webRTC.setLocalDescription(offer)
        ws.send(JSON.stringify({ event: 'offer', id, payload: offer }))
      }

      if (data.event === 'offer') {
        await webRTC.setRemoteDescription(data.payload)
        const answer = await webRTC.createAnswer()
        await webRTC.setLocalDescription(answer)
        ws.send(JSON.stringify({ event: 'answer', id: data.id, payload: answer }))
      }

      if (data.event === 'answer' && data.id === id) {
        await webRTC.setRemoteDescription(data.payload)
        console.log(webRTC.peerConnection)
      }

      if (data.event === 'candidate') {
        webRTC.addIceCandidate(data.payload)
      }
    }

    onMounted(async () => {
      createVideoElement(0, mediaStream.value)
      webRTC = new WebRTC()
      id = uuidv4()
      console.log(id)
      webRTC.createPeerConnection()
      webRTC.onIceCandidate(ws)
      webRTC.peerConnection.ontrack = ({ streams }) => {
        const roomEl = document.querySelector('.room')
        const videoEl = document.createElement('video')
        videoEl.classList.add('h-full', 'w-full', 'object-cover')
        videoEl.setAttribute('autoplay', '')
        videoEl.srcObject = streams[0]
        if (addVideoCount === 0) {
          roomEl.appendChild(videoEl)
        }
        addVideoCount++
      }
      webRTC.addTrackToPeerConnection(mediaStream.value)
      ws.send(JSON.stringify({ event: 'newUserJoin', id }))
    })

    onBeforeUnmount(() => {
      stopLocalStream()
    })

    function createVideoElement (volume, stream) {
      const videoEl = document.createElement('video')
      videoEl.classList.add('h-full', 'w-full', 'object-cover')
      videoEl.setAttribute('autoplay', '')
      videoEl.volume = volume
      videoEl.srcObject = stream
      roomEl.value.appendChild(videoEl)
    }

    function stopLocalStream () {
      mediaStream.value.getTracks().forEach(track => track.stop())
    }

    return {
      roomEl
    }
  }
}
</script>
