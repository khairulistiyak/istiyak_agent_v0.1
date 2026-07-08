import React, { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Code2, 
  Cpu, 
  Terminal, 
  Sparkles, 
  FileCode
} from "lucide-react";
import { GlassButton } from "../ui/GlassButton.js";
import { InteractiveToolCall } from "./agent-preview/InteractiveToolCall.js";
import { SessionSummaryMetrics } from "./agent-preview/SessionSummaryMetrics.js";

interface SimulationStep {
  title: string;
  subtitleBn: string;
  subtitleEn: string;
  banglaNarrative: string;
  englishNarrative: string;
  agentThought: string;
  activeFile: string;
  codeSnippet: string;
  highlightLine?: number;
  typingText?: string;
  toolCall?: {
    name: string;
    args: string;
    logs: string[];
  };
  diffLines?: { type: "normal" | "addition" | "deletion"; content: string }[];
  terminalLogs?: string[];
  requiresUserAction?: "plan" | "diff";
}

const CART_SCENARIO: SimulationStep[] = [
  {
    title: "1. Developer Active Typing",
    subtitleBn: "১. ডেভেলপার কোড এডিট করছেন",
    subtitleEn: "1. Developer editing code in editor",
    banglaNarrative: "আপনি 'src/app/cart/page.tsx' ফাইলটি এডিটরে ওপেন করে নতুন শপিং কার্ট পেজ কোডিং করা শুরু করেছেন। এজেন্ট আপনার কাজের ফাইলটি ট্র্যাক করছে এবং ইন-মেমোরি কনটেক্সট আপডেট করছে।",
    englishNarrative: "You opened 'src/app/cart/page.tsx' and started typing out the cart interface. The agent tracks file buffer updates.",
    agentThought: "Listening... Monitoring active developer session changes in src/app/cart/page.tsx...",
    activeFile: "src/app/cart/page.tsx",
    codeSnippet: `import React from "react";
// Typing useCart hook...
export default function CartPage() {
  const { items, total, checkout } = useCart();
  
  return (
    <div className="p-6 bg-black/40">
      <h1 className="text-xl">Your Agro Cart</h1>
      <CartItemList items={items} />`,
    highlightLine: 4,
    typingText: "const { items, total, checkout } = useCart();"
  },
  {
    title: "2. Agent Context Scoping",
    subtitleBn: "২. ডিপেন্ডেন্সি ও মিসিং ইম্পোর্ট অ্যানালাইসিস",
    subtitleEn: "2. Dependency & missing import analysis",
    banglaNarrative: "এজেন্ট আপনার ইমপোর্ট করা 'useCart' হুক-এর অনুপস্থিতি লক্ষ্য করেছে। এটি প্রোজেক্টের সোর্স ডিরেক্টরি স্ক্যান করে দেখছে এই হুকটি আদৌ তৈরি করা হয়েছে কিনা এবং ফাইল রিড করার প্রস্তুতি নিচ্ছে।",
    englishNarrative: "Agent detects missing useCart dependency. It starts checking if the hook exists in the codebase.",
    agentThought: "Missing import detected: 'useCart' is referenced but not resolved in src/app/cart/page.tsx. Scoping directory tree...",
    activeFile: "src/app/cart/page.tsx",
    codeSnippet: `import React from "react";
// useCart hook needs to be implemented!
export default function CartPage() {
  const { items, total, checkout } = useCart();
  
  return (
    <div className="p-6 bg-black/40">
      <h1 className="text-xl">Your Agro Cart</h1>
      <CartItemList items={items} />`,
    highlightLine: 4,
    toolCall: {
      name: "grep_search",
      args: "Query: 'useCart', SearchPath: 'src/'",
      logs: [
        "[04:12:01] Running ripgrep search for 'useCart' in src/...",
        "[04:12:02] No results found. Hook file does not exist."
      ]
    }
  },
  {
    title: "3. Implementation Plan Proposal",
    subtitleBn: "৩. ইমপ্লিমেন্টেশন প্ল্যান প্রস্তাবনা",
    subtitleEn: "3. Proposing implementation plan",
    banglaNarrative: "এজেন্ট একটি নতুন কার্ট হুক ও প্রোভাইডার ফাইল তৈরি করার জন্য ইমপ্লিমেন্টেশন প্ল্যান তৈরি করেছে। প্ল্যানটি অনুমোদন করলে এজেন্ট সোর্স ফাইলে প্রয়োজনীয় পরিবর্তনগুলো লিখে দিবে। অনুগ্রহ করে Approve Plan ক্লিক করুন।",
    englishNarrative: "Agent proposes generating a useCart state provider hook and integrating it with CartPage. Click Approve Plan.",
    agentThought: "Formulated plan: [NEW] src/hooks/useCart.tsx for state management, [MODIFY] src/app/cart/page.tsx to resolve imports. Awaiting developer approval...",
    activeFile: "implementation_plan.md",
    codeSnippet: `# Plan: Add Cart State Hook
1. [NEW] Create src/hooks/useCart.tsx containing context, items array, and addItem/removeItem logic.
2. [MODIFY] Implement full imports and map items array to layout in src/app/cart/page.tsx.
3. [VERIFY] Compile using next build or tsc.`,
    requiresUserAction: "plan"
  },
  {
    title: "4. Code-Gen & Tool Execution",
    subtitleBn: "৪. কোড জেনারেশন ও টুলস রান",
    subtitleEn: "4. Executing file tools and writing code",
    banglaNarrative: "এজেন্ট `write_to_file`ツール ব্যবহার করে রিয়েক্ট স্টেট ও কনটেক্সট সম্পন্ন নতুন `src/hooks/useCart.tsx` ফাইলটি রাইট করছে।",
    englishNarrative: "Agent invokes write_to_file tool to implement react context cart state hook.",
    agentThought: "Writing src/hooks/useCart.tsx with complete addToCart, removeFromCart, and localStorage sync logic...",
    activeFile: "src/hooks/useCart.tsx",
    codeSnippet: `import React, { createContext, useContext, useState } from "react";

export interface CartItem { id: string; name: string; price: number; quantity: number; }
const CartContext = createContext<any>(null);

export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  const addItem = (item: CartItem) => {
    setItems(prev => [...prev, item]);
  };
  return <CartContext.Provider value={{ items, total, addItem }}>{children}</CartContext.Provider>;
};`,
    toolCall: {
      name: "write_to_file",
      args: "TargetFile: 'src/hooks/useCart.tsx', Overwrite: true",
      logs: [
        "[04:12:15] Creating directory src/hooks...",
        "[04:12:16] Writing 840 bytes of React hooks template...",
        "[04:12:17] File write successfully verified."
      ]
    }
  },
  {
    title: "5. Code Review Staging",
    subtitleBn: "৫. কোড ডিফ রিভিউ ও মার্জ রিকোয়েস্ট",
    subtitleEn: "5. Staging diff and request review merge",
    banglaNarrative: "এজেন্ট আপনার শপিং কার্ট পেজে হুক ইম্পোর্ট এবং আইটেম রেন্ডারিং লুপ যুক্ত করেছে। ফাইল মার্জ করার আগে পরিবর্তনগুলো দেখে Approve & Merge বাটনে ক্লিক করুন।",
    englishNarrative: "Agent integrates useCart inside CartPage. Review modifications in diff viewer and click Approve & Merge.",
    agentThought: "Merging CartPage UI bindings with useCart hook provider. Review requested...",
    activeFile: "src/app/cart/page.tsx",
    codeSnippet: `// diff rendering
export default function CartPage() {
-  const { items, total, checkout } = useCart();
+  const { items, total } = useCart();
+  const cartItemsCount = items.length;`,
    diffLines: [
      { type: "normal", content: "import React from 'react';" },
      { type: "addition", content: "import { useCart } from '../../hooks/useCart';" },
      { type: "normal", content: "export default function CartPage() {" },
      { type: "deletion", content: "  const { items, total, checkout } = useCart();" },
      { type: "addition", content: "  const { items, total } = useCart();" },
      { type: "addition", content: "  const itemsCount = items.length;" },
      { type: "normal", content: "  return <div className=\"p-6\">Items: {itemsCount}</div>;" }
    ],
    requiresUserAction: "diff"
  },
  {
    title: "6. Compilation & Verification",
    subtitleBn: "৬. ব্যাকগ্রাউন্ড কম্পাইল ও টাইপ চেকিং",
    subtitleEn: "6. Background compiler diagnostics verification",
    banglaNarrative: "এজেন্ট ব্যাকগ্রাউন্ডে `npm run build` রান করে দেখছে নতুন ইম্পোর্ট এবং ফাইলগুলো প্রজেক্টের সাথে টাইপ-সেফ কিনা। কোন কম্পাইল এরর পাওয়া যায়নি।",
    englishNarrative: "Agent triggers typescript build validation checks. Project compiles cleanly with zero issues.",
    agentThought: "Running workspace builder compilation diagnostics check... Success.",
    activeFile: "Terminal Output",
    codeSnippet: "",
    terminalLogs: [
      "$ tsc --noEmit && vite build",
      "vite v5.4.10 building for production...",
      "transforming...",
      "✓ 48 modules transformed.",
      "rendering chunks...",
      "dist/assets/index-D7A58E1A.js   142.10 kB │ gzip: 42.18 kB",
      "✓ built in 1.25s",
      "COMPILER CHECK PASSED: 0 errors, 0 warnings"
    ]
  },
  {
    title: "7. Session Completed",
    subtitleBn: "৭. কাজ সফলভাবে সমাপ্ত ও রিপোর্ট",
    subtitleEn: "7. Feature successfully implemented",
    banglaNarrative: "কার্ট পেজ ফিচারটি সফলভাবে তৈরি, মার্জ ও ভেরিফাই করা হয়েছে। এ সেশনে টোকেন খরচ, টুল কল কাউন্ট এবং সফলতার হার নিচে দেওয়া হলো।",
    englishNarrative: "Cart hook and UI are completely verified and committed. View total resource costs for this task below.",
    agentThought: "Task completed. Hook and components verified by build checklist. Standing by for next command.",
    activeFile: "Session Summary",
    codeSnippet: `Status: Success
Merged changes:
- Created: src/hooks/useCart.tsx
- Modified: src/app/cart/page.tsx
Vite build verification: Passed (0.00ms)`
  }
];

const TELEMETRY_SCENARIO: SimulationStep[] = [
  {
    title: "1. Developer Active Coding",
    subtitleBn: "১. আইওটি টেলিমেট্রি কোডিং",
    subtitleEn: "1. Coder modifying IoT sensor module",
    banglaNarrative: "আপনি 'src/lib/telemetry.ts' ফাইলে ফার্মের IoT সেন্সরের ডাটা ফেচ করার কোড লিখছেন। এজেন্ট পরিবর্তনগুলো লাইভ অবসার্ভ করছে।",
    englishNarrative: "You are editing the sensor telemetry API parser inside 'src/lib/telemetry.ts'. Agent is watching.",
    agentThought: "Observing edits inside src/lib/telemetry.ts. Developer adding temperature parsing function...",
    activeFile: "src/lib/telemetry.ts",
    codeSnippet: `export async function getSensorReading(id: string) {
  const res = await fetch(\`/api/sensors/\${id}\`);
  const data = await res.json();
  
  // Mapping temperature
  return {
    id,
    temp: data.temperature_celsius
  };
}`,
    highlightLine: 7,
    typingText: "temp: data.temperature_celsius"
  },
  {
    title: "2. Agent Schema Check",
    subtitleBn: "২. এপিআই ডাটা স্কিমা মিসম্যাচ ডিটেকশন",
    subtitleEn: "2. Detecting schema property warnings",
    banglaNarrative: "এজেন্ট প্রজেক্টের ব্যাকএন্ড স্কিমা চেক করে দেখলো যে এপিআই রেসপন্স-এ `temperature_celsius` নামের কোন ফিল্ড নেই, বরং ফিল্ডটির নাম `temp_c`। এজেন্ট অবজেক্ট প্রোপার্টি ওয়ার্নিং ডিটেক্ট করেছে।",
    englishNarrative: "Agent cross-references backend JSON responses and finds field mismatch. Real field is temp_c.",
    agentThought: "Property mismatch: 'temperature_celsius' does not exist in backend schema for Sensor. Actual parameter is 'temp_c'. Preparing diagnostic recommendation...",
    activeFile: "src/lib/telemetry.ts",
    codeSnippet: `export async function getSensorReading(id: string) {
  const res = await fetch(\`/api/sensors/\${id}\`);
  const data = await res.json();
  
  // Mismatch: temperature_celsius is actually temp_c
  return {
    id,
    temp: data.temperature_celsius
  };
}`,
    highlightLine: 7,
    toolCall: {
      name: "grep_search",
      args: "Query: 'interface Sensor', SearchPath: 'src/'",
      logs: [
        "[04:14:10] Scanning models and types...",
        "[04:14:11] Found in src/types/sensor.ts: line 12: temp_c: number;"
      ]
    }
  },
  {
    title: "3. Proposed Fallback Implementation Plan",
    subtitleBn: "৩. ফলব্যাক ম্যাপ ও এক্সেপশন হ্যান্ডলিং প্ল্যান",
    subtitleEn: "3. Proposing fallback parsing plan",
    banglaNarrative: "এজেন্ট ডাটা পার্সিং-এ ফলব্যাক (যেমন `data.temp_c || data.temperature_celsius`) এবং টাইমাউট এরর হ্যান্ডলিং যুক্ত করার প্ল্যান দিয়েছে। Approve Plan ক্লিক করুন।",
    englishNarrative: "Agent proposes to add fallback fields and wrap the fetch in a try-catch timeout handler. Click Approve Plan.",
    agentThought: "Plan proposed: [MODIFY] src/lib/telemetry.ts to support fallback mappings and network exception safety. Awaiting developer approval...",
    activeFile: "implementation_plan.md",
    codeSnippet: `# Plan: Robust Sensor Telemetry Parser
1. [MODIFY] Update src/lib/telemetry.ts.
2. Add check: temp: data.temp_c ?? data.temperature_celsius ?? 0
3. Wrap fetch request inside a 5000ms timeout Promise block.`,
    requiresUserAction: "plan"
  },
  {
    title: "4. Executing Code Correction Tool",
    subtitleBn: "৪. কোড সংশোধন টুল রান",
    subtitleEn: "4. Modifying code using replace_file_content",
    banglaNarrative: "এজেন্ট `replace_file_content` টুলের মাধ্যমে ফাইলে ট্রাই-ক্যাচ ও সেন্সর ফিল্ডগুলোর ডাবল-ফলব্যাক মেকানিজম যুক্ত করছে।",
    englishNarrative: "Agent executes replace_file_content to add network safety checks and fallback attributes.",
    agentThought: "Replacing block in src/lib/telemetry.ts with robust mapping and network fallback handling code...",
    activeFile: "src/lib/telemetry.ts",
    codeSnippet: `export async function getSensorReading(id: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(\`/api/sensors/\${id}\`, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    const data = await res.json();
    return {
      id,
      temp: data.temp_c ?? data.temperature_celsius ?? 0,
      humidity: data.humidity ?? 0
    };
  } catch (err) {
    console.error("Telemetry fetch failed, using fallback:", err);
    return { id, temp: 0, humidity: 0, error: true };
  }
}`,
    toolCall: {
      name: "replace_file_content",
      args: "TargetFile: 'src/lib/telemetry.ts', StartLine: 1, EndLine: 10",
      logs: [
        "[04:14:35] Replacing lines 1 to 10 in src/lib/telemetry.ts...",
        "[04:14:36] 18 lines replaced successfully."
      ]
    }
  },
  {
    title: "5. Code Diff Verification Staging",
    subtitleBn: "৫. বাগ ফিক্স কোড রিভিউ ডিফ",
    subtitleEn: "5. Bug fix diff staged for review",
    banglaNarrative: "এজেন্টের সংশোধিত কোড ডিফ ফর্মে এখানে প্রদর্শিত হচ্ছে। সবকিছু সঠিক মনে হলে প্রজেক্টে সেভ করতে Approve & Merge এ ক্লিক করুন।",
    englishNarrative: "Verify modified catch blocks and double-fallback parsing. Click Approve & Merge to commit the fix.",
    agentThought: "Telemetry parser robust fallback diff staged. Awaiting final developer confirmation...",
    activeFile: "src/lib/telemetry.ts",
    codeSnippet: `// diff rendering
-  const data = await res.json();
-  return { id, temp: data.temperature_celsius };
+  // Added try-catch and schema mapping check
+  const data = await res.json();
+  return { id, temp: data.temp_c ?? data.temperature_celsius ?? 0 };`,
    diffLines: [
      { type: "normal", content: "export async function getSensorReading(id: string) {" },
      { type: "deletion", content: "  const res = await fetch(`/api/sensors/${id}`);" },
      { type: "deletion", content: "  const data = await res.json();" },
      { type: "deletion", content: "  return { id, temp: data.temperature_celsius };" },
      { type: "addition", content: "  try {" },
      { type: "addition", content: "    const res = await fetch(`/api/sensors/${id}`);" },
      { type: "addition", content: "    const data = await res.json();" },
      { type: "addition", content: "    return { id, temp: data.temp_c ?? data.temperature_celsius ?? 0 };" },
      { type: "addition", content: "  } catch (e) { return { id, temp: 0, error: true }; }" },
      { type: "normal", content: "}" }
    ],
    requiresUserAction: "diff"
  },
  {
    title: "6. Running Verification Tests",
    subtitleBn: "৬. টেস্ট স্যুট রান ও ভেরিফিকেশন",
    subtitleEn: "6. Executing automated test suites",
    banglaNarrative: "এজেন্ট আপনার প্রজেক্টের টেস্ট ফাইল `tests/telemetry.test.ts` রান করছে। এপিআই এরর কেস এবং ডামি সেন্সর রিডিং টেস্টগুলো পাস করেছে।",
    englishNarrative: "Agent triggers npm run test to check telemetry logic against mocked sensors.",
    agentThought: "Executing jest/vitest test suite on telemetry... Verification complete.",
    activeFile: "Terminal Output",
    codeSnippet: "",
    terminalLogs: [
      "$ npm run test tests/telemetry.test.ts",
      " RUNS  tests/telemetry.test.ts",
      " PASS  tests/telemetry.test.ts (1.182 s)",
      "  ✓ getSensorReading returns active mapping (82 ms)",
      "  ✓ getSensorReading resolves fallback when offline (12 ms)",
      "",
      "Test Files: 1 passed, 1 total",
      "Tests:       2 passed, 2 total",
      "Snapshots:   0 total",
      "Time:        1.85 s",
      "COMPILER AND JEST TESTS: ALL PASSED"
    ]
  },
  {
    title: "7. Session Completed",
    subtitleBn: "৭. সেশন সাকসেস রিপোর্ট",
    subtitleEn: "7. Telemetry diagnostics complete",
    banglaNarrative: "সেন্সর ডাটা রিডিং বাগটি সফলভাবে ফিক্স করা হয়েছে। মোট ৩টি ফাইল স্ক্যান করা হয়েছে এবং সেশনের সম্পূর্ণ ডাটা নিচে লোড করা হয়েছে।",
    englishNarrative: "Telemetry mapping resolved successfully. Pinned context file builds are updated.",
    agentThought: "Task completed. Sensor telemetry data mismatch resolved. Diagnostics idle.",
    activeFile: "Session Summary",
    codeSnippet: `Status: Bug Fixed
Verified tests: 2/2 passed
Token cost: $0.1540
Elapsed: 120s`
  }
];

export const DeveloperAgentCoWorkingSimulator: React.FC = () => {
  const [scenario, setScenario] = useState<"cart" | "telemetry">("cart");
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // multiplier: 1x, 2x, 5x
  const [planApproved, setPlanApproved] = useState(false);
  const [diffApproved, setDiffApproved] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);

  const steps = scenario === "cart" ? CART_SCENARIO : TELEMETRY_SCENARIO;
  const currentStep = steps[stepIndex];

  // Typing simulator effect
  useEffect(() => {
    setTypingIndex(0);
    setPlanApproved(false);
    setDiffApproved(false);
  }, [stepIndex, scenario]);

  useEffect(() => {
    if (currentStep.typingText && typingIndex < currentStep.typingText.length) {
      const delay = (100 / speed) * (Math.random() * 0.6 + 0.7);
      const timer = setTimeout(() => {
        setTypingIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [typingIndex, currentStep.typingText, speed]);

  // Autoplay step sequencer
  useEffect(() => {
    let intervalId: any;
    if (isPlaying) {
      // If user action is required, auto-pause
      const requiresAction = currentStep.requiresUserAction;
      const isPlanActionWaiting = requiresAction === "plan" && !planApproved;
      const isDiffActionWaiting = requiresAction === "diff" && !diffApproved;

      if (isPlanActionWaiting || isDiffActionWaiting) {
        setIsPlaying(false);
      } else {
        const stepDuration = (4200 / speed);
        intervalId = setInterval(() => {
          if (stepIndex < steps.length - 1) {
            setStepIndex(prev => prev + 1);
          } else {
            setIsPlaying(false);
          }
        }, stepDuration);
      }
    }
    return () => clearInterval(intervalId);
  }, [isPlaying, stepIndex, steps.length, currentStep.requiresUserAction, planApproved, diffApproved, speed]);

  const handleNext = () => {
    const requiresAction = currentStep.requiresUserAction;
    if (requiresAction === "plan" && !planApproved) {
      setPlanApproved(true);
      return;
    }
    if (requiresAction === "diff" && !diffApproved) {
      setDiffApproved(true);
      return;
    }
    if (stepIndex < steps.length - 1) {
      setStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setStepIndex(0);
    setPlanApproved(false);
    setDiffApproved(false);
    setIsPlaying(false);
    setTypingIndex(0);
  };

  const handleApprovePlan = () => {
    setPlanApproved(true);
    // Auto advance slightly faster after approval
    setTimeout(() => {
      if (stepIndex < steps.length - 1) {
        setStepIndex(prev => prev + 1);
        setIsPlaying(true);
      }
    }, 800);
  };

  const handleApproveDiff = () => {
    setDiffApproved(true);
    setTimeout(() => {
      if (stepIndex < steps.length - 1) {
        setStepIndex(prev => prev + 1);
        setIsPlaying(true);
      }
    }, 800);
  };

  const currentCodeToRender = () => {
    if (currentStep.typingText) {
      const codeBase = currentStep.codeSnippet.split("// Typing")[0];
      const typed = currentStep.typingText.slice(0, typingIndex);
      const isFinished = typingIndex >= currentStep.typingText.length;
      return (
        <>
          {codeBase}
          <span className="text-white border-b-2 border-white/50 animate-pulse">{typed}</span>
          {!isFinished && <span className="inline-block w-1.5 h-3 bg-white ml-0.5" />}
          {isFinished && "\n  \n  return (\n    <div className=\"p-6 bg-black/40\">\n      <h1 className=\"text-xl\">Your Agro Cart</h1>\n      <CartItemList items={items} />"}
        </>
      );
    }
    return currentStep.codeSnippet;
  };

  return (
    <div className="flex flex-col border border-white/[0.05] bg-[#09090b] p-5 rounded-3xl w-full text-left gap-4 select-none font-mono">
      
      {/* Simulation Header & Scenario Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.03] pb-3.5">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-450 animate-pulse" />
            <span className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-white" /> Developer-Agent Co-Working Simulator
            </span>
          </div>
          <span className="text-[8px] text-gray-550 font-mono">Simulating interactive human-in-the-loop task execution</span>
        </div>

        <div className="flex bg-[#050608] border border-white/5 p-1 rounded-xl gap-1 shrink-0">
          <button
            onClick={() => { setScenario("cart"); handleReset(); }}
            className={`px-3 py-1 text-[8.5px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
              scenario === "cart" 
                ? "bg-white/10 text-white border border-white/10" 
                : "text-gray-500 hover:text-gray-400 border border-transparent"
            }`}
          >
            Shopping Cart Page
          </button>
          <button
            onClick={() => { setScenario("telemetry"); handleReset(); }}
            className={`px-3 py-1 text-[8.5px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
              scenario === "telemetry" 
                ? "bg-white/10 text-white border border-white/10" 
                : "text-gray-500 hover:text-gray-400 border border-transparent"
            }`}
          >
            IoT Sensor Debug
          </button>
        </div>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-12 gap-4 items-stretch">
        
        {/* PANEL A: Developer Editor & Files (Columns 1-6) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col border border-white/[0.04] bg-[#050608] p-4 rounded-2xl gap-3">
          
          <div className="flex justify-between items-center border-b border-white/[0.02] pb-2 text-[9.5px]">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Code2 className="w-3.5 h-3.5 text-gray-500" />
              <span className="font-bold text-gray-300">Developer Workspace</span>
            </div>
            <span className="text-[7.5px] text-gray-600 bg-white/5 px-2 py-0.5 rounded font-mono">
              Status: {currentStep.typingText && typingIndex < currentStep.typingText.length ? "Typing..." : "Idle"}
            </span>
          </div>

          {/* Active File Tab Header */}
          <div className="flex items-center justify-between bg-[#0b0c10] border border-white/5 p-2 rounded-xl text-[8.5px]">
            <div className="flex items-center gap-1.5 text-gray-300">
              <FileCode className="w-3.5 h-3.5 text-white/60" />
              <span className="font-mono font-bold text-white">{currentStep.activeFile}</span>
            </div>
            <span className="text-[7.5px] text-gray-600 font-mono">active buffer</span>
          </div>

          {/* Code Editor Window */}
          <div className="flex-1 bg-[#030406] border border-white/[0.03] p-4 rounded-2xl min-h-[220px] max-h-[300px] overflow-y-auto font-mono text-[8.5px] leading-relaxed text-gray-400 flex select-text relative">
            
            {/* Blinking indicator overlay when typing */}
            {currentStep.typingText && typingIndex < currentStep.typingText.length && (
              <span className="absolute top-3 right-3 text-[7px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                Live Feed Sync
              </span>
            )}

            {/* Line Numbers */}
            <div className="text-gray-750 pr-3 border-r border-white/5 text-right flex flex-col select-none">
              {Array.from({ length: currentStep.diffLines ? currentStep.diffLines.length : 10 }).map((_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            
            {/* Source Code Content */}
            <div className="pl-3 w-full whitespace-pre font-mono text-left overflow-x-auto">
              {currentStep.diffLines ? (
                // Render Diff Lines
                currentStep.diffLines.map((line, index) => {
                  let cls = "text-gray-400";
                  let prefix = "  ";
                  if (line.type === "addition") {
                    cls = "text-emerald-400 bg-emerald-950/20 px-1 border-l-2 border-emerald-500";
                    prefix = "+ ";
                  } else if (line.type === "deletion") {
                    cls = "text-rose-400 bg-rose-950/20 px-1 border-l-2 border-rose-500 line-through";
                    prefix = "- ";
                  }
                  return (
                    <div key={index} className={`${cls} py-0.5`}>
                      {prefix}{line.content}
                    </div>
                  );
                })
              ) : (
                // Render normal code view
                currentCodeToRender()
              )}
            </div>
          </div>

        </div>

        {/* PANEL B: Agent Parallel Actions & Subtitles (Columns 7-12) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col border border-white/[0.04] bg-[#050608] p-4 rounded-2xl gap-3 justify-between">
          
          <div className="flex flex-col gap-3">
            
            <div className="flex justify-between items-center border-b border-white/[0.02] pb-2 text-[9.5px]">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Cpu className="w-3.5 h-3.5 text-gray-500" />
                <span className="font-bold text-gray-300">Co-Worker Agent Engine</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[7.5px] font-bold uppercase ${
                stepIndex === 6 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : "bg-amber-500/10 text-amber-400 animate-pulse"
              }`}>
                State: {currentStep.title.split(".")[1].trim()}
              </span>
            </div>

            {/* Agent Inner Thought Stream Bubble */}
            <div className="flex gap-2">
              <div className="w-5 h-5 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-gray-400">
                <Cpu className="w-3 h-3" />
              </div>
              <div className="flex-1 p-3 bg-[#0d0e12] border border-white/[0.04] rounded-2xl rounded-tl-none text-left">
                <span className="text-[7.5px] font-mono text-gray-500 uppercase tracking-widest font-bold block mb-1">
                  Agent Thinking Process
                </span>
                <p className="text-[9.5px] text-gray-300 font-mono leading-relaxed">
                  {currentStep.agentThought}
                </p>
              </div>
            </div>

            {/* Step-by-Step Render Cards */}
            <div className="mt-1">
              {/* Tool Execution Card */}
              {currentStep.toolCall && (
                <InteractiveToolCall
                  toolName={currentStep.toolCall.name}
                  argumentsText={currentStep.toolCall.args}
                  durationMs={850}
                  status={stepIndex > 3 ? "success" : "running"}
                  outputLogs={currentStep.toolCall.logs}
                />
              )}

              {/* Proposal Approval Dialog */}
              {currentStep.requiresUserAction === "plan" && (
                <div className="border border-white/10 bg-white/[0.01] p-3 rounded-2xl flex flex-col gap-2.5 text-left animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-1 text-[8.5px] font-bold text-white uppercase tracking-wider">
                    <span>Pending Decision: Approve Proposed Plan</span>
                    <span className="text-[7.5px] text-amber-400 font-bold">REQUIRED ACTION</span>
                  </div>
                  <p className="text-[9.5px] text-gray-400 leading-relaxed font-mono">
                    এজেন্ট কার্ট হুক জেনারেট এবং এডিটর মডিফায় করার জন্য আপনার অনুমতির অপেক্ষা করছে।
                  </p>
                  
                  <div className="flex gap-2 justify-end mt-1">
                    <button
                      onClick={handleReset}
                      className="px-3 py-1.5 text-[8px] font-bold uppercase bg-transparent text-gray-500 border border-white/5 rounded-lg hover:text-white transition-all cursor-pointer"
                    >
                      Reject Plan
                    </button>
                    <GlassButton
                      onClick={handleApprovePlan}
                      active={planApproved}
                      className="px-3.5 py-1.5 text-[8.5px] font-bold uppercase flex items-center gap-1"
                    >
                      {planApproved ? "Approved ✓" : "Approve Plan"}
                    </GlassButton>
                  </div>
                </div>
              )}

              {/* Staged Code Review Diff Approved Panel */}
              {currentStep.requiresUserAction === "diff" && (
                <div className="border border-white/10 bg-white/[0.01] p-3 rounded-2xl flex flex-col gap-2.5 text-left animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-1 text-[8.5px] font-bold text-white uppercase tracking-wider">
                    <span>Code Review Staged</span>
                    <span className="text-[7.5px] text-amber-450 font-bold">AWAITING APPROVAL</span>
                  </div>
                  <p className="text-[9.5px] text-gray-400 leading-relaxed font-mono">
                    কোড ডিফটি রিভিউ করুন। সঠিক থাকলে মার্জ রিকোয়েস্ট Approve করুন।
                  </p>

                  <div className="flex gap-2 justify-end mt-1">
                    <button
                      onClick={handleReset}
                      className="px-3 py-1.5 text-[8px] font-bold uppercase bg-transparent text-gray-500 border border-white/5 rounded-lg hover:text-white transition-all cursor-pointer"
                    >
                      Reject Changes
                    </button>
                    <GlassButton
                      onClick={handleApproveDiff}
                      active={diffApproved}
                      className="px-3.5 py-1.5 text-[8.5px] font-bold uppercase flex items-center gap-1"
                    >
                      {diffApproved ? "Merged ✓" : "Approve & Merge"}
                    </GlassButton>
                  </div>
                </div>
              )}

              {/* Terminal Execution output logs */}
              {currentStep.terminalLogs && (
                <div className="border border-white/[0.04] bg-black/60 rounded-xl p-3 text-[7.5px] font-mono text-gray-400 flex flex-col gap-1 leading-relaxed max-h-[140px] overflow-y-auto">
                  <div className="flex items-center gap-1.5 text-gray-550 border-b border-white/[0.02] pb-1 mb-1 font-bold uppercase tracking-wider select-none">
                    <Terminal className="w-3.5 h-3.5" /> Diagnostics Live Build Terminal
                  </div>
                  {currentStep.terminalLogs.map((log, idx) => (
                    <div key={idx} className={log.includes("COMPILER CHECK") || log.includes("PASS") ? "text-emerald-400 font-bold" : ""}>
                      {log}
                    </div>
                  ))}
                </div>
              )}

              {/* End Summary Panel */}
              {stepIndex === 6 && (
                <div className="border border-white/[0.03] bg-white/[0.01] p-3 rounded-2xl">
                  <SessionSummaryMetrics
                    inputTokens={34200}
                    outputTokens={9800}
                    costUsd={scenario === "cart" ? 0.1804 : 0.1540}
                    elapsedTimeMs={scenario === "cart" ? 185000 : 120000}
                    toolCallsCount={scenario === "cart" ? 5 : 3}
                    successRate={100}
                  />
                </div>
              )}

            </div>

          </div>

          {/* Bengali Subtitles / Explanation Banner */}
          <div className="border border-white/[0.04] bg-black/35 p-3 rounded-xl flex flex-col gap-1 text-left mt-2">
            <span className="text-[7.5px] font-bold text-gray-550 uppercase tracking-widest border-b border-white/[0.02] pb-1 mb-1 block">
              💡 Live Simulation Subtitles (দ্বিভাষিক সাবটাইটেল)
            </span>
            <p className="text-[10px] text-gray-300 font-sans leading-relaxed select-text font-semibold">
              {currentStep.banglaNarrative}
            </p>
            <p className="text-[9px] text-gray-500 font-sans leading-relaxed select-text">
              <span className="text-gray-450 font-bold mr-1">English:</span> {currentStep.englishNarrative}
            </p>
          </div>

        </div>

      </div>

      {/* Simulator Playback Control Console */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-[#050608] border border-white/[0.03] p-3 rounded-2xl gap-3">
        
        {/* Playback Buttons */}
        <div className="flex items-center gap-1.5 justify-center sm:justify-start">
          <button
            onClick={handlePrev}
            disabled={stepIndex === 0}
            className="p-1.5 border border-white/5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer disabled:opacity-40"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={
              (currentStep.requiresUserAction === "plan" && !planApproved) ||
              (currentStep.requiresUserAction === "diff" && !diffApproved) ||
              stepIndex === steps.length - 1
            }
            className={`px-3 py-1.5 border rounded-lg font-mono text-[9px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              isPlaying
                ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                : "border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-40"
            }`}
            title={isPlaying ? "Pause Simulation" : "Start Simulation"}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Play Simulation
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={
              stepIndex === steps.length - 1 &&
              (currentStep.requiresUserAction === "plan" ? planApproved : true) &&
              (currentStep.requiresUserAction === "diff" ? diffApproved : true)
            }
            className="p-1.5 border border-white/5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer disabled:opacity-40"
            title="Next Step / Approve Action"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 border border-white/5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[8.5px]"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        {/* Timeline Progress Bar Indicators */}
        <div className="flex-1 flex items-center gap-1.5 px-3">
          {steps.map((_, idx) => {
            let bgCls = "bg-white/10 border border-white/5";
            if (idx === stepIndex) {
              bgCls = "bg-white border border-white/20 scale-y-110";
            } else if (idx < stepIndex) {
              bgCls = "bg-white/40";
            }
            return (
              <div 
                key={idx}
                onClick={() => { setStepIndex(idx); setIsPlaying(false); }}
                className={`h-1.5 flex-1 rounded-full cursor-pointer transition-all duration-300 ${bgCls}`}
                title={`Jump to step ${idx + 1}`}
              />
            );
          })}
        </div>

        {/* Speed multiplier control slider */}
        <div className="flex items-center gap-2 justify-center shrink-0 text-[9px] font-bold text-gray-500 uppercase">
          <span>Speed:</span>
          <div className="flex bg-[#0b0c10] border border-white/5 p-0.5 rounded-lg gap-0.5">
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded text-[8px] transition-all cursor-pointer ${
                  speed === s 
                    ? "bg-white/10 text-white font-bold" 
                    : "text-gray-650 hover:text-gray-400"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
