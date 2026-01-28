import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ArrowRight, Activity, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

import PricingSection from "@/components/landing/PricingSection";
import HowItWorks from "@/components/landing/HowItWorks";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Activity className="size-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">PolyTrack</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            <ModeToggle />
            <Link href="/dashboard">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                  Live Event Tracking is Here
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
                  Track your prediction market <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">positions in real-time</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                  The professional dashboard for prediction market traders. Monitor crypto, sports, and weather events alongside your bet thresholds with live data feeds.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/dashboard">
                    <Button size="lg" className="h-12 px-8 text-base">
                      Start Tracking Free <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
              
              {/* Hero Image / Dashboard Preview */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative mt-12 w-full max-w-5xl mx-auto rounded-xl border border-border shadow-2xl overflow-hidden bg-card"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
                <img 
                  src="https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&q=80&w=2000" 
                  alt="Dashboard Preview" 
                  className="w-full h-auto object-cover opacity-80"
                />
                
                {/* Floating UI Elements Mockup */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center z-20 pointer-events-none">
                  <div className="bg-background/80 backdrop-blur-md border border-border rounded-lg p-6 shadow-xl max-w-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <TrendingUp size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Bitcoin {'>'} $100k</p>
                        <p className="text-lg font-bold text-foreground">$98,450.20</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs text-muted-foreground">
                         <span>Progress</span>
                         <span className="text-emerald-500 font-medium">98.4%</span>
                       </div>
                       <div className="h-2 bg-secondary rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 w-[98.4%]"></div>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-secondary/30">
          <div className="container px-4 mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need to trade smarter</h2>
              <p className="text-muted-foreground">Stop refreshing multiple tabs. Get all your market data and position tracking in one unified interface.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="size-6 text-yellow-500" />,
                  title: "Real-time Feeds",
                  description: "Direct connections to crypto exchanges, weather stations, and sports APIs for instant updates."
                },
                {
                  icon: <ShieldCheck className="size-6 text-emerald-500" />,
                  title: "Risk Management",
                  description: "Visual threshold tracking helps you know exactly when to exit a position or double down."
                },
                {
                  icon: <Activity className="size-6 text-primary" />,
                  title: "Performance Analytics",
                  description: "Deep dive into your trading history with win-rate analysis and P&L attribution."
                }
              ].map((feature, i) => (
                <div key={i} className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-shadow">
                  <div className="mb-4 p-3 bg-secondary rounded-xl w-fit">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <HowItWorks />

        {/* Pricing Section */}
        <PricingSection />
      </main>
      
      <footer className="py-8 border-t border-border mt-auto">
        <div className="container px-4 mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 PolyTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
