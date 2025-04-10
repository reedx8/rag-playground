"use client";
import { useFormStatus } from "react-dom";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { processFile } from "@/app/actions/fileProcessing";
// import { Document } from 'langchain/document';

export default function IngestForms() {
  const performIngestion = useAction(api.myActions.ingest);
  const performFileUpload = useAction(api.myActions.fileUpload);
  // const url = "https://tkdodo.eu/blog/refactor-impactfully";
  // const url = "https://lilianweng.github.io/posts/2023-06-23-agent/";
  // const url =
  //   "https://www.espn.com/nba/story/_/id/44480928/no-one-was-same-page-memphis-grizzlies-shocking-firing-taylor-jenkins";

  async function handleURL(formData: FormData) {
    // TODO: check URL valid and not already in vector store
    const url = String(formData.get("url")).trim();

    if (!url) {
      alert("Error: Please enter a valid URL.");
      return;
    }

    try {
      await performIngestion({ url });
      alert("URL processed successfully!");
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async function handleFileUpload(formData: FormData) {
    try {
      const serializableSplits = await processFile(formData); // Server Action since Convex Actions cannot take File types

      // Convex actions cannot take complex objects, so pass serialized docs
      performFileUpload({ docs: serializableSplits });
      alert("File processed successfully!");
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="border-1 p-2 rounded-sm w-84">
        <h2>Ingest New Webpage</h2>
        <form action={handleURL} className="mt-2">
          <input
            type="text"
            name="url"
            className="bg-white text-black p-1 mb-1 rounded-sm w-80"
            placeholder="Enter URL"
          />
          <div className="mt-2">
            <SubmitButton idleText="Submit URL" loadingText="Submitting..." />
          </div>
        </form>
      </div>
      <div className="border-1 p-2 rounded-sm w-84">
        <h2>Ingest New File</h2>
        <sub>PDF or CSV file only</sub>
        <form action={handleFileUpload} className="mt-2">
          <input
            type="file"
            name="file"
            className="bg-white text-black p-1 mb-1 rounded-sm hover:cursor-pointer"
          />
          <div className="mt-2">
            <SubmitButton idleText="Submit File" loadingText="Submitting..." />
          </div>
        </form>
      </div>
    </div>
  );
}

function SubmitButton({
  idleText,
  loadingText,
}: {
  idleText: string;
  loadingText: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="border-1 p-1 hover:cursor-pointer rounded-sm"
      disabled={pending}
    >
      {pending ? loadingText : idleText}
    </button>
  );
}
