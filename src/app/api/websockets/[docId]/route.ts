import { connectionMessageType } from '@/lib/types';
import 'server-only';
import { z } from "zod";

const clientDocRooms = new Map<(import('ws').WebSocket), {docId: string}>();

export function GET() {
    const headers = new Headers();
    headers.set('Connection', 'Upgrade');
    headers.set('Upgrade', 'websocket');
    return new Response('Upgrade Required', { status: 426, headers });
  }

export async function SOCKET(
    client: import('ws').WebSocket,
    request: import('node:http').IncomingMessage,
    server: import('ws').WebSocketServer,
) {
    const pathname = request.url!
    const matches = pathname.match(/\/api\/([^\/]+)\/([^\/]+)/)
    const [fullURL, _, docId] = matches || []

    clientDocRooms.set(client, {docId});
    console.log(clientDocRooms.values());

    const { handleMessage } = await createHelpers(client, server, docId);

    client.on('open', () => console.log('websocket server started'));

    client.on('message', handleMessage);

    client.on('close', () => {
        console.log('a client disconnected')
    });
}

async function createHelpers( client: import('ws').WebSocket, server: import('ws').WebSocketServer, docId: string) {

    function getClientKeysFromDocId(map: Map<(typeof client), {docId: string}>, targetValue: string): (typeof client)[] {
        const keys: (typeof client)[]= [];
        for (const [key, value] of map.entries()) {
            if (value.docId === targetValue ) {
                keys.push(key);
            }
        }
        return keys;
    };
    
    const handleMessage = (payload: unknown) => {
        if (payload instanceof Buffer) {
            try {
                const jsonMessage: connectionMessageType = JSON.parse(payload.toString('utf-8'));
                if (jsonMessage.type == 'quill_update') {
                    console.log('quill update sent')
                    const documentId = jsonMessage.documentId;
                    const clientId = jsonMessage.clientId;
                    const clientArray = getClientKeysFromDocId(clientDocRooms, docId);
                    for (let c of clientArray) if (c !== client) c.send(payload);
                }
                if (jsonMessage.type == 'awareness' && jsonMessage.payload) {
                    console.log('awareness sent')
                    const documentId = jsonMessage.documentId;
                    const clientId = jsonMessage.clientId;
                    const userMap = createUserMap(jsonMessage.payload);
                    const allAwareness = { type: 'awareness', awarenessMap : JSON.stringify(Object.fromEntries(userMap))}
                    const jsonMap = JSON.stringify(allAwareness);
                    const buffer = Buffer.from(jsonMap);
                    const clientArray = getClientKeysFromDocId(clientDocRooms, docId);
                    for (let c of clientArray) if (c !== client) c.send(buffer);
                    client.send(buffer);
                }
                if (jsonMessage.type == 'connection') {
                    const clientId = jsonMessage.clientId;
                    const documentId = jsonMessage.documentId;
                    console.log(`connection established for document:${documentId} from user:${clientId}`);
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





  