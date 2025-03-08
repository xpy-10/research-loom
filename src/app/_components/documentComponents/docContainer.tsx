'use client'

import { Document } from "@prisma/client"
import QuillWriter from "@/app/_components/documentComponents/quillWriter";
import SocketConnector from "@/app/_components/documentComponents/socketConnector";
import { useEffect, useState } from "react";

export default function DocContainer({docId, data }: {docId: string, data: Document|undefined}) {
    const [url , setUrl] = useState<string|null>(null);

    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws:'
        const wsUrl = `${protocol}//${window.location.host}/api/websockets/${docId}`
        setUrl(wsUrl)
    }, [])

    return (
        <>
        <SocketConnector url={url?url:''}>
            {data && <QuillWriter data={data} />}
            {!data && <div>No valid document retrieved</div>}
        </SocketConnector>
        </>
    )
}