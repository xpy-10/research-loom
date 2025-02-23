import { fetchDocuments } from "@/lib/actions";
import DocumentList from "../_components/documentComponents/documentList";

export default async function Document() {
    const documents = await fetchDocuments();
    return (
        <>
        <div className="p-4">
        <DocumentList data={documents && documents.success && documents.data? documents.data : [] }/>
        </div>
        </>
    )
}