"use node"; // Need since Actions use unsupported NPM packages or Node.js APIs

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
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
});

// The embedding model to use for the Convex vector store.
const embeddingModel = new OpenAIEmbeddings({
  model: "text-embedding-3-small", // NOTE: "...-small" matches vector size defined in our schema.ts
  apiKey: process.env.OPENAI_API_KEY,
});

// Define prompt engineering template (see https://smith.langchain.com/hub/rlm/rag-prompt?organizationId=e2b7db87-830b-4374-b1e9-e923b4d3772a)
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

// Transform source into Document format, chunk, then add to Convex Vector Store
export const ingest = action({
  args: {
    docId: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: include check if url already in vector store

    // parse url into chunks of documents:
    try {
      const chunks = await loadAndChunk(args.url);
      console.log(chunks);
      chunks.forEach((chunk) => {
        chunk.metadata.documentId = args.docId;
      });

      // add documents to Convex vector store (ie index chunks). addDocuments() DNE on ConvexVectorStore:
      await ConvexVectorStore.fromDocuments(chunks, embeddingModel, {
        ctx,
        table: "chunks",
      });
    } catch (error) {
      throw new Error("Caught Error: " + error);
    }
  },
});

// Search over Vector Store to answer user's question
export const search = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    // Define application steps
    const retrieve = async (state: typeof InputStateAnnotation.State) => {
      const vectorStore = new ConvexVectorStore(embeddingModel, {
        ctx,
        table: "chunks",
      });
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

    // Compile application and test. "inputs" gets passed to the first node's state in the graph,
    // and its output is passed to the next node's state i believe
    const graph = new StateGraph(StateAnnotation)
      .addNode("retrieve", retrieve)
      .addNode("generate", generate)
      .addEdge("__start__", "retrieve")
      .addEdge("retrieve", "generate")
      .addEdge("generate", "__end__")
      .compile();

    const inputs = { question: args.query };
    const result = await graph.invoke(inputs);
    return result["answer"];
  },
});

export const fileUpload = action({
  args: {
    docs: v.any(),
    // file2: v.record(v.union(v.string(), v.any()), v.any()),
  },
  handler: async (ctx, args) => {
    // convert serialized docs back to Document objects
    const docs = args.docs.map(
      (split: { pageContent: any; metadata: any }) =>
        new Document({
          pageContent: split.pageContent,
          metadata: split.metadata,
        }),
    );
    // const loader = new PDFLoader(args.file);
    // const docs = await loader.load();
    // console.log(docs);

    // const docs = await loadAndChunk(args.file);
    // console.log(docs);

    // add documents to Convex vector store (ie index chunks). addDocuments() DNE on ConvexVectorStore:
    await ConvexVectorStore.fromDocuments(docs, embeddingModel, {
      ctx,
      table: "chunks",
    });
  },
});

// async function parseIntoDocs(fileType: string, url?: string, pdfFile?: File) {
//   if (fileType === "url" && url) {
//     const pTagSelector = "p";
//     const cheerioLoader = new CheerioWebBaseLoader(url, {
//       selector: pTagSelector,
//     });
//     return await cheerioLoader.load();
//   } else if (fileType === "pdf" && pdfFile) {
//     const loader = new PDFLoader(pdfFile);
//     return await loader.load();
//   } else {
//     throw new Error("Invalid file type or file");
//   }
// }

// async function parseAndChunk(source: any) {
//   const docs = await parseIntoDocs(source);
//   console.log(docs);
//   const splitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 1000,
//     chunkOverlap: 200,
//   });
//   const allSplits = await splitter.splitDocuments(docs);
//   return allSplits;
// }

// TODO: outsource this to a server-side function instead of here in convex code
// Load and chunk contents -- load HTML from web URLs and
// parse it to text. We can pass custom selectors to the constructor to only
// parse specific elements. Function defined server-side avoids any CORS policy from URL.
async function loadAndChunk(url: string) {
  const pTagSelector = "p";
  const cheerioLoader = new CheerioWebBaseLoader(url, {
    selector: pTagSelector,
  });

  try {
    const docs = await cheerioLoader.load();
    console.assert(docs.length === 1, "Expected 1 document");
    console.log(`Total characters: ${docs[0].pageContent.length}`);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const allSplits = await splitter.splitDocuments(docs);
    return allSplits;
  } catch (error) {
    throw new Error("Caught Error: " + error);
  }
}
