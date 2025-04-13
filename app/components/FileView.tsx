"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { File } from "lucide-react"

export default function FileView() {
  const allDocs = useQuery(api.documents.getAllDocuments);

  return (
    <div className="mt-2">
      <h2 className="text-xl flex gap-1 items-center"><File size='18'/>Your Documents:</h2>
      <ol className="max-w-80">
        {allDocs?.map((doc, index) => (
          <li key={index}>
            <p className="text-sm truncate overflow-hidden whitespace-nowrap">
              {index + 1}. {doc.title}
            </p>
          </li>
        ))}
        {allDocs?.length === 0 && <p>No documents uploaded</p>}
      </ol>
    </div>
  );
}
