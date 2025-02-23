'use client'
import { WebSocketProvider } from 'next-ws/client';
export default function SocketConnector({url, children}: {url: string, children: React.ReactNode}) {
    return (
        <>
        <WebSocketProvider url={url} >
            {children}
        </WebSocketProvider>
        </>
    )
}