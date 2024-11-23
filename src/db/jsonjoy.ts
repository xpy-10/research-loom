import {Model} from 'json-joy/lib/json-crdt';
import {s} from 'json-joy/lib/json-crdt-patch';
import {Patch} from 'json-joy/lib/json-crdt-patch';

// Create a new JSON CRDT document.
const schema = s.obj({
    format: s.str(''),
    text: s.str('')
})
const model = Model.create().setSchema(schema);

model.api.root({
    format: 'markdown',
    text: 'Hello!',
});

// console.log(model.view());

const blob = model.toBinary();

const model2 = Model.fromBinary(blob).fork();

model.api.str(['text']).ins(5, ' Alice');
model2.api.str(['text']).ins(5, ' Charlie');

// console.log(model.view());
// console.log(model2.view());

const patch1 = model.api.flush().toBinary();
const patch2 = model2.api.flush().toBinary();

model.applyPatch(Patch.fromBinary(patch2));
model2.applyPatch(Patch.fromBinary(patch1));

// console.log(model.view());
// console.log(model2.view());

export default model;