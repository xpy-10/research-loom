import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import { z } from 'zod';

const model = ModelWithExt.create(ext.quill.new(''));
const modelBinary = model.api.flush().toBinary();
const model2 = ModelWithExt.load(modelBinary);


export type crdtQuillOg = typeof model;
export type crdtQuillDoc = typeof model2;

export type createProjectType = {id:number, name:string, description:string};
export type projectType_db = {
    success: boolean,
    data?: {
        description: string;
        id: number;
        name: string;
        organization: string;
    },
    message?: string;
}

export type documentListItemType = {
    id: number,
    title: string
}

/* types for Quill */

export type socketMessageType = 'connection' | 'awareness' | 'quill_update'

export type rangeType = {
    index: number,
    length: number
}

export type userAwarenessType = {
    userName: string,
    userId: string,
    userImageUrl: string,
    cursor: rangeType | 'undefined'
}

export type awarenessConsumerType = {
    [key: string]: userAwarenessType
}

export type quillUpdateType = {
    quill_update: Uint8Array<ArrayBufferLike>
}

export type connectionMessageType = {
    type: socketMessageType,
    payload?: quillUpdateType | userAwarenessType ,
    clientId: string,
    documentId: number
}


