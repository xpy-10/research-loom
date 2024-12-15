import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';

const model = ModelWithExt.create(ext.quill.new('123'));

export function retrieveDocument() {
    return model
}