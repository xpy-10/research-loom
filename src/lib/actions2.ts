import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {s} from 'json-joy/lib/json-crdt-patch'

const schema = s.obj({
    document: s.obj({
        text: ext.quill.new('abc')
    })
})

const model = ModelWithExt.create(schema);

export function retrieveDocument() {
    return model
}