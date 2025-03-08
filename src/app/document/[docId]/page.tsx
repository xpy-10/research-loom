export const dynamic = 'force-dynamic';
import QuillWriter from "@/app/_components/documentComponents/quillWriter";
import SocketConnector from "@/app/_components/documentComponents/socketConnector";
import { fetchDocument } from "@/lib/actions";
import { Document } from "@prisma/client";

type Params = Promise<{
    docId: string
}>

export default async function ViewDoc( { params }: {params: Params} ) {
    const { docId } = await params;
    const document = await fetchDocument(Number(docId));
    const data: Document|undefined = document.success && document.data? document.data : undefined
    const socketUrl = process.env.NODE_ENV === 'production' ? `wss://xpy.10.com/api/websockets/${docId}` : 
    `ws://localhost:3000/api/websockets/${docId}`
    return (
        <>
        <SocketConnector url={socketUrl}>
            {data && <QuillWriter data={data} />}
            {!data && <div>No valid document retrieved</div>}
        </SocketConnector>
        </>
    )
}