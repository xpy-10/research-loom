import {Model} from 'json-joy/lib/json-crdt';
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';

export function GET() {
    const headers = new Headers();
    headers.set('Connection', 'Upgrade');
    headers.set('Upgrade', 'websocket');
    return new Response('Upgrade Required', { status: 426, headers });
  }
  
// model will be created and persisted or retrieved from the backend to pass to the websocket
const model = ModelWithExt.create(ext.quill.new('abc'));



export function SOCKET(
client: import('ws').WebSocket,
_request: import('node:http').IncomingMessage,
server: import('ws').WebSocketServer,
) {
const { send, broadcast, sendCRDT } = createHelpers(client, server);


// When a new client connects broadcast a connect message
broadcast({ author: 'Server', content: 'A new client has connected.' });
send({ author: 'Server', content: 'Welcome!' });
sendCRDT(model.toBinary());
const model2 = ModelWithExt.load(model.api.flush().toBinary())


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
const sendCRDT = (payload: Uint8Array) =>{
    client.send(payload);
};
const send = (payload: unknown) => client.send(JSON.stringify(payload));
const broadcast = (payload: unknown) => {
    if (payload instanceof Buffer) payload = payload.toString();
    if (typeof payload !== 'string') payload = JSON.stringify(payload);
    for (const other of server.clients)
    if (other !== client) other.send(String(payload));
};
return { send, broadcast, sendCRDT };
}


  