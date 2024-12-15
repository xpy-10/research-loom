'use client'
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {CollaborativeQuill} from 'collaborative-quill/lib/CollaborativeQuill';
import Quill, { QuillOptions } from 'quill';
import QuillCursors from 'quill-cursors';
import React, { useEffect, useState } from 'react';
import { useWebSocket } from 'next-ws/client';
import Delta from 'quill-delta';
import { retrieveDocument } from '@/lib/actions';

let model = retrieveDocument();
let api = () => model.s.toExt();

Quill.register('modules/cursors', QuillCursors);

export default function Document() {
    React.useSyncExternalStore(model.api.subscribe, () => model.tick);
    const editorRef = React.useRef<Quill | null>(null);

    const ws = useWebSocket();

    useEffect(() => {
        async function onMessage(event: MessageEvent) {
            if (event.data instanceof Blob) {
                const res = new Response(event.data);
                res.arrayBuffer().then(arrayBuffer => {
                    let blob = new Uint8Array(arrayBuffer);
                    const retrievedModel = ModelWithExt.load(blob);
                    if (!editorRef.current) return;
                    editorRef.current.updateContents(new Delta(retrievedModel.api.view() as []));
                }).catch(err => {
                    console.warn('Error processing blob: ', err);
                })
            }
        }
        ws?.addEventListener('message', onMessage);
        return () => ws?.removeEventListener('message', onMessage);
    }, [ws]);

    const options = {
        debug: 'info',
        modules: {
            cursors: true,
            toolbar: [
              [{ header: [1, 2, false] }],
              ['bold', 'italic', 'underline'],
              ['image', 'code-block']
            ],
            history: {
              userOnly: true
            }
        },
        theme: 'snow'
    };
    return (
    <div className='mt-10'>
    <CollaborativeQuill api={api} onEditor={(editor) => {editorRef.current = editor}} options={options as QuillOptions}/>
    </div>
    )
};