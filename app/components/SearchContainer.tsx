"use client";
import { useAction } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useFormStatus } from "react-dom";
import IngestForms from "./IngestForms";
// import { processPdfFile } from "@/app/actions/fileProcessing";

export default function SearchContainer() {
  const [response, setResponse] = useState<string | undefined>();
  const performSearch = useAction(api.rag.search);

  const handleSearch = async (formData: FormData) => {
    const query = String(formData.get("query"));
    if (query.length === 0) {
      alert("Please enter a query");
      return;
    }
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    try {
      const result = await performSearch({ query });
      setResponse(result);
    } catch (error) {
      alert(
        `Caught Error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl text-balance">Search documents with AI</h1>
        <form action={handleSearch} className="mb-2">
          <input
            type="text"
            name="query"
            className="bg-white text-black p-1 mr-2 rounded-sm min-w-80"
            // size={40}
          />
          <SubmitButton idleText="Search" loadingText="Searching..." />
        </form>
        <IngestForms />
      </div>
      {response && (
        <div className="mt-2 flex flex-col gap-2">
          <p>{response}</p>
          <button
            className="border-1 p-1 hover:cursor-pointer rounded-sm"
            onClick={() => setResponse(undefined)}
          >
            Clear
          </button>
        </div>
      )}
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
    <>
      <button
        type="submit"
        className="border-1 p-1 hover:cursor-pointer rounded-sm"
        disabled={pending}
      >
        {pending ? loadingText : idleText}
      </button>
    </>
  );
}
