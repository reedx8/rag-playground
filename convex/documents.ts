import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { fileTypes } from "./schema";

export const addDocument = mutation({
  args: {
    title: v.string(),
    docType: fileTypes,
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      title: args.title,
      type: args.docType,
    });
  },
});
