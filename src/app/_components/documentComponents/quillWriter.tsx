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
import { stringToColour } from '@/lib/utils';
import './quillWriterStyles.css';
import { syncDoc } from '@/lib/actions';
import { docSyncValidation } from '@/lib/formValidation';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
const CURSOR_LATENCY = 1000;
const QUILL_LATENCY = 1000;
const SYNC_INTERVAL = 10000;

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
            ['link', 'image', 'video', 'blockquote', 'code-block'],
            [{ color: [] }, { background: [] }],
        ],
        clipboard: {
            matchVisual: false,
        },
        cursors: { transformOnTextChange: true}
    };
    const placeholder = '';
    const formats = [
        'bold', 'italic', 'underline', 'strike',
        'align', 'list', 'indent',
        'size', 'header',
        'link', 'image', 'video', 'blockquote', 'code-block',
        'color', 'background',
    ]
    
    const [title, setTitle] = useState<string|undefined>(undefined);
    const [shouldUpdate, setShouldUpdate] = useState(false);
    const [shouldSyncDoc, setShouldSyncDoc] = useState(false);
    const [currentAwareness, setCurrentAwareness] = useState<{shouldUpdate: boolean, range: rangeType|undefined, debounced: boolean}>({shouldUpdate: false, range: undefined, debounced:false})
    const [remoteAwareness, setRemoteAwareness] = useState<userAwarenessType[]>([]);
    const [remoteUpdate, setRemoteUpdate] = useState<Delta|undefined>(undefined);
    const { quill, quillRef, Quill, editor } = useQuill({ theme, modules, formats, placeholder});
    const { user } = useUser();
    const [remoteCursorMap, setRemoteCursorMap] = useState(new Map());
    const { toast } = useToast();
    const ws = useWebSocket();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cursorModule: any

    useEffect(() => {
        if (ws && user && data && quill) {
            const connectionMessage: connectionMessageType = {
                type: 'connection',
                clientId: user.id,
                documentId: data.id
            };
            try{
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
                    setShouldSyncDoc(true);
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
            setTimeout(() => {
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
    }, [user, currentAwareness, data, ws, quill])

    useEffect(() => { 
        if (!shouldUpdate || !user || !data) return;
        const patchTimeoutId = setTimeout(() => {
            const patch = model.api.flush()
            const message: connectionMessageType = { 
                type: 'quill_update', 
                payload: { quill_update: patch.toBinary()}, 
                clientId: user.id, 
                documentId: data.id}
            try {
                ws?.send(JSON.stringify(message));
                setShouldUpdate(false);
            }
            catch (error) {
                console.log(error);
            }
        }, QUILL_LATENCY);
    
        return () => {
            clearTimeout(patchTimeoutId);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldUpdate, user, data]); 

    useEffect(() => {
        if (!shouldSyncDoc || !user || !data) return;
        const docTimeoutId = setTimeout(async () => {
            const message: z.infer<typeof docSyncValidation> = { 
                type: 'quill_doc', 
                payload: { quill_update: model.toBinary()}, 
                clientId: user.id, 
                documentId: data.id 
            };
            try {
                /* eslint-disable  @typescript-eslint/no-unused-expressions */
                const updatedDoc = await syncDoc(message);
                updatedDoc.success && updatedDoc.data && toast({
                    description: 'Synced document'
                });
                !updatedDoc.success && updatedDoc.message && toast({
                    description: updatedDoc.message
                });
                /* eslint-enable  @typescript-eslint/no-unused-expressions */
                setShouldSyncDoc(false);
            }
            catch (error) {
                console.log(error);
            }
        }, SYNC_INTERVAL);

        return () => {
            clearTimeout(docTimeoutId);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldSyncDoc, user, data])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remoteAwareness])

    return (
        <div className="relative">
            <div className='fixed bottom-4 right-4 bg-transparent p-2 z-20'>
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
            <div id="doc-container">
            <div>Title: {title}</div>
            <div id="quill-container" ref={quillRef} />
            </div>
        </div>
    );
    };