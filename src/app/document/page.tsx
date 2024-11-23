'use client'
import React from 'react';
import model from '../../db/jsonjoy'
import ReactQuillNew from '../components/ReactQuillNew'

export default function Document(){
    const view = React.useSyncExternalStore(
        model.api.subscribe,
        model.api.getSnapshot, [model] as any);
    
    return (
    <>
    <div>
        {String(model.api.node.get('format').view())}
    </div>
    <div>
        {String(model.api.node.get('text').view())}
    </div>
    <ReactQuillNew />
    </>
    )
}