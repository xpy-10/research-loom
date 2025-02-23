'use client'
import React, { useEffect, useState } from 'react';
import { useQuill } from 'react-quilljs';
import { QuillBinding } from 'collaborative-quill' 
import 'quill/dist/quill.snow.css';
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {s} from 'json-joy/lib/json-crdt-patch'
import { useWebSocket } from 'next-ws/client';
import { Patch } from 'json-joy/lib/json-crdt-patch';
import Delta from 'quill-delta';
import QuillCursors from 'quill-cursors';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { Document } from '@prisma/client';
import { awarenessConsumerType, connectionMessageType, rangeType, userAwarenessType } from '@/lib/types';
const CURSOR_LATENCY = 1000;
const QUILL_LATENCY = 1000;

const stringToColour = (str:string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash = hash & hash; 
    }
    hash = Math.abs(hash);

    const returnedColour = '#'+((1<<24) + (hash & 0xFFFFFF)).toString(16).slice(1);

    return returnedColour
}

// type rangeType = {
//     index: number,
//     length: number
// }

// interface userType {
//     userName: string,
//     userId: string,
//     userImageUrl: string,
//     cursor: rangeType | "undefined"
// }

// type awarenessConsumerType = {
//     [key: string]: userType;
// }

// type awarenessType = {
//     type: string,
//     payload: userType
// }


const schema = s.obj({
    document: s.obj({
        text: ext.quill.new('')
    })
})
let model = ModelWithExt.create(schema);
let documentBin: Uint8Array;
let api = () => model.s.document.text.toExt()


export default function QuillWriter({data}:{data:Document|undefined}) {
    const theme = 'snow';
    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ align: [] }],
            
            [{ list: 'ordered'}, { list: 'bullet' }],
            [{ indent: '-1'}, { indent: '+1' }],
            
            [{ size: ['small', false, 'large', 'huge'] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ['link', 'image', 'video'],
            [{ color: [] }, { background: [] }],
        ],
        clipboard: {
            matchVisual: false,
        },
        cursors: { transformOnTextChange: true}
    };
    const placeholder = 'start your document';
    const formats = [
        'bold', 'italic', 'underline', 'strike',
        'align', 'list', 'indent',
        'size', 'header',
        'link', 'image', 'video',
        'color', 'background',
    ]
    
    const [title, setTitle] = useState<string|undefined>(undefined);
    const [shouldUpdate, setShouldUpdate] = useState(false);
    const [currentAwareness, setCurrentAwareness] = useState<{shouldUpdate: boolean, range: rangeType|undefined, debounced: boolean}>({shouldUpdate: false, range: undefined, debounced:false})
    const [remoteAwareness, setRemoteAwareness] = useState<userAwarenessType[]>([]);
    const [remoteUpdate, setRemoteUpdate] = useState<Delta|undefined>(undefined);
    const { quill, quillRef, Quill, editor } = useQuill({ theme, modules, formats, placeholder});
    const { isLoaded, isSignedIn, user} = useUser();
    const [remoteCursorMap, setRemoteCursorMap] = useState(new Map())
    const ws = useWebSocket();
    let cursorModule: any

    useEffect(() => {
        if (ws && user && data && quill) {
            const connectionMessage: connectionMessageType = {
                type: 'connection',
                clientId: user.id,
                documentId: data.id
            };
            try{
                console.log(connectionMessage)
                ws?.send(JSON.stringify(connectionMessage))
            }
            catch (error) {
                console.log(error);
            }
        }
    }, [ws, data, user, quill])

    if (Quill && !quill) {
        Quill.register('modules/cursors', QuillCursors);
    }

    if (quill && editor) {
        cursorModule = editor.getModule('cursors')
    };

    useEffect(() => {
        if (!data) return;
        if (data) {
            setTitle(data.title);
            documentBin = data.contents
            model = ModelWithExt.load(documentBin, undefined, schema);
        }
    }, [data]);

    useEffect(() => {
        if (user && ws && quill && data) {
            const awarenessObject: connectionMessageType = {
                type: 'awareness',
                payload: {
                    userName: user.fullName? user.fullName : '',
                    userId: user.id? user.id: '',
                    userImageUrl: user.imageUrl? user.imageUrl: '',
                    cursor: 'undefined',
                },
                clientId: user.id, 
                documentId: data.id
            }
            const jsonMessage = JSON.stringify(awarenessObject)
            try {
                ws?.send(jsonMessage)
            }
            catch (error) {
                console.log(error);
            }
        }

    }, [ws, user, quill, data]);

    useEffect(() => {
        let unbind: ()=> void;
        if (quill) {
            api = () => model.s.document.text.toExt();
            unbind = QuillBinding.bind(api, quill);
            quill.on('text-change', (delta, oldDelta, source) => {
                if (source === 'user') {
                    setShouldUpdate(true);
                }
            quill.on('selection-change', (range, oldRange, source) => {
                if (source === 'user') {
                    const newAwareness = { shouldUpdate: true, range: range, debounced: false }
                    setCurrentAwareness(newAwareness);
                }
                else {
                    const newAwareness = { shouldUpdate: true, range: range, debounced: true }
                    setCurrentAwareness(newAwareness);
                }
            })

        });
        }
        return () => {
            if (quill){
                unbind();
                console.log('quill unbound');
            }
        }
    }, [quill])

    useEffect(() => {
        if (!currentAwareness.shouldUpdate || !data || !quill) return;
        else if (user && data && ws && quill && currentAwareness.range) {
            const timeoutId = setTimeout(() => {
                const awarenessObject: connectionMessageType = {
                    type: 'awareness', 
                    payload: {
                        userName: user.fullName ? user.fullName : '',
                        userId: user.id? user.id: '',
                        userImageUrl: user.imageUrl? user.imageUrl: '',
                        cursor: {index: currentAwareness.range!.index, length: currentAwareness.range!.length},
                    },
                    clientId: user.id, 
                    documentId: data.id
                };
                const awarenessJson = JSON.stringify(awarenessObject);
                try {
                    ws?.send(awarenessJson);
                }
                catch (error) {
                    console.log(error);
                }
                const newAwareness = { shouldUpdate: false, range: currentAwareness.range, debounced: false }
                setCurrentAwareness(newAwareness);
            }, CURSOR_LATENCY + (currentAwareness.debounced?1000:0));
        }
    }, [currentAwareness, data, ws, quill])

    useEffect(() => {
        if (!shouldUpdate || !user || !data) return;
        const timeoutId = setTimeout(() => {
            const patch = model.api.flush()
            const message = { type: 'quill_update', payload: { quill_update: patch.toBinary()}, clientId: user.id, documentId: data.id}
            try {
                ws?.send(JSON.stringify(message));
                setShouldUpdate(false);
            }
            catch (error) {
                console.log(error);
            }
        }, QUILL_LATENCY);
    
        return () => {
            clearTimeout(timeoutId);
        };
    }, [shouldUpdate, user, data]); 

    useEffect(() => {
        if (ws) {
            async function onMessage(event: MessageEvent) {
                if (event.data instanceof Blob) {
                    const res = new Response(event.data);
                    res.text().then((text) => {
                        try {
                            const json = JSON.parse(text);
                            if (json['type'] && json['type'] === 'quill_update') {
                                const payload = json['payload']['quill_update'];
                                const blob = new Uint8Array(Object.keys(payload).map(key => payload[key]))
                                model.applyPatch(Patch.fromBinary(blob));
                                const updatedText = new Delta(api().view());
                                setRemoteUpdate(updatedText);
                            }
                            if (json['type'] && json['type'] === 'awareness') {
                                const awareness = JSON.parse(json['awarenessMap']) as awarenessConsumerType
                                const tempawareness = Object.keys(awareness).map(key=> awareness[key] as userAwarenessType);
                                setRemoteAwareness(tempawareness);
                            }
                        }
                        catch (error) {
                            console.warn('Error processing blob: ', error);
                        }
                    } )
                }
            }
            ws?.addEventListener('message', onMessage);
            return () => ws?.removeEventListener('message', onMessage);
        }
    }, [ws]);

    useEffect(() => {
        if (remoteUpdate !== undefined) {
            if (quill) {
                const editorDelta = quill.getContents();
                const diff = editorDelta.diff(remoteUpdate);
                quill.updateContents(diff, 'silent')
            }
        }

    }, [remoteUpdate])

    useEffect(() => {
        if (user && ws && quill) {
            if (remoteAwareness.length > 0) {
                remoteAwareness.forEach( (remoteUser)=> {
                    if (remoteUser.cursor !== 'undefined') {
                        if (remoteCursorMap.has(remoteUser.userId) === false) {
                            const cursor = cursorModule.createCursor(`cursor_${remoteUser.userId}`, remoteUser.userName, stringToColour(remoteUser.userId))
                            if (user && user.id !== remoteUser.userId) {
                                remoteCursorMap.set(`cursor_${remoteUser.userId}`, cursor);
                                cursorModule.moveCursor(`cursor_${remoteUser.userId}`, remoteUser.cursor)
                            }
                        }
                    }
                })
                setRemoteCursorMap(new Map(remoteCursorMap));
            }
        }
    }, [remoteAwareness])

    return (
        <div>
            <div className='flex'>
            {
                remoteAwareness.map((item, index) => {
                    const customColour = stringToColour(item.userId)
                    return (
                    <div className='p-1' key={index}>
                        <Image className={`rounded-full border-2 p-0.5`} title={`${item.userName}`} style={{ borderColor: customColour }} src={item.userImageUrl} width={35} height={35} alt={`Picture of ${item.userName}`} />
                    </div>
                )
                })
            }
            </div>
            <div>
            </div>
            <div style={{ width: 500, height: 300 }}>
            <div>Title: {title}</div>
            <div ref={quillRef} />
            </div>
        </div>
    );
    };