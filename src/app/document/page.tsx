import { fetchDocuments } from "@/lib/actions";
import CreateDocumentComponent from "../_components/documentComponents/createDocumentComponent";
import DocumentList from "../_components/documentComponents/documentList";
import QuillWriter from "../_components/documentComponents/quillWriter";

export default async function Document() {
    const documents = await fetchDocuments();
    return (
        <>
        <div className="p-4">
        <DocumentList data={documents && documents.success && documents.data? documents.data : [] }/>
        </div>
        {/* <QuillWriter /> */}
        </>
    )
}