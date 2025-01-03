'use client'
import React, { useEffect, useState } from 'react';
import { useQuill } from 'react-quilljs';
import { QuillBinding } from 'collaborative-quill' 
import 'quill/dist/quill.snow.css';
import { retrieveDocument } from '@/lib/actions';
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {s} from 'json-joy/lib/json-crdt-patch'
import { useWebSocket } from 'next-ws/client';
import { Patch } from 'json-joy/lib/json-crdt-patch';
import Delta from 'quill-delta';
// import QuillCursors from 'quill-cursors';
import { useUser } from '@clerk/nextjs';


const schema = s.obj({
    document: s.obj({
        text: ext.quill.new('')
    })
})
let model = ModelWithExt.create(schema);
let documentBin: Uint8Array;
let api = () => model.s.document.text.toExt()

export default function QuillWriter() {

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
        // cursors: { transformOnTextChange: true}
      };
    const placeholder = 'start your document';
    const formats = [
        'bold', 'italic', 'underline', 'strike',
        'align', 'list', 'indent',
        'size', 'header',
        'link', 'image', 'video',
        'color', 'background',
      ]

    const [shouldUpdate, setShouldUpdate] = useState(false);
    const [remoteUpdate, setRemoteUpdate] = useState<Delta|undefined>(undefined);
    const { quill, quillRef, Quill } = useQuill({ theme, modules, formats, placeholder});
    const { isLoaded, isSignedIn, user} = useUser();
    const ws = useWebSocket();


    if (Quill && !quill) {
        // Quill.register('modules/cursors', QuillCursors);
    }


    useEffect(() => {
        const getDocument = async () => {
            documentBin = await (retrieveDocument())
            model = ModelWithExt.load(documentBin, undefined, schema);
        }
        getDocument();
        
    }, [])

    useEffect(() => {
        if (user && ws && quill) {
            const awarenessObject = {
                type: 'awareness',
                payload: {
                    userName: user.fullName,
                    userId: user.id,
                    userImageUrl: user.imageUrl,
                    cursor: 'undefined'
                }
            }
            console.log(quill);
            const jsonMessage = JSON.stringify(awarenessObject)
            ws?.send(jsonMessage)
        }

    }, [ws, user])

    // useEffect(() => {
    //     if (quill) {
    //         const localCursor = quill.getModule('cursors') 
    //         console.log(localCursor);
    //     }
    // }, [])

    useEffect(() => {
        let unbind: ()=> void;
        if (quill) {
            api = () => model.s.document.text.toExt()
            unbind = QuillBinding.bind(api, quill)
            quill.on('text-change', (delta, oldDelta, source) => {
                if (source === 'user') {
                    setShouldUpdate(true);
                }
            quill.on('selection-change', (range, oldRange, source) => {
                // console.log(range, oldRange, source);
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
        if (!shouldUpdate) return;
        const intervalId = setInterval(() => {
            const patch = model.api.flush()
            const message = { type: 'quill_update', payload: { quill_update: patch.toBinary()}}
            ws?.send(JSON.stringify(message));
            setShouldUpdate(false);
        }, 1000);
    
        return () => {
            clearInterval(intervalId);
        };
    }, [shouldUpdate]); 

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
                                console.log(json)
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

    return (
        <div style={{ width: 500, height: 300 }}>
        <div ref={quillRef} />
        </div>
    );
    };