import { query } from "./_generated/server.js";

export const getAllChunks = query({
  args: {},
  handler: async (ctx) => {
    const uniqueFiles: string[] = [];
    // let uniqueFiles = new Set();

    const results = await ctx.db.query("chunks").collect();
    results.forEach((result) => {
      const source = result.metadata.source;
      if (uniqueFiles.includes(source)) {
        return;
      }
      uniqueFiles.push(source);
    });

    return uniqueFiles;
  },
});
