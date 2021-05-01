export default class WebRTC {
  constructor () {
    this.peerConnection = null
  }

  checkSupport () {
    return navigator.mediaDevices.getSupportedConstraints()
  }

  checkPermission () {
    return navigator.permissions.query({ name: 'camera' })
  }

  getPermission () {
    return navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  }

  createPeerConnection () {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{
        urls: 'stun:stun.l.google.com:19302'
      }]
    })
  }

  onIceCandidate (ws) {
    this.peerConnection.onicecandidate = ({ candidate }) => {
      if (candidate) {
        console.log('candidate')
        ws.send(JSON.stringify({ event: 'candidate', payload: candidate }))
      }
    }
  }

  addIceCandidate (candidate) {
    this.peerConnection.addIceCandidate(candidate)
  }

  addTrackToPeerConnection (stream) {
    stream.getTracks().forEach(
      track => this.peerConnection.addTrack(track, stream)
    )
  }

  async createOffer () {
    return await this.peerConnection.createOffer()
  }

  async createAnswer () {
    return await this.peerConnection.createAnswer()
  }

  async setLocalDescription (sdp) {
    await this.peerConnection.setLocalDescription(sdp)
  }

  async setRemoteDescription (sdp) {
    await this.peerConnection.setRemoteDescription(sdp)
  }
}
