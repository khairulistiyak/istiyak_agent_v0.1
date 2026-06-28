import { useGlobalStore } from "../../store/index.js";

export function Marketplace() {
  const isMarketplaceOpen = useGlobalStore((state) => state.isMarketplaceOpen);
  const setMarketplaceOpen = useGlobalStore((state) => state.setMarketplaceOpen);

  if (!isMarketplaceOpen) return null;

  const mockExtensions = [
    { name: "Docker Builder Helper", desc: "Adds commands to build, tag and push docker files easily." },
    { name: "Python Linting Checker", desc: "Automatic python syntax and code style error checker." }
  ];

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#12141c] border border-white/10 p-6 rounded-xl max-w-md w-full shadow-2xl relative">
        <button
          onClick={() => setMarketplaceOpen(false)}
          className="absolute top-4 right-4 text-white/50 hover:text-white text-sm"
        >
          ✕
        </button>
        <h2 className="text-white font-semibold text-lg mb-4">Extensions Marketplace</h2>
        <div className="space-y-3">
          {mockExtensions.map((ext, idx) => (
            <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-lg flex justify-between items-center text-xs">
              <div>
                <p className="text-white font-semibold">{ext.name}</p>
                <p className="text-white/50">{ext.desc}</p>
              </div>
              <button className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium">Install</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
