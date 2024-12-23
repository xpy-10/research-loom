'use client'
import React, { useEffect } from 'react';
import { useQuill } from 'react-quilljs';
import { QuillBinding } from 'collaborative-quill' 
import 'quill/dist/quill.snow.css';
import { retrieveDocument } from '@/lib/actions';
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {s} from 'json-joy/lib/json-crdt-patch'


export default () => {
    
    const schema = s.obj({
        document: s.obj({
            text: ext.quill.new('')
        })
    })
    let model = ModelWithExt.create(schema);
    let documentBin: Uint8Array

    const { quill, quillRef } = useQuill();

    // useEffect(() => {
    //     if (quill) {
    //     quill.on('text-change', (delta, oldDelta, source) => {
    //         console.log('Text change!');
    //         console.log(quill.getText()); // Get text only
    //         console.log(quill.getContents()); // Get delta contents
    //         console.log(quill.root.innerHTML); // Get innerHTML using quill
    //         console.log(quillRef.current.firstChild.innerHTML); // Get innerHTML using quillRef
    //     });
    //     }
    // }, [quill]);

    useEffect(() => {
        if (quill) {
        quill.on('text-change', (delta, oldDelta, source) => {
            
        });
        }
    }, [quill]);
    
    useEffect(() => {
        const getDocument = async () => {
            documentBin = await (retrieveDocument())
            model = ModelWithExt.load(documentBin, undefined, schema);
            // console.warn(model)
        }
        getDocument();
        
    }, [])
    
    useEffect(() => {
        let unbind: ()=> void;
        if (quill) {
            const api = () => model.s.document.text.toExt()
            unbind = QuillBinding.bind(api, quill)
            quill.on('text-change', (delta, oldDelta, source) => {
                console.warn(model.s.document.text.toView());
        });
        }
        return () => {
            if (quill){
                unbind();
            }
        }

    }, [quill])



    


    console.log(quill);    // undefined > Quill Object
    console.log(quillRef); // { current: undefined } > { current: Quill Editor Reference }

    return (
        <div style={{ width: 500, height: 300 }}>
        <div ref={quillRef} />
        </div>
    );
    };