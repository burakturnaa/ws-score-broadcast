var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({
		port: 8080
	}),
	CLIENTS = [];
ADMINS = [];
wss.on('connection', function (ws) {

	ws.send("you need to register to receive messages")

	ws.on('message', function (message) {
		try {

			let formattedMessage = JSON.parse(message.toString())

			if (formattedMessage.type == "admin" && !formattedMessage.uuid) {
				if (ADMINS.length < 1) {
					if (!ws.uuid) {
						ws.send("you must register")
					} else {
						ADMINS.push(ws)
						ws.send("you become admin now! your uuid ==> " + ws.uuid)
						CLIENTS.forEach(async (client) => {
							if (client.uuid == ws.uuid) {
								let index = CLIENTS.indexOf(client)
								if (index > -1) {
									CLIENTS.splice(index, 1)
								}
							}
						})

						ws.type = "admin"
						ws.send("connected clients: " + CLIENTS.length)
						ws.send("connected admins: " + ADMINS.length)
						let print_clients = []
						let print_admins = []
						for (var i = 0; i < CLIENTS.length; i++) {
							print_clients.push(CLIENTS[i].uuid)
						}
						for (var j = 0; j < ADMINS.length; j++) {
							print_admins.push(ADMINS[j].uuid)
						}
					}
				} else {
					ws.send("admin already exists")
				}

			} else if (formattedMessage.uuid && !formattedMessage.type) {

				for (var i = 0; i < CLIENTS.length; i++) {
					if (CLIENTS[i].uuid && CLIENTS[i].uuid == formattedMessage.uuid) {
						ws.send("uuid already registered")
						return
					}
				}
				for (var j = 0; j < ADMINS.length; j++) {
					if (ADMINS[j].uuid && ADMINS[j].uuid == formattedMessage.uuid) {
						ws.send("uuid already registered")
						return
					}
				}


				ws.uuid = formattedMessage.uuid
				CLIENTS.push(ws)
				ws.send("you registered! uuid: " + formattedMessage.uuid)
				ws.send("connected clients: " + CLIENTS.length)
				ws.send("connected admins: " + ADMINS.length)
				let print_clients = []
				let print_admins = []
				for (var i = 0; i < CLIENTS.length; i++) {
					print_clients.push(CLIENTS[i].uuid)
				}
				for (var j = 0; j < ADMINS.length; j++) {
					print_admins.push(ADMINS[j].uuid)
				}
			} else if (!formattedMessage.uuid && !formattedMessage.type) {
				if (ws.type == "admin") {
					console.log('received: %s', message)
					sendAll(message)
				} else {
					console.log("you are not an admin!")
					ws.send("You are not an admin :)")
				}
			}
		} catch (error) {
			ws.send("incorrect format")
		}
	});

	ws.send("NEW USER JOINED");
	ws.onclose = () => {
		CLIENTS.forEach(async (client) => {
			if (client.uuid && client.uuid == ws.uuid) {
				let index = CLIENTS.indexOf(client)
				if (index > -1) {
					CLIENTS.splice(index, 1)
					ws.send("client removed! uuid " + client.uuid)
					ws.send("connected clients: " + CLIENTS.length)
					ws.send("connected admins: " + ADMINS.length)
					let print_clients = []
					let print_admins = []
					for (var i = 0; i < CLIENTS.length; i++) {
						print_clients.push(CLIENTS[i].uuid)
					}
					for (var j = 0; j < ADMINS.length; j++) {
						print_admins.push(ADMINS[j].uuid)
					}
				}
			}
		})

		ADMINS.forEach(async (client) => {
			if (client.uuid && client.uuid == ws.uuid) {
				let index = ADMINS.indexOf(client)
				if (index > -1) {
					ADMINS.splice(index, 1)
					ws.send("admin removed! uuid " + client.uuid)
					ws.send("connected clients: " + CLIENTS.length)
					ws.send("connected admins: " + ADMINS.length)
					let print_clients = []
					let print_admins = []
					for (var i = 0; i < CLIENTS.length; i++) {
						print_clients.push(CLIENTS[i].uuid)
					}
					for (var j = 0; j < ADMINS.length; j++) {
						print_admins.push(ADMINS[j].uuid)
					}
				}
			}
		})

		ws.send("connected clients: " + CLIENTS.length)
		ws.send("connected admins: " + ADMINS.length)
		ws.close()
	}

});

function sendAll(message) {
	for (var i = 0; i < CLIENTS.length; i++) {
		CLIENTS[i].send(message.toString());
	}
	for (var j = 0; j < ADMINS.length; j++) {
		ADMINS[j].send(message.toString());
	}
}