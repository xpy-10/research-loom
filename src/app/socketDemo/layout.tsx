'use client';

import { WebSocketProvider } from 'next-ws/client';

export default function Layout(p: React.PropsWithChildren) {
  return (
      <div
        style={{
          backgroundColor: 'black',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <WebSocketProvider url="ws://localhost:3000/api/websockets">
          {p.children}
        </WebSocketProvider>
      </div>
  );
}