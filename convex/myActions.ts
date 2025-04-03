"use node";

import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { OpenAIEmbeddings } from "@langchain/openai";
import { v } from "convex/values";
import { action } from "./_generated/server.js";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
const API_KEY = process.env.OPENAI_API_KEY;

// The embedding model to use for the Convex vector store.
const embeddingModel = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
  apiKey: API_KEY,
});

export const ingest = action({
  args: {
    docs: v.any(),
  },
  handler: async (ctx, args) => {
    // Index chunks
    // await ConvexVectorStore.addDocuments(args.allSplits);
    // await ConvexVectorStore.fromDocuments(args.allSplits,embeddingModel, )
    // await ConvexVectorStore.fromDocuments(args.docs, embeddingModel, {
    //   ctx,
    // });

    await ConvexVectorStore.fromTexts(
      ["Hello world", "Bye bye", "What's this?"],
      [{ prop: 2 }, { prop: 1 }, { prop: 3 }],
      embeddingModel,
      { ctx },
    );
  },
});

export const search = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const vectorStore = new ConvexVectorStore(embeddingModel, { ctx });

    const resultOne = await vectorStore.similaritySearch(args.query, 1);
    console.log(resultOne);
  },
});
