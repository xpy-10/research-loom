import 'server-only';
import { z } from "zod";

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

    const { broadcast } = createHelpers(client, server);

    client.on('open', () => console.log('websocket server started'));

    // Relay any message back to other clients
    client.on('message', broadcast);

    // When this client disconnects broadcast a disconnect message
    client.on('close', () => {
        console.log('a client disconnected')
        broadcast({ author: 'Server', content: 'A client has disconnected.' });
    });
}

function createHelpers( client: import('ws').WebSocket, server: import('ws').WebSocketServer,) {

    const broadcast = (payload: unknown) => {
        if (payload instanceof Buffer) {
            try {
                const jsonMessage = JSON.parse(payload.toString('utf-8'));
                if (jsonMessage['type'] && jsonMessage['type'] == 'quill_update') {
                    for (const other of server.clients) if (other !== client) other.send(payload);
                }
                if (jsonMessage['type'] && jsonMessage['type'] == 'awareness') {
                    const userMap = createUserMap(jsonMessage['payload']);
                    const allAwareness = { type: 'awareness', awarenessMap : JSON.stringify(Object.fromEntries(userMap))}
                    const jsonMap = JSON.stringify(allAwareness);
                    const buffer = Buffer.from(jsonMap);
                    for (const other of server.clients) if (other !== client) other.send(buffer);
                    client.send(buffer);
                }
            }
            catch (error) {
                console.log(error);
            }
        }
    }
    return { broadcast };
}

const awarenessMap = new Map();

const createUserMap = (userAwareness: {}) => {
    const awarenessSchema = z.object({
        userName: z.string().or(z.literal('anon')),
        userId: z.string().or(z.literal('anon')),
        userImageUrl: z.string().url().or(z.literal('anon')),
        cursor: z.literal('undefined').or(z.object({
            index: z.number(),
            length: z.number()
        }))
    })
    const awarenessObject = awarenessSchema.parse(userAwareness)
    awarenessMap.set(awarenessObject.userId, awarenessObject);
    return awarenessMap;
}


  