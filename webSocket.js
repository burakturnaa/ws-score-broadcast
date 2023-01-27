var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 8080}),
    CLIENTS=[];
    ADMINS=[];
wss.on('connection', function(ws) {

	ws.send("you need to register to receive messages")

	ws.on('message', function(message) {
		try {

			let formattedMessage = JSON.parse(message.toString())

			if(formattedMessage.type == "admin" && !formattedMessage.uuid){
				if(ADMINS.length < 1) {
					if(!ws.uuid){
						ws.send("you must register")
					}else{
						ADMINS.push(ws)
                				ws.send("you become admin now! your uuid ==> " + ws.uuid)

						CLIENTS.forEach(async (client) => {
                        				if(client.uuid == ws.uuid){
                                				let index = CLIENTS.indexOf(client)
                                				if(index > -1){
                                        				CLIENTS.splice(index,1)
                               	 				}
                        				}
                				})

                				ws.type = "admin"
					}
				}else{
					ws.send("admin already exists")
				}

			}else if(formattedMessage.uuid && !formattedMessage.type){
				ws.uuid = formattedMessage.uuid
				CLIENTS.push(ws)
				ws.send("you registered! uuid: " + formattedMessage.uuid)
			}else if(!formattedMessage.uuid && !formattedMessage.type) {

				if(ws.type == "admin"){
                			sendAll(message)
        			}else{
                			ws.send("You are not an admin :)")
        			}

			}


		} catch (error) {
                	console.log(error)
                	ws.send("incorrect format")
        	}

       	});

	ws.send("NEW USER JOINED");
	ws.onclose = () =>
	{
		CLIENTS.forEach(async (client) => {
			if(client.uuid	&& client.uuid == ws.uuid){
				let index = CLIENTS.indexOf(client)
				if(index > -1){
					CLIENTS.splice(index,1)
					ws.send("client removed! uuid " + client.uuid)
				}
			}
		})

		ADMINS.forEach(async (client) => {
                        if(client.uuid  && client.uuid == ws.uuid){
                                let index = ADMINS.indexOf(client)
                                if(index > -1){
                                        ADMINS.splice(index,1)
                                        ws.send("admin removed! uuid " + client.uuid)
                                }
                        }
                })

		ws.send("connected clients: " + CLIENTS.length)
		ws.close()
	}

});

function sendAll(message) {
	for (var i=0; i<CLIENTS.length; i++) {
		CLIENTS[i].send(message.toString());
	}
	for (var j=0; j<ADMINS.length; j++){
		ADMINS[j].send(message.toString());
	}
}
