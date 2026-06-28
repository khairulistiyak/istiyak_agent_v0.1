import { useState, useEffect } from "react";

export function useTelemetry() {
  const [latency, setLatency] = useState(120);
  const [speed, setSpeed] = useState(45);

  useEffect(() => {
    const timer = setInterval(() => {
      setLatency(100 + Math.floor(Math.random() * 50));
      setSpeed(40 + Math.floor(Math.random() * 10));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return { latency, speed };
}
