import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const fileTypes = v.union(
  v.literal("html"),
  v.literal("pdf"),
  v.literal("csv"),
);

export default defineSchema({
  // Vector store: each chunk is a LangChain Document Object in our vector store
  chunks: defineTable({
    embedding: v.array(v.number()),
    text: v.string(),
    metadata: v.any(), // stores reference to files table for now, among other things
  }).vectorIndex("byEmbedding", {
    vectorField: "embedding",
    dimensions: 1536, // this must match with the embedding model used (see your OpenAIEmbeddings object in convex/vector.ts)
  }),
  // Uploaded files
  documents: defineTable({
    title: v.string(),
    type: fileTypes,
    description: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")), // for storing file (todo)
    downloadUrl: v.optional(v.string()), // for downloading file (todo)
    webpageUrl: v.optional(v.string()), // link to webpage (for html files only)
  }).index("byTitle", ["title"]),
});
