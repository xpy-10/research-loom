'use client'
import {Patch} from 'json-joy/lib/json-crdt';
// import {CollaborativeQuill} from 'collaborative-quill/lib/CollaborativeQuill';
import Quill, { EmitterSource, QuillOptions } from 'quill';
import QuillCursors from 'quill-cursors';
import React, { useEffect, useState } from 'react';
import { useWebSocket } from 'next-ws/client';
import Delta from 'quill-delta';
import { retrieveDocument } from '@/lib/actions';
import dynamic from 'next/dynamic';
import {ModelWithExt, QuillDeltaApi, QuillDeltaNode, ext} from 'json-joy/lib/json-crdt-extensions';
import { quill } from 'json-joy/lib/json-crdt-extensions';
import {s} from 'json-joy/lib/json-crdt-patch'


const CollaborativeQuill = dynamic(
    () => import('../../../node_modules/collaborative-quill/lib/CollaborativeQuill')
    .then((mod) => mod.CollaborativeQuill),
    {
      ssr: false,
      loading: () => <div>Loading editor...</div>
    }
  );

  const schema = s.obj({
    nested: s.obj({
      obj: s.obj({
        text: ext.quill.new('Hello, world\n'),
      }),
    }),
  });

let model = retrieveDocument().fork();
let api = () => model.s.nested.obj.text.toExt();
let model2 = ModelWithExt.load(model.toBinary(), undefined, schema);
let api2 = () => model2.s.nested.obj.text.toExt();
// let api2 = new QuillDeltaApi(model2.api.find('nested/obj/text') as QuillDeltaNode, model.api)
// // console.warn(model2.api.find('nested/obj/text'));
// api2.

Quill.register('modules/cursors', QuillCursors);

export default function Document() {
    React.useSyncExternalStore(model.api.subscribe, () => model.tick);
    const editorRef = React.useRef<Quill | null>(null);
    const [shouldUpdate, setShouldUpdate] = useState(false);

    const ws = useWebSocket();

    useEffect(() => {
        if (!shouldUpdate) return;
        const intervalId = setInterval(() => {
            const patch = model.api.flush()
            ws?.send(patch.toBinary());
            setShouldUpdate(false);
        }, 5000);
    
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
                    console.warn(model);
                }).catch(err => {
                    console.warn('Error processing blob: ', err);
                })
            }
        }
        ws?.addEventListener('message', onMessage);
        return () => ws?.removeEventListener('message', onMessage);
    }, [ws]);

    const handleTextChange = (delta: Delta, oldDelta: Delta, source: EmitterSource) => {
        if (source === 'user') {
            setShouldUpdate(true);
            }
    }

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
    <CollaborativeQuill api={api2} onTextChange={handleTextChange} onEditor={(editor) => {editorRef.current = editor}} options={options as QuillOptions}/>
    </div>
    )
};