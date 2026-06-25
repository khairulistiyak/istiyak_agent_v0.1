import React from "react";
import { Zap, Shield, Code, Cpu } from "lucide-react";

export const Features = () => {
  const list = [
    {
      icon: <Zap className="text-[#06b6d4]" />,
      title: "40-Step Execution Loop",
      desc: "Autonomously plans, writes, and self-corrects code files in multiple iterations without supervision."
    },
    {
      icon: <Code className="text-[#06b6d4]" />,
      title: "Workspace Watcher",
      desc: "Reacts instantly to new TODO comments, files edits, or local terminal compile error logs."
    },
    {
      icon: <Cpu className="text-[#06b6d4]" />,
      title: "BYOK & Billed Models",
      desc: "Integrate Vertex AI GCP, Gemini Studio, Anthropic Claude, OpenAI, or local Ollama endpoints."
    },
    {
      icon: <Shield className="text-[#06b6d4]" />,
      title: "Secured Sandboxing",
      desc: "Run terminal shell commands directly on your local machine or in secured cloud Docker instances."
    }
  ];

  return (
    <section className="py-20 bg-[#12141c] border-y border-white/5">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">Engineered for Velocity</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {list.map((f, i) => (
            <div key={i} className="p-6 bg-[#07080d] border border-white/5 rounded-xl hover:border-[#06b6d4]/30 transition-colors">
              <div className="mb-4">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2 text-sm">{f.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Features;
