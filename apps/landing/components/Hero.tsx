

export const Hero = () => {
  return (
    <section className="relative text-center py-20 px-4 bg-gradient-to-b from-[#07080d] to-[#12141c]">
      <div className="max-w-4xl mx-auto space-y-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#06b6d4] bg-[#06b6d4]/10 rounded-full border border-[#06b6d4]/20 animate-pulse">
          ⚡ Version 0.1.0-MVP Now Live
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 leading-tight">
          Your Autonomous AI Software Engineer Companion
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          A lightweight, borderless floating companion that lives on your desktop. Monitors your files, runs tests, and builds features right inside your favorite editor.
        </p>
        <div className="flex justify-center gap-4">
          <button className="px-6 py-3 font-semibold rounded-lg bg-[#06b6d4] text-[#07080d] hover:opacity-90 transition-opacity">
            Download for Mac
          </button>
          <button className="px-6 py-3 font-semibold rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors">
            Get Pro Key
          </button>
        </div>
      </div>
    </section>
  );
};
export default Hero;
