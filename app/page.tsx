"use client";
import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { OpenAIEmbeddings } from "@langchain/openai";

import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";
import { Annotation, StateGraph } from "@langchain/langgraph";

import { useMutation, useQuery } from "convex/react";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import Link from "next/link";
import { useCallback, useEffect } from "react";
import { load } from "langchain/load";

export default function Home() {
  const performIngestion = useAction(api.myActions.ingest);
  const url = "https://lilianweng.github.io/posts/2023-06-23-agent/"
  // const url =
    // "https://www.espn.com/nba/story/_/id/44480928/no-one-was-same-page-memphis-grizzlies-shocking-firing-taylor-jenkins";

  async function loadAndChunk(url: string){
    // Load and chunk contents -- uses cheerio to load HTML from web URLs and
    //parse it to text. We can pass custom selectors to the constructor to only
    // parse specific elements
    const pTagSelector = "p";
    const cheerioLoader = new CheerioWebBaseLoader(url, {
      selector: pTagSelector,
    });

    const docs = await cheerioLoader.load();
    console.assert(docs.length === 1, "Expected 1 document");
    console.log(`Total characters: ${docs[0].pageContent.length}`);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const allSplits = await splitter.splitDocuments(docs);

    return allSplits;
  }

  const handleIngestion = useCallback((docs: any) => {
    performIngestion({ docs }).catch((error) => {
      console.error("ERROR DURING INGESTION: " + error);
      // console.log("hello'")
    });
  }, [performIngestion]);

  useEffect(() => {

    const fetchAndIngest = async () => {
      try {
        const docs = await loadAndChunk(url);
        handleIngestion(docs);
      } catch (error) {
        console.error("ERROR LOADING/CHUNKING: " + error)
      }
    };

    fetchAndIngest();

    // const docs = await loadAndChunk(url);
    // handleIngestion(docs);
  }, [handleIngestion, url]);

  return <div>Hello</div>;
}
