const WS_DOMAIN = process.env.NODE_ENV === 'development' ? 'ws://localhost:3030' : 'wss://webrtcfinalprojectbackend-6zwa3npg7q-de.a.run.app'

let ws

function socketInit () {
  ws = new WebSocket(WS_DOMAIN)

  ws.onopen = () => {
    console.log('websocket:open connection')
  }

  ws.onclose = () => {
    console.log('websocket:close connection')
    console.log('reconnect in 1 seconds...')
    setTimeout(() => {
      socketInit()
    }, 1000)
  }

  ws.onerror = (e) => {
    console.log('Error', e)
  }
}

export {
  socketInit,
  ws
}
