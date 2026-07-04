import { Zap, Shield, Code, Cpu } from "lucide-react";

export const Features = () => {
  const list = [
    {
      icon: <Zap size={18} className="text-[#06b6d4] opacity-80" />,
      title: "40-Step Execution Loop",
      desc: "Autonomously plans, writes, and self-corrects code files in multiple iterations without supervision."
    },
    {
      icon: <Code size={18} className="text-[#06b6d4] opacity-80" />,
      title: "Workspace Watcher",
      desc: "Reacts instantly to new TODO comments, files edits, or local terminal compile error logs."
    },
    {
      icon: <Cpu size={18} className="text-[#06b6d4] opacity-80" />,
      title: "BYOK & Billed Models",
      desc: "Integrate Vertex AI GCP, Gemini Studio, Anthropic Claude, OpenAI, or local Ollama endpoints."
    },
    {
      icon: <Shield size={18} className="text-[#06b6d4] opacity-80" />,
      title: "Secured Sandboxing",
      desc: "Run terminal shell commands directly on your local machine or in secured cloud Docker instances."
    }
  ];

  return (
    <section className="py-24 bg-transparent border-y border-white/[0.03]">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-extrabold text-center mb-12 text-white font-mono tracking-tight">
          Engineered for Velocity
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {list.map((f, i) => (
            <div 
              key={i} 
              className="p-6 bg-white/[0.01] backdrop-blur-xl border border-white/[0.03] rounded-2xl hover:border-[#06b6d4]/20 hover:bg-white/[0.02] transition-all duration-300"
            >
              <div className="mb-4 w-8 h-8 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center">
                {f.icon}
              </div>
              <h3 className="font-semibold text-white mb-2 text-xs font-mono">{f.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
