const { WebSocket } = require("ws")
const url = "ws://97.112.77.108:24050/ws"
const ws = new WebSocket(url)

ws.on("open", function open() {
	console.log("connected")
	ws.send(Date.now())
})
  
ws.on("close", function close() {
	console.log("disconnected")
})
  
ws.on("message", function message(data) {
	console.log(data)
})

