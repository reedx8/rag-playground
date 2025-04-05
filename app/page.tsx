"use client";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { useCallback, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

export default function Home() {
  const [response, setResponse] = useState<string | undefined>();
  const performIngestion = useAction(api.myActions.ingest);
  const performSearch = useAction(api.myActions.search);

  const handleSearch = async (formData: FormData) => {
    const query = String(formData.get("query"));
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    const result = await performSearch({ query });
    setResponse(result);
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
    <main className="p-2 w-full h-full">
      <h1 className="text-2xl mb-2">Search your article archive with AI</h1>
      <form action={handleSearch}>
        {/*  Questions:
          - what does this article say about declarative memory?
          - what did the espn article say about taylor jenkins?
          - what does the article say about how to optimize the retrieval speed?
          - what did Trump announce on friday?
          - did article say who is leading the tiktok dealmaking effort?
          - did article say how many american users tikok has?
          - how long did tiktok go offline in the us?
        */}
        <input
          type="text"
          name="query"
          className="bg-white text-black mb-2 p-1 mr-1 rounded-sm"
          size={50}
        />
        <SubmitButton />
      </form>
      {response && (
        <div className="mt-2">
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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="border-1 p-1 hover:cursor-pointer rounded-sm"
      disabled={pending}
    >
      {pending ? "Searching..." : "Search"}
    </button>
  );
}
