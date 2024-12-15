import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {Model} from 'json-joy/lib/json-crdt';

const model = ModelWithExt.create(ext.quill.new(''));
const modelBinary = model.api.flush().toBinary();
const model2 = ModelWithExt.load(modelBinary)

export type crdtQuillOg = typeof model;
export type crdtQuillDoc = typeof model2;