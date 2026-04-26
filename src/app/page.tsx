"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ArrowRight, BarChart3, Zap, Shield, Sparkles, LineChart, Target, Command, TrendingUp } from "lucide-react";
import { InfiniteGridBackground } from "@/components/ui/infinite-grid";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { motion } from "framer-motion";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export default function LandingPage() {
  return (
    <div className={`min-h-screen bg-[#fafafa] text-slate-900 selection:bg-emerald-100 ${font.className}`}>
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 border-b border-neutral-200/50 bg-white/60 backdrop-blur-xl z-50 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/growthx-full-logo.png" alt="GrowthX" width={84} height={24} className="object-contain" priority />
          </Link>
          <div className="flex items-center gap-6 text-sm font-semibold text-slate-600">
            <Link href="/login" className="hover:text-slate-900 transition-colors">
              Log in
            </Link>
            <Link href="/register" className="relative group overflow-hidden rounded-full p-[1px]">
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#a7f3d0_0%,#10b981_50%,#a7f3d0_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="inline-flex h-full w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-white transition-all group-hover:bg-slate-800 backdrop-blur-3xl">
                Start for free
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <InfiniteGridBackground className="bg-[#fafafa]">
        <main className="pt-24 pb-20">
          {/* Hero Section */}
          <section className="pt-20 pb-24 md:pt-32 md:pb-32 max-w-5xl mx-auto px-6 text-center relative z-10 flex flex-col items-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white border border-neutral-200/80 text-slate-600 text-sm font-semibold shadow-sm"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              GrowthX AI is now in public beta
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="text-6xl md:text-[5.5rem] font-black tracking-tighter text-slate-900 mb-8 max-w-4xl mx-auto leading-[1.05]"
            >
              Intelligence for <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">modern e-commerce.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed font-medium"
            >
              Connect your store and let our AI agents analyze your data, detect anomalies, and generate precise strategies to scale your revenue.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
            >
              <Link href="/register" className="w-full sm:w-auto group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-slate-900 px-8 font-semibold text-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]">
                <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-emerald-500 rounded-full group-hover:w-56 group-hover:h-56"></span>
                <span className="relative flex items-center gap-2">Start your free trial <ArrowRight size={18} strokeWidth={2.5} /></span>
              </Link>
              <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-700 border border-neutral-200 px-8 h-14 rounded-full font-semibold hover:bg-neutral-50 transition-all active:scale-95 shadow-sm">
                Book a demo
              </Link>
            </motion.div>
          </section>

          {/* Premium Bento Grid Features */}
          <section className="max-w-6xl mx-auto px-6 pb-24 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">Everything you need to scale</h2>
              <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">We process the millions of data points so you can focus on building your brand.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Large Bento Card 1 */}
              <SpotlightCard className="col-span-1 md:col-span-2 p-8 md:p-10 flex flex-col justify-between min-h-[320px]">
                <div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                    <Sparkles size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Automated AI Insights</h3>
                  <p className="text-slate-500 leading-relaxed font-medium max-w-md">
                    Our AI monitors your store 24/7. It catches inventory drops, identifies traffic anomalies, and spots revenue opportunities before you even open your dashboard.
                  </p>
                </div>
                <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-neutral-100 flex items-center gap-4">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <p className="text-sm font-semibold text-slate-700">"Summer T-Shirt" conversion dropped by 15%. Recommend a 10% flash sale.</p>
                </div>
              </SpotlightCard>

              {/* Small Bento Card 1 */}
              <SpotlightCard className="col-span-1 p-8 md:p-10 flex flex-col justify-between min-h-[320px]">
                <div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
                    <LineChart size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">True Profitability</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">
                    Factor in COGS, shipping, and ad spend automatically. See your true net margin.
                  </p>
                </div>
                <div className="mt-8">
                  <div className="text-4xl font-black text-slate-900 tracking-tighter">$24.5k</div>
                  <div className="text-sm font-bold text-emerald-500 mt-1 flex items-center gap-1"><TrendingUp size={16} strokeWidth={2.5}/> +12.5% net profit</div>
                </div>
              </SpotlightCard>

              {/* Small Bento Card 2 */}
              <SpotlightCard className="col-span-1 p-8 md:p-10 flex flex-col justify-between min-h-[320px]">
                <div>
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 border border-purple-100">
                    <Command size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">One-Click Sync</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">
                    Connect your Shopify store securely. We handle the historical data sync in minutes.
                  </p>
                </div>
              </SpotlightCard>

              {/* Large Bento Card 2 */}
              <SpotlightCard className="col-span-1 md:col-span-2 p-8 md:p-10 flex flex-col justify-between min-h-[320px]">
                <div>
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 border border-orange-100">
                    <Target size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Predictive Analytics</h3>
                  <p className="text-slate-500 leading-relaxed font-medium max-w-md">
                    Forecast your inventory needs and cash flow with enterprise-grade machine learning models built specifically for DTC brands.
                  </p>
                </div>
                <div className="mt-8 flex gap-3">
                  {['SKU Velocity', 'LTV Prediction', 'Churn Risk'].map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-white border border-neutral-200 rounded-full text-xs font-bold text-slate-600 shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </SpotlightCard>

            </div>
          </section>

          {/* Final CTA */}
          <section className="py-24 text-center px-6 relative z-10 border-t border-neutral-200/50 mt-10">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6">Ready to grow your store?</h2>
            <p className="text-lg text-slate-500 font-medium mb-10 max-w-xl mx-auto">Join hundreds of modern merchants who use GrowthX to turn their raw data into predictable revenue.</p>
            <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-10 py-5 rounded-full text-lg font-bold hover:bg-slate-800 transition-all shadow-[0_0_40px_-10px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95">
              Start your free trial <ArrowRight size={20} strokeWidth={2.5} />
            </Link>
          </section>
        </main>
      </InfiniteGridBackground>
      
      {/* Footer */}
      <footer className="border-t border-neutral-200/50 bg-white py-12 text-center text-slate-500 font-medium text-sm relative z-20">
         <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 font-extrabold text-slate-900 text-lg tracking-tight">
              <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
              GrowthX
            </div>
            <p className="text-slate-400">© {new Date().getFullYear()} GrowthX AI. All rights reserved.</p>
            <div className="flex gap-6 font-semibold">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
            </div>
         </div>
      </footer>
    </div>
  );
}