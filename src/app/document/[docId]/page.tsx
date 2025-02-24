export const dynamic = 'force-dynamic';
import QuillWriter from "@/app/_components/documentComponents/quillWriter";
import SocketConnector from "@/app/_components/documentComponents/socketConnector";
import { fetchDocument } from "@/lib/actions";
import { Document } from "@prisma/client";

export default async function ViewDoc({params}: {params:{docId:string}}) {
    const { docId } = await params;
    const document = await fetchDocument(Number(docId));
    const data: Document|undefined = document.success && document.data? document.data : undefined
    return (
        <>
        <SocketConnector url={`ws://localhost:3000/api/websockets/${docId}`}>
            You have navigated to document page {docId}
            {data && <QuillWriter data={data} />}
            {!data && <div>No valid document retrieved</div>}
        </SocketConnector>
        </>
    )
}