# RAG Playground

A Retrieval Augmented Generation (RAG) system that can ingest multiple document formats (URL, PDF, and CSV) into vector store and provide AI-powered responses with OpenAI's ChatGPT, using LangChain and LangSmith libraries.

## Get started

```
git clone https://github.com/reedx8/rag-playground.git
cd rag-playground
npm install
npm run dev
```

This app uses OpenAI to generate embeddings and LangSmith to monitor app's state. Add OPENAI_API_KEY and LANGSMITH_API_KEY Convex environment variables on your Convex dashboard.

## Features

- Ingest multiple document formats (URL, PDF, and CSV) into Convex vector store
- Provide AI-powered responses with OpenAI's ChatGPT, using LangChain and LangSmith libraries
- Search for relevant information in the vector store

## How it works

1. User uploads a document (URL, PDF, or CSV) to the application
2. The application parses the document and chunks it into smaller documents
3. The application adds the chunked documents to the Convex vector store
4. The application provides AI-powered responses using OpenAI's ChatGPT
5. The application searches for relevant information in the vector store and returns the results

## Tech Stack

1. Chat model -- OpenAI
2. Vector store -- Convex DB
3. Embedding model -- OpenAI
4. RAG library -- LangChain + LangSmith
5. Others -- TypeScript, Next.js, React
