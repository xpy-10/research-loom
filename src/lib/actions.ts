import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {s} from 'json-joy/lib/json-crdt-patch'

const schema = s.obj({
    nested: s.obj({
      obj: s.obj({
        text: ext.quill.new('Hello, world\n'),
      }),
    }),
  });

const model = ModelWithExt.create(schema);

export function retrieveDocument() {
    return model
}