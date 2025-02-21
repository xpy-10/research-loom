import { auth, getAuth } from '@clerk/nextjs/server';
import 'server-only';
import { z } from "zod";

const PING_INTERVAL = 30000;
const PONG_TIMEOUT = 30000;

export function GET() {
    const headers = new Headers();
    headers.set('Connection', 'Upgrade');
    headers.set('Upgrade', 'websocket');
    return new Response('Upgrade Required', { status: 426, headers });
  }

export async function SOCKET(
    client: import('ws').WebSocket,
    _request: import('node:http').IncomingMessage,
    server: import('ws').WebSocketServer,
) {
    console.log('a client connected');
    let clientSet: Set<string> = new Set();
    let pongMap: Map<any, any> = new Map();

    const { handleMessage } = await createHelpers(client, server, clientSet, pongMap);

    client.on('open', () => console.log('websocket server started'));

    // Relay any message back to other clients
    client.on('message', handleMessage);

    // When this client disconnects broadcast a disconnect message
    client.on('close', () => {
        console.log('a client disconnected')
        handleMessage({ author: 'Server', content: 'A client has disconnected.' });
    });
}

async function createHelpers( client: import('ws').WebSocket, server: import('ws').WebSocketServer, clientSet: Set<string>, pongMap: Map<any,any>) {
    const handleMessage = (payload: unknown) => {
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
                if (clientSet && jsonMessage['type'] && jsonMessage['type'] == 'connection') {
                    console.log(jsonMessage);
                    const clientId = jsonMessage['clientId'];
                    const documentId = jsonMessage['documentId'];
                    const combination = addCombination(clientId, documentId, clientSet);
                    pongMap.set(combination, {client, lastPong: Date.now()});
                    startHeartBeat(combination, clientSet, pongMap);
                }
                if (clientSet && jsonMessage['type'] && jsonMessage['type'] == 'pong') {
                    const clientId = jsonMessage['clientId'];
                    const documentId = jsonMessage['documentId'];
                    const uniqueClient = pongMap.get(`${clientId}:${documentId}`);
                    uniqueClient.lastPong = Date.now();
                }
            }
            catch (error) {
                console.log(error);
            }
        }
    }
    return { handleMessage };
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

const addCombination = (userId: string, documentId: string, uniqueSet: Set<string>) => {
    const combination = `${userId}:${documentId}`;
    !uniqueSet.has(combination) && uniqueSet.add(combination);
    return combination;
}

const startHeartBeat = (uniqueId: string, uniqueSet: Set<string>, pongMap: Map<any, any>) => {
    const clientData = pongMap.get(uniqueId);
    if (!clientData) return;
    clientData.heartBeatInterval = setInterval(() => {
        const now = Date.now();
        if (now - clientData.lastPong > PONG_TIMEOUT) {
            console.log(`heartbeat timeout for ${uniqueId}`);
            clientData.client.terminate();
            clearInterval(clientData.heartBeatInterval);
            pongMap.delete(uniqueId);
            uniqueSet.delete(uniqueId);
            return;
        };
        console.log(`heartbeat signal sent for ${uniqueId}`)
        clientData.client.send(JSON.stringify({ type: 'ping' }))
    }, PING_INTERVAL);
}


  