"use node";

import "cheerio";
import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { OpenAIEmbeddings } from "@langchain/openai";
import { v } from "convex/values";
import { action } from "./_generated/server.js";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

// Define OpenAI LLM to use
// const LLM_API_KEY = process.env.OPENAI_API_KEY;
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
});

// The embedding model to use for the Convex vector store.
const embeddingModel = new OpenAIEmbeddings({
  model: "text-embedding-3-small", // "...-large" causes vector size mismatch for some reason
  apiKey: process.env.OPENAI_API_KEY,
});

// Define prompt for question-answering
const promptTemplate = await pull<ChatPromptTemplate>("rlm/rag-prompt");

// Define state for application (To use LangGraph)
const InputStateAnnotation = Annotation.Root({
  question: Annotation<string>,
});

const StateAnnotation = Annotation.Root({
  question: Annotation<string>,
  context: Annotation<Document[]>,
  answer: Annotation<string>,
});

export const ingest = action({
  args: {
    // url: v.string(),
  },
  handler: async (ctx, args) => {
    // if (args.url.length === 0 || args.url === undefined) {
    // return;
    // }
    // TODO: include check if url already in vector store

    // parse url into documents:
    // const url = "https://lilianweng.github.io/posts/2023-06-23-agent/";
    const url =
      "https://www.cnn.com/2025/04/04/tech/tiktok-deal-ban-extended-trump/index.html";
    const docs = await loadAndChunk(url);
    // const docs = await loadAndChunk(args.url);
    console.log(docs);

    // add documents to Convex vector store (ie index chunks). addDocuments() DNE on ConvexVectorStore:
    await ConvexVectorStore.fromDocuments(docs, embeddingModel, { ctx });

    // await ConvexVectorStore.fromTexts(
    //   ["Hello world", "Bye bye", "What's this?"],
    //   [{ prop: 2 }, { prop: 1 }, { prop: 3 }],
    //   embeddingModel,
    //   { ctx },
    // );
  },
});

export const search = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    // const vectorStore = new ConvexVectorStore(embeddingModel, { ctx });

    // Define application steps
    const retrieve = async (state: typeof InputStateAnnotation.State) => {
      const vectorStore = new ConvexVectorStore(embeddingModel, { ctx });
      const retrievedDocs = await vectorStore.similaritySearch(state.question);
      return { context: retrievedDocs };
    };

    const generate = async (state: typeof StateAnnotation.State) => {
      const docsContent = state.context
        .map((doc) => doc.pageContent)
        .join("\n");
      const messages = await promptTemplate.invoke({
        question: state.question,
        context: docsContent,
      });
      const response = await llm.invoke(messages);
      return { answer: response.content };
    };

    // Compile application and test
    const graph = new StateGraph(StateAnnotation)
      .addNode("retrieve", retrieve)
      .addNode("generate", generate)
      .addEdge("__start__", "retrieve")
      .addEdge("retrieve", "generate")
      .addEdge("generate", "__end__")
      .compile();

    // const inputs = {
    //   question: "what does this article say about declarative memory?",
    // };
    const inputs = { question: args.query };
    const result = await graph.invoke(inputs);
    return result["answer"];

    // const resultOne = await vectorStore.similaritySearch(args.query, 1);
    // console.log(resultOne);
  },
});

// Load and chunk contents -- load HTML from web URLs and
// parse it to text. We can pass custom selectors to the constructor to only
// parse specific elements. Function defined server-side avoids any CORS policy from URL.
async function loadAndChunk(url: string) {
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
