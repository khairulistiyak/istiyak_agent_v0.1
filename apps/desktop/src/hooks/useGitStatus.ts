import { useState, useEffect } from "react";

export function useGitStatus() {
  const [branch, setBranch] = useState("main");
  useEffect(() => {
    setBranch("main");
  }, []);
  return { branch };
}
