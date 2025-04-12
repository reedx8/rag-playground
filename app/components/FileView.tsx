"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function FileView() {
  // const [files, setFiles] = useState<any[]>([]);
  const allFiles = useQuery(api.chunks.getAllChunks);

  return (
    <div>
      <h2>All Files:</h2>
      <ol>
        {allFiles && allFiles.map((source: string) => (
          <li key={allFiles.indexOf(source)}>
            <p>{source}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
