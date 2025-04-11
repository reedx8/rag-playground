"use client";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";

export default function FileView() {
  const [files, setFiles] = useState<any[]>([]);
  const getAllFiles = useAction(api.myActions.getAllFiles);

  useEffect(() => {
    const getFiles = async () => {
      const files = await getAllFiles();
      setFiles(files);
    };
    getFiles();
  }, [getAllFiles]);

  return (
    <div>
      <h2>All Files:</h2>
      <ul>
        {files.map((file) => (
          <li key={file.source}>
            <p>{file.source}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
