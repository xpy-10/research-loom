import QuillWriter from "@/app/_components/documentComponents/quillWriter";
import { fetchDocument } from "@/lib/actions";
import { Document } from "@prisma/client";
import { WebSocketProvider } from 'next-ws/client';

export default async function ViewDoc({params}: {params:{docId:string}}) {
    const { docId } = await params;
    const document = await fetchDocument(Number(docId));
    const data: Document|undefined = document.success && document.data? document.data : undefined
    return (
        <>
        You have navigated to document page {docId}
        {data && <QuillWriter data={data} />}
        </>
    )
}