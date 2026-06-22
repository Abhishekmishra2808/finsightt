import React, { useRef } from 'react';
import { Search, MapPin, PieChart, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';

interface LandingPageProps {
  onGetStarted: () => void;
  onViewChange?: (view: 'landing' | 'analyzer' | 'gst' | 'map' | 'defaulter') => void;
}

export default function LandingPage({ onGetStarted, onViewChange }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityBackground = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);

  return (
    <div ref={containerRef} className="bg-background relative">
      {/* Hero Section */}
      <div className="relative pt-32 pb-40 md:pt-40 md:pb-56 bg-background overflow-hidden border-b border-border/40">
        {/* Desktop Image - Right aligned, bleeds to edge */}
        <motion.div 
          className="absolute inset-y-0 right-0 w-full md:w-1/2 lg:w-[45%] hidden md:block"
          style={{ y: yBackground, opacity: opacityBackground }}
        >
           <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop")' }}
          >
            {/* Smooth fade gradients */}
            <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-background via-background/80 to-transparent z-10"></div>
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-10"></div>
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent z-10"></div>
          </div>
        </motion.div>
        
        {/* Mobile background image */}
        <motion.div 
          style={{ y: yBackground, opacity: opacityBackground }}
          className="absolute inset-0 md:hidden overflow-hidden" 
        >
           <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop")' }}
           >
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent"></div>
           </div>
        </motion.div>

        <div className="relative max-w-7xl mx-auto px-4 z-20">
          <motion.div style={{ y: yText }} className="max-w-2xl md:w-[60%] md:pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8 mt-4 md:mt-0 shadow-sm border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Enterprise-Grade Credit Intelligence
            </div>
            <h1 className="text-5xl md:text-7xl font-medium text-foreground tracking-tight mb-6 font-heading leading-tight">
              Smarter Decisions<br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Faster Underwriting.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 font-normal max-w-lg leading-relaxed">
              Accelerate commercial lending with AI-driven balance sheet parsing, real-time GST verification, and intelligent risk analysis.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <button 
                onClick={onGetStarted} 
                className="bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 flex items-center gap-2"
              >
                Launch Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="text-foreground font-semibold text-sm hover:bg-muted px-8 py-3.5 rounded-full transition-colors">
                Explore Features
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modern Cards Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Card 1: Balance Sheet */}
          <div className="group relative bg-card rounded-3xl border border-border/50 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <PieChart className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-3 font-heading">Balance Sheet Analysis</h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-1">
              Extract key metrics and generate AI projections from your financial statements instantly.
            </p>
            
            {/* Visual Element */}
            <div className="mb-6 p-4 pt-8 bg-muted/30 rounded-2xl border border-border/50">
              <div className="flex items-end justify-between gap-2 h-16">
                <div className="w-full bg-primary/20 rounded-t-lg h-[40%] relative group-hover:bg-primary/30 transition-colors"><div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-muted-foreground">'22</div></div>
                <div className="w-full bg-primary/40 rounded-t-lg h-[70%] relative group-hover:bg-primary/50 transition-colors"><div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-muted-foreground">'23</div></div>
                <div className="w-full bg-primary rounded-t-lg h-[100%] relative shadow-[0_0_15px_rgba(109,40,217,0.3)]"><div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-primary">'24</div></div>
              </div>
            </div>

            <button 
              onClick={() => onViewChange ? onViewChange('analyzer') : onGetStarted()} 
              className="w-full bg-foreground text-background hover:bg-primary hover:text-primary-foreground py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              Analyze Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Location */}
          <div className="group relative bg-card rounded-3xl border border-border/50 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-7 h-7 text-secondary" />
            </div>
            <h3 className="text-xl font-medium mb-3 font-heading">Satellite Map Viewer</h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-1">
              Enter coordinates to pinpoint locations instantly on an interactive standard or 3D satellite map.
            </p>
            
            {/* Visual Element */}
            <div className="mb-6 p-4 bg-muted/30 rounded-2xl border border-border/50 relative overflow-hidden h-28 flex items-center justify-center">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 bg-background/90 backdrop-blur-md px-3 py-2 rounded-full border shadow-sm">
                  <MapPin className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-[10px] font-semibold font-mono text-muted-foreground">28.6139° N, 77.2090° E</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => onViewChange ? onViewChange('map') : onGetStarted()} 
              className="w-full bg-foreground text-background hover:bg-secondary hover:text-secondary-foreground py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              Explore Map
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Verification */}
          <div className="group relative bg-card rounded-3xl border border-border/50 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Search className="w-7 h-7 text-accent" />
            </div>
            <h3 className="text-xl font-medium mb-3 font-heading">GST Verification</h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-1">
              Instantly verify business compliance, promoters, and filing history with a single click.
            </p>
            
            {/* Visual Element */}
            <div className="mb-6 p-4 bg-muted/30 rounded-2xl border border-border/50 h-28 flex flex-col justify-center">
              <div className="bg-background rounded-xl border p-2 flex items-center gap-2 shadow-sm mb-2">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <div className="h-1.5 w-16 bg-muted rounded-full"></div>
              </div>
              <div className="bg-background rounded-xl border p-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div className="w-full">
                    <div className="h-1.5 w-12 bg-foreground/20 rounded-full mb-1"></div>
                    <div className="h-1 w-8 bg-muted rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => onViewChange ? onViewChange('gst') : onGetStarted()} 
              className="w-full bg-foreground text-background hover:bg-accent hover:text-accent-foreground py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              Verify GSTIN
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 4: Defaulters */}
          <div className="group relative bg-card rounded-3xl border border-border/50 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <ShieldAlert className="w-7 h-7 text-destructive" />
            </div>
            <h3 className="text-xl font-medium mb-3 font-heading">Defaulter Verification</h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-1">
              Screen promoters and businesses against internal Supabase logs and RBI registries via live AI.
            </p>
            
            {/* Visual Element */}
            <div className="mb-6 p-4 bg-muted/30 rounded-2xl border border-border/50 h-28 flex flex-col justify-center relative overflow-hidden">
              <div className="bg-background rounded-xl border p-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-full">
                    <div className="h-1.5 w-16 bg-red-550/20 rounded-full mb-1"></div>
                    <div className="h-1 w-10 bg-muted/80 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => onViewChange ? onViewChange('defaulter') : onGetStarted()} 
              className="w-full bg-foreground text-background hover:bg-destructive hover:text-destructive-foreground py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              Search Defaulters
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
