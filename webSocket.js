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
						console.log("you must register!")
						ws.send("you must register")
					}else{
						console.log('you became admin!')
						ADMINS.push(ws)
        					console.log("admin added")
                				ws.send("you become admin now! your uuid ==> " + ws.uuid)

						CLIENTS.forEach(async (client) => {
                        				//console.log(client.uuid)
                        				if(client.uuid == ws.uuid){
                                				let index = CLIENTS.indexOf(client)
                                				if(index > -1){
                                        				CLIENTS.splice(index,1)
                               	 				}
                        				}
                				})

						//ws.send("connected clients: " + CLIENTS.length)	
                				ws.type = "admin"
					}
				}else{
					ws.send("admin already exists")
					console.log("admin already exists")
				}
		
			}else if(formattedMessage.uuid && !formattedMessage.type){
				ws.uuid = formattedMessage.uuid
				CLIENTS.push(ws)
        			console.log("client added")
				console.log("you registered! uuid: " + formattedMessage.uuid)
				ws.send("you registered! uuid: " + formattedMessage.uuid)	
			}else if(!formattedMessage.uuid && !formattedMessage.type) {

				if(ws.type == "admin"){
                			console.log('received: %s', message)
                			sendAll(message)
        			}else{
					console.log("you are not an admin!")
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
			
			console.log(client.uuid)
			if(client.uuid	&& client.uuid == ws.uuid){
				let index = CLIENTS.indexOf(client)
				if(index > -1){
					CLIENTS.splice(index,1)
					ws.send("client removed! uuid " + client.uuid)
					console.log("client removed! uuid: " + client.uuid)	
				}
			}
		})

		ADMINS.forEach(async (client) => {

                        console.log(client.uuid)
                        if(client.uuid  && client.uuid == ws.uuid){
                                let index = ADMINS.indexOf(client)
                                if(index > -1){
                                        ADMINS.splice(index,1)
                                        ws.send("admin removed! uuid " + client.uuid)
                                        console.log("admin removed! uuid: " + client.uuid)
                                }
                        }
                })
		
		ws.send("connected clients: " + CLIENTS.length)
		console.log("connected clients: " + CLIENTS.length)
		ws.close()
	}
	
});
    
function sendAll(message) {
	console.log("clients: ", CLIENTS.length)
	console.log("admins: ",ADMINS.length)
	for (var i=0; i<CLIENTS.length; i++) {
		CLIENTS[i].send(message.toString());
	}
	for (var j=0; j<ADMINS.length; j++){
		ADMINS[j].send(message.toString());	
	}
}
