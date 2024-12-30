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

const schema = s.obj({
    document: s.obj({
        text: ext.quill.new('')
    })
})
let model = ModelWithExt.create(schema);
let documentBin: Uint8Array;
let api = () => model.s.document.text.toExt()

export default function QuillWriter() {

    const [shouldUpdate, setShouldUpdate] = useState(false);
    const [remoteUpdate, setRemoteUpdate] = useState<Delta|undefined>(undefined);
    const { quill, quillRef } = useQuill();

    const ws = useWebSocket();

    useEffect(() => {
        const getDocument = async () => {
            documentBin = await (retrieveDocument())
            model = ModelWithExt.load(documentBin, undefined, schema);
        }
        getDocument();
        
    }, [])


    useEffect(() => {
        let unbind: ()=> void;
        if (quill) {
            api = () => model.s.document.text.toExt()
            unbind = QuillBinding.bind(api, quill)
            quill.on('text-change', (delta, oldDelta, source) => {
                if (source === 'user') {
                    setShouldUpdate(true);
                }
        });
        }
        return () => {
            if (quill){
                unbind();
                console.log('quill unbound');
            }
        }

    }, [quill])

    // React.useSyncExternalStore(model.s.document.text.toExt().api.subscribe, () => model.tick);


    useEffect(() => {
        if (!shouldUpdate) return;
        const intervalId = setInterval(() => {
            const patch = model.api.flush()
            ws?.send(patch.toBinary());
            setShouldUpdate(false);
        }, 1000);
    
        return () => {
            clearInterval(intervalId);
        };
    }, [shouldUpdate]); 

    useEffect(() => {
        async function onMessage(event: MessageEvent) {
            if (event.data instanceof Blob) {
                const res = new Response(event.data);
                res.arrayBuffer().then(arrayBuffer => {
                    const blob = new Uint8Array(arrayBuffer);
                    model.applyPatch(Patch.fromBinary(blob));
                    const updatedText = new Delta(api().view());
                    setRemoteUpdate(updatedText);
                    console.log(updatedText);
                }).catch(err => {
                    console.warn('Error processing blob: ', err);
                })
            }
        }
        ws?.addEventListener('message', onMessage);
        return () => ws?.removeEventListener('message', onMessage);
    }, [ws]);

    useEffect(() => {
        if (remoteUpdate !== undefined) {
            console.log(remoteUpdate);
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