export const dynamic = 'force-dynamic';
import DocContainer from "@/app/_components/documentComponents/docContainer";
import { fetchDocument } from "@/lib/actions";
import { Document } from "@prisma/client";

type Params = Promise<{
    docId: string
}>

export default async function ViewDoc( { params }: {params: Params} ) {
    const { docId } = await params;
    const document = await fetchDocument(Number(docId));
    const data: Document|undefined = document.success && document.data? document.data : undefined
    return (
        <>
        <DocContainer docId={docId} data={data}/>
        </>
    )
}