"use server";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// load file into the Document format that we use downstream to chunk
export async function processFile(formData: FormData) {
  const file = formData.get("file") as File | null;

  if (
    !file ||
    file.size === 0 ||
    (!file.type.endsWith("pdf") && !file.type.endsWith("csv"))
  ) {
    throw new Error("Please upload a valid PDF or CSV file.");
  }

  try {
    // Save the file temporarily on the Next.js server
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a temporary file path on the Next.js server
    const tempFilePath = join(tmpdir(), file.name);
    await writeFile(tempFilePath, buffer);

    // Now you can use PDFLoader/CSVLoader with the file path
    let docs;
    if (file.type.endsWith("pdf")) {
      const loader = new PDFLoader(tempFilePath);
      docs = await loader.load();
    } else if (file.type.endsWith("csv")) {
      const loader = new CSVLoader(tempFilePath);
      docs = await loader.load();
    } else {
      throw new Error("Invalid file type");
    }

    // alert("Processed documents: " + docs);
    console.log("Processed documents:", docs);

    // Chunk docs
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const allSplits = await splitter.splitDocuments(docs);

    // return allSplits;

    // Convert chunks to a serializable format:
    // Convert the Document object to plain JavaScript objects with just the data you need (typically pageContent and metadata).
    // Creates a serializable representation that can safely pass from server to client.
    const serializableSplits = allSplits.map((doc) => ({
      pageContent: doc.pageContent,
      metadata: doc.metadata,
    }));

    return serializableSplits;

    // return docs;
  } catch (error) {
    console.error("Error processing file:", error);
    throw new Error("Failed to process the file");
  }
}
