"use client";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { useCallback, useEffect, useState } from "react";
// import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
// import { useMutation, useQuery } from "convex/react";
// import ConvexClientProvider from "@/components/ConvexClientProvider";
// import Link from "next/link";
// import { load } from "langchain/load";

export default function Home() {
  const [response, setResponse] = useState<string | undefined>();
  const performIngestion = useAction(api.myActions.ingest);
  const performSearch = useAction(api.myActions.search);

  const handleSearch = async () => {
    // const query = "What did the espn article say about taylor jenkins?";
    // const query = "what does the article say about how to optimize the retrieval speed?"
    const query = "what did Trump announce on friday?";
    const result = await performSearch({ query });
    // console.log(result);
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
    <div>
      {response === undefined ? "Response here" : response}
      <div className="flex gap-4 mt-4">
        <button onClick={handleSearch}>Search</button>
        <button onClick={() => setResponse(undefined)}>Clear</button>
      </div>
    </div>
  );
}
