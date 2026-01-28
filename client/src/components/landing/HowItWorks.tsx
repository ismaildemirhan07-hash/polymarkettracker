import { motion } from "framer-motion";
import { ClipboardList, Activity, Zap, ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: "Add Your Bets",
      description: "Enter your Polymarket positions manually or connect your wallet. We automatically detect the bet type (crypto, weather, stocks, sports).",
      icon: <ClipboardList className="size-8 text-white" />,
      color: "from-blue-500 to-indigo-500"
    },
    {
      id: 2,
      title: "We Track Real-World Events",
      description: "Our system monitors live prices, weather conditions, sports scores, and stock movements from reliable APIs. Updates every 60 seconds.",
      icon: <Activity className="size-8 text-white" />,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      title: "Get Instant Insights",
      description: "See win/loss status, distance to threshold, and P&L in real-time. Get alerts when conditions change or you're close to winning.",
      icon: <Zap className="size-8 text-white" />,
      color: "from-amber-500 to-orange-500"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background pointer-events-none" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                How It Works
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Track your Polymarket bets with real-world data in 3 simple steps
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10 opacity-30" />

          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="relative"
            >
              {/* Arrow Connector (Desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 -right-4 z-0 text-muted-foreground/30 transform translate-x-1/2">
                  <ArrowRight size={24} />
                </div>
              )}

              <div className="glass-card group p-8 rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 h-full flex flex-col items-center text-center">
                
                {/* Icon Circle */}
                <div className={`size-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300 relative`}>
                   <div className="absolute -top-2 -right-2 size-6 rounded-full bg-background border border-border flex items-center justify-center text-xs font-bold font-mono shadow-sm">
                     {step.id}
                   </div>
                   {step.icon}
                </div>

                <h3 className="text-xl font-bold mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                
                {/* Decorative Elements */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
