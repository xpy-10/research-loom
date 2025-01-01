import 'server-only'

export function GET() {
    const headers = new Headers();
    headers.set('Connection', 'Upgrade');
    headers.set('Upgrade', 'websocket');
    return new Response('Upgrade Required', { status: 426, headers });
  }

export function SOCKET(
client: import('ws').WebSocket,
_request: import('node:http').IncomingMessage,
server: import('ws').WebSocketServer,
) {
const { connectionRoutines, broadcast } = createHelpers(client, server);


// When a new client connects broadcast a connect message
// broadcast({ author: 'Server', content: 'A new client has connected.' });
// send({ author: 'Server', content: 'Welcome!' });
client.on('open', () => console.log('websocket server started'));
client.on('connection', connectionRoutines);

// Relay any message back to other clients
client.on('message', broadcast);

// When this client disconnects broadcast a disconnect message
client.on('close', () => {
    broadcast({ author: 'Server', content: 'A client has disconnected.' });
});
}

function createHelpers(
client: import('ws').WebSocket,
server: import('ws').WebSocketServer,
) {

const broadcast = (payload: unknown) => {
    if (payload instanceof Buffer) {
        try {
            const jsonMessage = JSON.parse(payload.toString('utf-8'));
            if (jsonMessage['type'] && jsonMessage['type'] == 'quill_update') {
                for (const other of server.clients) if (other !== client) other.send(payload);
            }
        }
        catch (error) {
            console.log(error);
        }
    }
}

const connectionRoutines = () => {
    const welcomeMessage = {
        type: 'welcome',
        client: client
    }
    const jsonMessage = JSON.stringify(welcomeMessage);
    client.send(jsonMessage);
    // for (const other of server.clients) if (other !== client) other.send(jsonMessage);
}
return { connectionRoutines, broadcast };
}


  