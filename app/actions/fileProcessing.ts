"use server";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

export async function processPdfFile(formData: FormData) {
  const file = formData.get("file") as File | null;

  if (
    !file ||
    file.size === 0 ||
    (!file.type.endsWith("pdf") && !file.type.endsWith("csv"))
  ) {
    throw new Error("Please upload a valid PDF or CSV file.");
  }

  try {
    // Save the file temporarily on the server
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a temporary file path
    const tempFilePath = join(tmpdir(), file.name);
    await writeFile(tempFilePath, buffer);

    // Now you can use PDFLoader with the file path
    const loader = new PDFLoader(tempFilePath);
    const docs = await loader.load();

    // alert("Processed documents: " + docs);
    console.log("Processed documents:", docs);

    // Here you would do whatever you need with the docs
    // For example, store them in your database using your Convex action

    // return docs;
  } catch (error) {
    console.error("Error processing file:", error);
    throw new Error("Failed to process the file");
  }
}
