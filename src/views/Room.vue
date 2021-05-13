<template>
  <div
    ref="roomEl"
    class="room h-full grid grid-cols-1 sm:grid-cols-2 auto-rows-auto gap-1"
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
        const roomEl = document.querySelector('.room')
        const infoEl = document.createElement('table')
        infoEl.innerHTML = `
        <tr>
          <th class="px-2">timestamp</th>
          <th class="px-2">bytesSent</th>
          <th class="px-2">frameHeight</th>
          <th class="px-2">frameWidth</th>
          <th class="px-2">framesPerSecond</th>
          <th class="px-2">packetsSent</th>
        </tr>
        <tr>
          <td class="timestamp">-</td>
          <td class="bytesSent">-</td>
          <td class="frameHeight">-</td>
          <td class="frameWidth">-</td>
          <td class="framesPerSecond">-</td>
          <td class="packetsSent">-</td>
        </tr>`

        roomEl.append(infoEl)

        const timestamp = document.querySelector('.timestamp')
        const info1 = document.querySelector('.bytesSent')
        const info2 = document.querySelector('.frameHeight')
        const info3 = document.querySelector('.frameWidth')
        const info4 = document.querySelector('.framesPerSecond')
        const info5 = document.querySelector('.packetsSent')

        let count = 1

        setInterval(async () => {
          const peerStat = await webRTC.peerConnection.getStats(null)
          peerStat.forEach(stat => {
            if (stat.type === 'outbound-rtp' && stat.kind === 'video') {
              console.log(count)
              timestamp.innerText = count
              info1.innerText = stat.bytesSent
              info2.innerText = stat.frameHeight
              info3.innerText = stat.frameWidth
              info4.innerText = stat.framesPerSecond
              info5.innerText = stat.packetsSent
              count++
            }
          })
        }, 1000)
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
      webRTC.peerConnection.ontrack = async ({ streams }) => {
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
