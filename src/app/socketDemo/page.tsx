'use client';

import { useWebSocket } from 'next-ws/client';
import { useCallback, useEffect, useState } from 'react';
import {Model} from 'json-joy/lib/json-crdt';
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';


export default function Page() {
  const ws = useWebSocket();

  type Message = { author: string; content: string };
  const [messages, setMessages] = useState<Message[]>([]);

  type HandleSubmit = (ev: React.FormEvent<HTMLFormElement>) => void;
  const handleSubmit = useCallback<HandleSubmit>(
    (ev) => {
      ev.preventDefault();
      const form = new FormData(ev.currentTarget);
      const author = form.get('author') as string;
      const content = form.get('content') as string;
      if (!author || !content) return;

      ws?.send(JSON.stringify({ author, content }));
      setMessages((p) => [...p, { author: 'You', content }]);

      // Reset the content input (only)
      const contentInputElement = ev.currentTarget.querySelector(
        'input[name="content"]',
      ) as HTMLInputElement;
      contentInputElement.value = '';
    },
    [ws],
  );

  useEffect(() => {
    async function onMessage(event: MessageEvent) {
    //   const payload =
    //     typeof event.data === 'string' ? event.data : await event.data.text();
    //   const message = JSON.parse(payload) as Message;
    //   setMessages((p) => [...p, message]);
        if (event.data instanceof Blob) {
            const reader = new Response(event.data);
            reader.arrayBuffer().then(arrayBuffer => {
                let blob = new Uint8Array(arrayBuffer);
                console.log(blob)
                const model = ModelWithExt.load(blob);
                console.log(model.api.view())
            }).catch(err => {
                console.log('Error processing blob: ', err);
            });
        };

    }

    ws?.addEventListener('message', onMessage);
    return () => ws?.removeEventListener('message', onMessage);
  }, [ws]);

  return (
    <div style={{ maxWidth: '50vh' }}>
      <div style={{ minHeight: '90vh', position: 'relative' }}>
        {messages.map((message, i) => (
          <div key={String(i)}>
            <strong>{message.author}</strong>: {message.content}
          </div>
        ))}

        {messages.length === 0 && (
          <div
            style={{
              position: 'absolute',
              left: '0',
              top: '0',
              right: '0',
              bottom: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <p style={{ color: 'white' }}>Waiting for messages...</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
        <input
          name="author"
          style={{ width: '70px', color: 'black', padding: '1rem'}}
          type="text"
          placeholder="Your name"
        />
        <input
          name="content"
          style={{ width: '280px', color: 'black', padding: '1rem' }}
          type="text"
          placeholder="Your message"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
