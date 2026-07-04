"use client";

import { useState } from "react";
import { Bot, Download, Check, Menu, X, Star, User } from "lucide-react";
import Hero from "../components/Hero";
import Features from "../components/Features";
import CheckoutButton from "../components/CheckoutButton";
import CookieConsent from "../components/CookieConsent";
import ComparisonTable from "../components/ComparisonTable";
import AnimatedSection, { AnimatedSectionStagger } from "../components/AnimatedSection";
import InteractiveDemo from "../components/InteractiveDemo";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#030303] text-gray-400 font-sans antialiased selection:bg-[#06b6d4]/20 selection:text-white pb-20">
      
      {/* Premium Ambient Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#06b6d4]/10 blur-[120px]" />
      </div>

      {/* Floating Glass-Pill Navigation Header */}
      <div className="fixed top-6 left-0 right-0 z-50 px-4">
        <header className="max-w-4xl mx-auto bg-white/[0.01] backdrop-blur-xl border border-white/5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <nav className="flex justify-between items-center px-6 py-2.5">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer group">
              <Bot size={20} className="text-[#06b6d4] group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-xs font-bold tracking-wider text-white font-mono">
                ISTIYAK COMPANION
              </span>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6 text-[11px] font-medium tracking-wide uppercase text-gray-500">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#demo" className="hover:text-white transition-colors">Demo</a>
              <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="#download" className="hover:text-white transition-colors">Download</a>
            </div>

            {/* Desktop CTA (Translucent glass-pill style) */}
            <div className="hidden md:flex items-center">
              <button 
                onClick={() => setModalOpen(true)} 
                className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/20 hover:bg-[#06b6d4]/20 hover:border-[#06b6d4]/30 active:scale-[0.98] transition-all duration-300"
              >
                Launch App
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden flex items-center text-white" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </nav>
        </header>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#030303]/95 backdrop-blur-xl border-b border-white/5 flex flex-col justify-center items-center p-6 gap-8 md:hidden">
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-md font-medium text-gray-300 hover:text-white">Features</a>
          <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="text-md font-medium text-gray-300 hover:text-white">Demo</a>
          <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-md font-medium text-gray-300 hover:text-white">Testimonials</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-md font-medium text-gray-300 hover:text-white">Pricing</a>
          <a href="#download" onClick={() => setMobileMenuOpen(false)} className="text-md font-medium text-gray-300 hover:text-white">Download</a>
          <button 
            onClick={() => { setModalOpen(true); setMobileMenuOpen(false); }} 
            className="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/20 hover:bg-[#06b6d4]/20 transition-all mt-4"
          >
            Launch App
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="pt-32">
        <Hero />
      </div>

      {/* Features Section */}
      <div id="features" className="relative">
        <Features />
      </div>

      {/* Product Demo Section */}
      <section id="demo" className="py-28 px-6 max-w-4xl mx-auto relative z-10">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-3 font-mono">
            Seamless Execution Loop
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto text-xs md:text-sm">
            Watch the autonomous agent loop plan, test, and write code alongside you.
          </p>
        </AnimatedSection>

        <AnimatedSection className="w-full">
          <InteractiveDemo />
        </AnimatedSection>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6 max-w-5xl mx-auto relative z-10">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-3 font-mono">
            Loved by Developers
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto text-xs md:text-sm">
            Hear what builders are saying about their new autonomous coding co-pilot.
          </p>
        </AnimatedSection>

        <AnimatedSectionStagger className="grid md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="flex flex-col justify-between p-6 rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300 group">
            <div className="space-y-3">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="fill-[#06b6d4] text-[#06b6d4] opacity-80" />
                ))}
              </div>
              <p className="text-gray-300 text-xs md:text-sm leading-relaxed italic">
                "The speed and autonomy of the agent loop are mind-blowing. It diagnosed an ESM import error that had been blocking my Next.js compile for hours and fixed it in 15 seconds."
              </p>
            </div>
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/5">
              <div className="w-8 h-8 rounded-full bg-[#06b6d4]/5 flex items-center justify-center border border-[#06b6d4]/10">
                <User size={14} className="text-[#06b6d4] opacity-80" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Rakibul Islam</h4>
                <p className="text-[10px] text-gray-500 font-mono">Full Stack Developer</p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col justify-between p-6 rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300 group">
            <div className="space-y-3">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="fill-[#06b6d4] text-[#06b6d4] opacity-80" />
                ))}
              </div>
              <p className="text-gray-300 text-xs md:text-sm leading-relaxed italic">
                "Since having Istiyak Companion float alongside my editor, I delegate all unit testing and boilerplate writing to it. The $19/mo Pro license pays for itself on day one."
              </p>
            </div>
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/5">
              <div className="w-8 h-8 rounded-full bg-[#06b6d4]/5 flex items-center justify-center border border-[#06b6d4]/10">
                <User size={14} className="text-[#06b6d4] opacity-80" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Tanvir Ahmed</h4>
                <p className="text-[10px] text-gray-500 font-mono">Lead Software Engineer</p>
              </div>
            </div>
          </div>
        </AnimatedSectionStagger>
      </section>

      {/* Pricing Cards */}
      <section id="pricing" className="py-20 px-6 max-w-4xl mx-auto relative z-10">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-3 font-mono">
            Value-Driven Pricing
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto text-xs md:text-sm">
            Choose the plan that fits your engineering speed. Start free.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6 items-stretch max-w-3xl mx-auto">
          {/* Free Tier */}
          <AnimatedSection className="p-8 rounded-2xl border border-white/[0.03] bg-white/[0.01] backdrop-blur-xl flex flex-col justify-between hover:border-white/10 transition-all duration-300">
            <div>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Free Tier</span>
              <div className="flex items-baseline gap-1 my-3">
                <span className="text-3xl md:text-4xl font-extrabold text-white">$0</span>
                <span className="text-xs text-gray-500">/ forever</span>
              </div>
              <p className="text-gray-400 text-xs mb-6 leading-relaxed">
                Perfect for hobbyists and developers wanting to test autonomous coding locally.
              </p>
              <ul className="space-y-3 text-xs text-gray-300">
                <li className="flex items-center gap-2.5"><Check size={14} className="text-[#34d399] shrink-0" /> Basic Chat Interface</li>
                <li className="flex items-center gap-2.5"><Check size={14} className="text-[#34d399] shrink-0" /> Standard open-source models</li>
                <li className="flex items-center gap-2.5"><Check size={14} className="text-[#34d399] shrink-0" /> Local API Keys support (BYOK)</li>
                <li className="flex items-center gap-2.5"><Check size={14} className="text-[#34d399] shrink-0" /> Strict daily request limits</li>
              </ul>
            </div>
            <button 
              onClick={() => setModalOpen(true)} 
              className="w-full mt-8 py-2.5 rounded-full border border-white/5 hover:border-white/15 text-[10px] tracking-wider uppercase font-bold text-white bg-white/[0.02] hover:bg-white/[0.05] transition-all active:scale-[0.98]"
            >
              GET STARTED
            </button>
          </AnimatedSection>

          {/* Pro Tier */}
          <AnimatedSection className="p-8 rounded-2xl border border-[#06b6d4]/20 bg-white/[0.01] backdrop-blur-xl flex flex-col justify-between hover:border-[#06b6d4]/40 transition-all duration-300 relative">
            <div className="absolute top-4 right-4 bg-[#06b6d4]/5 border border-[#06b6d4]/20 rounded-full px-2.5 py-0.5 text-[8px] font-bold tracking-widest text-[#06b6d4] uppercase font-mono">
              POPULAR
            </div>
            <div>
              <span className="text-[9px] font-bold text-[#06b6d4] uppercase tracking-widest font-mono">PRO DEVELOPER</span>
              <div className="flex items-baseline gap-1 my-3">
                <span className="text-3xl md:text-4xl font-extrabold text-white">$19</span>
                <span className="text-xs text-gray-400 font-mono">/ month</span>
              </div>
              <p className="text-gray-400 text-xs mb-6 leading-relaxed">
                For professional engineers needing speed, sandbox execution, and raw agent intelligence.
              </p>
              <ul className="space-y-3 text-xs text-gray-200">
                <li className="flex items-center gap-2.5"><Check size={14} className="text-[#06b6d4] shrink-0" /> Premium Models (Gemini 2.5 Pro / Sonnet)</li>
                <li className="flex items-center gap-2.5"><Check size={14} className="text-[#06b6d4] shrink-0" /> 40-Step Autonomous Loops</li>
                <li className="flex items-center gap-2.5"><Check size={14} className="text-[#06b6d4] shrink-0" /> Multi-file codebase refactoring</li>
                <li className="flex items-center gap-2.5"><Check size={14} className="text-[#06b6d4] shrink-0" /> Unlimited local model support</li>
                <li className="flex items-center gap-2.5"><Check size={14} className="text-[#06b6d4] shrink-0" /> Custom Docker sandbox executions</li>
              </ul>
            </div>
            <div className="mt-8">
              <CheckoutButton />
            </div>
          </AnimatedSection>
        </div>

        {/* Detailed Comparison Table */}
        <AnimatedSection className="mt-16 overflow-x-auto rounded-xl border border-white/[0.03]">
          <div className="bg-white/[0.01] backdrop-blur-xl rounded-xl p-6 min-w-[500px]">
            <h3 className="text-sm font-bold text-white mb-4 font-mono">
              Feature Matrix
            </h3>
            <table className="w-full text-left border-collapse text-xs text-gray-300">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 font-medium">
                  <th className="py-3 px-2">Feature</th>
                  <th className="py-3 px-2">Free</th>
                  <th className="py-3 px-2 text-[#06b6d4]">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                <tr>
                  <td className="py-3 px-2 font-medium text-white">Autonomous Coding Loops</td>
                  <td className="py-3 px-2 text-gray-400">Up to 10 steps</td>
                  <td className="py-3 px-2 text-[#34d399] font-medium">Up to 40 steps</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 font-medium text-white">Premium AI Models</td>
                  <td className="py-3 px-2 text-gray-400">❌ (BYOK only)</td>
                  <td className="py-3 px-2 text-[#34d399] font-medium">Gemini 2.5 Pro / Sonnet</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 font-medium text-white">Multi-file operations</td>
                  <td className="py-3 px-2 text-gray-400">Single-file scope</td>
                  <td className="py-3 px-2 text-[#34d399] font-medium">Project-wide scope</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 font-medium text-white">Secure Sandbox runs</td>
                  <td className="py-3 px-2 text-gray-400">Local execution</td>
                  <td className="py-3 px-2 text-[#34d399] font-medium">Dockerized container runs</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 font-medium text-white">Developer Support</td>
                  <td className="py-3 px-2 text-gray-400">Community Discord</td>
                  <td className="py-3 px-2 text-[#34d399] font-medium">Priority support (24h SLA)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </AnimatedSection>
      </section>

      {/* Competitor Comparison Component */}
      <section className="py-8 relative z-10">
        <ComparisonTable />
      </section>

      {/* Download Section */}
      <section id="download" className="py-20 px-6 max-w-3xl mx-auto relative z-10">
        <AnimatedSection className="p-8 md:p-10 rounded-2xl border border-white/[0.03] bg-white/[0.01] backdrop-blur-xl text-center space-y-6 relative overflow-hidden group">
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#06b6d4]/5 blur-[60px] pointer-events-none" />
          
          <h2 className="text-2xl font-extrabold tracking-tight text-white font-mono">
            Get Istiyak Companion
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto text-xs leading-relaxed">
            Available for macOS (Apple Silicon & Intel), Windows 10/11, and Linux. Builds are securely compiled on GitHub release pipelines.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button className="px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-black bg-[#06b6d4] hover:bg-[#08d1f2] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-[0.98] transition-all duration-300">
              <Download size={12} className="inline mr-1" /> macOS (.DMG)
            </button>
            <button className="px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-[0.98] transition-all">
              <Download size={12} className="inline mr-1" /> Windows (.EXE)
            </button>
            <button className="px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:scale-[0.98] transition-all">
              <Download size={12} className="inline mr-1" /> Linux (.AppImage)
            </button>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-[10px] text-gray-500 relative z-10 max-w-5xl mx-auto px-6">
        <p className="font-mono">
          © {new Date().getFullYear()} ISTIYAK AI Companion. All rights reserved. Built with Tauri, React & Node.js.
        </p>
      </footer>

      {/* Modal (Translucent Zen Upgrade Box) */}
      {modalOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-[#030712]/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-sm bg-[#12141c] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              onClick={() => setModalOpen(false)}
            >
              <X size={16} />
            </button>

            <div className="w-10 h-10 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/20 flex items-center justify-center">
              <Bot size={20} className="text-[#06b6d4]" />
            </div>
            
            <div className="text-center">
              <h3 className="text-sm font-bold text-white mb-1 font-mono">
                How to Upgrade to Pro
              </h3>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                To purchase or manage your Pro license subscription securely, please complete these steps:
              </p>
            </div>

            <ol className="w-full text-[10px] text-gray-300 space-y-2.5 decimal list-inside bg-white/[0.01] border border-white/5 p-4 rounded-xl">
              <li className="leading-relaxed">Download the <strong className="text-white">Istiyak Companion</strong> desktop application.</li>
              <li className="leading-relaxed">Install and launch the app on your developer machine.</li>
              <li className="leading-relaxed">Log in or register your account via the client.</li>
              <li className="leading-relaxed">Open your Profile Card and click <strong className="text-[#06b6d4]">Upgrade to Pro</strong>.</li>
            </ol>

            <a href="#download" onClick={() => setModalOpen(false)} className="w-full">
              <button className="w-full py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-black bg-[#06b6d4] hover:bg-[#08d1f2] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all">
                <Download size={12} /> Download Companion App
              </button>
            </a>
          </div>
        </div>
      )}

      <CookieConsent />
    </div>
  );
}
