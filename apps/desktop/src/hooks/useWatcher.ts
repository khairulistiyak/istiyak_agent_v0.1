import { useState, useEffect } from "react";

export function useWatcher() {
  const [todos, setTodos] = useState<any[]>([]);

  useEffect(() => {
    setTodos([
      { filePath: "index.ts", relativePath: "index.ts", line: 12, text: "TODO: clean import schemas" }
    ]);
  }, []);

  return { todos };
}
