"use client";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { useCallback, useEffect, useState } from "react";
// import { ErrorBoundary } from "react-error-boundary";
// import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
// import { useMutation, useQuery } from "convex/react";
// import ConvexClientProvider from "@/components/ConvexClientProvider";
// import Link from "next/link";
// import { load } from "langchain/load";

export default function Home() {
  const [response, setResponse] = useState<string | undefined>();
  const performIngestion = useAction(api.myActions.ingest);
  const performSearch = useAction(api.myActions.search);

  const handleSearch = async (formData: FormData) => {
    const query = formData.get("query");
    // alert(query);
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
    <div className="p-2 w-full h-full">
      <form action={handleSearch}>
        {/*  Questions:
          - what does this article say about declarative memory?
          - what did the espn article say about taylor jenkins?
          - what does the article say about how to optimize the retrieval speed?
          - what did Trump announce on friday?
        */}
        <input
          type="text"
          name="query"
          className="bg-white text-black mb-2 p-1 mr-1 rounded-sm"
          size={50}
        />
        <button
          type="submit"
          className="border-1 p-1 hover:cursor-pointer rounded-sm"
        >
          Search
        </button>
      </form>
      {response === undefined ? "AI response here" : response}
      <div className='mt-2'>
        <button
          className="border-1 p-1 hover:cursor-pointer rounded-sm"
          onClick={() => setResponse(undefined)}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
