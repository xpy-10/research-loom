'use client';

import { WebSocketProvider } from 'next-ws/client';

export default function Layout(p: React.PropsWithChildren) {
  return (
      <>
        <WebSocketProvider url="ws://localhost:3000/api/websockets">
          {p.children}
        </WebSocketProvider>
      </>
  );
}