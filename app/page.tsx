/*  Questions:
    - what does this article say about declarative memory?
    - what did the espn article say about taylor jenkins?
    - what does the article say about how to optimize the retrieval speed?
    - what did Trump announce on friday?
    - did article say who is leading the tiktok dealmaking effort?
    - did article say how many american users tikok has?
    - how long did tiktok go offline in the us?
*/
"use client";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { useCallback, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export default function Home() {
  const [response, setResponse] = useState<string | undefined>();
  const performIngestion = useAction(api.myActions.ingest);
  const performSearch = useAction(api.myActions.search);
  const performFileUpload = useAction(api.myActions.fileUpload);

  const handleSearch = async (formData: FormData) => {
    const query = String(formData.get("query"));
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    const result = await performSearch({ query });
    setResponse(result);
  };

  const handleFileUpload = async (formData: FormData) => {
    const file = formData.get("file") as File | null;

    if (file && file.size > 0 && file.type.endsWith("pdf") && file.type.endsWith("csv")) {
      console.log("file size: " + file?.size);
      // TODO: Upload file to convex storage first, ingest, then delete file from storage
      // performFileUpload({ file });
    } else {
      alert("Please upload a file.\nNOTE: Only PDF and CSV files are supported.");
    }
  };

  const handleIngestion = useCallback(
    (url: string) => {
      performIngestion({ url }).catch((error) => {
        console.error("ERROR DURING INGESTION: " + error);
        // console.log("hello'")
      });
    },
    [performIngestion],
  );

  useEffect(() => {
    // ingest url contents
    const fetchAndIngest = async () => {
      try {
        // const url = "https://tkdodo.eu/blog/refactor-impactfully";
        // const url = "https://lilianweng.github.io/posts/2023-06-23-agent/"
        const url =
          "https://www.espn.com/nba/story/_/id/44480928/no-one-was-same-page-memphis-grizzlies-shocking-firing-taylor-jenkins";

        handleIngestion(url);
      } catch (error) {
        console.error("ERROR LOADING/CHUNKING: " + error);
      }
    };

    // fetchAndIngest();
  }, [handleIngestion]);

  return (
    <main className="p-2 w-full h-full grid grid-cols-2 gap-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl mb-2 text-balance">Search articles with AI</h1>
        <form action={handleSearch}>
          <input
            type="text"
            name="query"
            className="bg-white text-black mb-4 p-1 mr-1 rounded-sm min-w-70"
            // size={40}
          />
          <SubmitButton idleText="Search" loadingText="Searching..." />
        </form>
        <h2>Upload A New File</h2>
        <sub>PDF or CSV file only</sub>
        <form action={handleFileUpload} className="mt-2">
          <input
            type="file"
            name="file"
            className="bg-white text-black p-1 mb-1 rounded-sm hover:cursor-pointer"
          />
          <div>
            <SubmitButton idleText="Submit file" loadingText="Submitting..." />
          </div>
        </form>
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
    </main>
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
