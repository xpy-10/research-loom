'use client'
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {CollaborativeQuill} from 'collaborative-quill/lib/CollaborativeQuill';
import Quill, { QuillOptions } from 'quill';
import QuillCursors from 'quill-cursors';

const model = ModelWithExt.create(ext.quill.new(''));
Quill.register('modules/cursors', QuillCursors);

export default function Document() {
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
    <>
    <CollaborativeQuill api={model.s.toExt} options={options as QuillOptions}/>
    </>
    )
};