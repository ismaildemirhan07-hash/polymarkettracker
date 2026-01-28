import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingSection() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      description: "Essential tracking for casual traders",
      features: [
        "Track 3 active bets",
        "5-minute data updates",
        "Basic crypto/weather/stocks",
        "Email alerts (2/day)",
        "Community support"
      ],
      cta: "Get Started",
      highlight: false
    },
    {
      name: "Pro",
      price: "$19",
      description: "Power tools for serious bettors",
      features: [
        "Unlimited active bets",
        "60-second real-time updates",
        "All data sources included",
        "Push notifications & SMS",
        "Advanced analytics dashboard",
        "Priority email support"
      ],
      cta: "Upgrade to Pro",
      highlight: true
    },
    {
      name: "Premium",
      price: "$49",
      description: "Maximum speed for arbitrage",
      features: [
        "Everything in Pro",
        "15-second lightning updates",
        "API Access for bots",
        "Arbitrage opportunity alerts",
        "Dedicated account manager",
        "24/7 Priority support"
      ],
      cta: "Contact Sales",
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-20 md:py-32 bg-background relative overflow-hidden">
      <div className="container px-4 mx-auto">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your trading volume. Upgrade or downgrade at any time.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex"
            >
              <Card className={`glass-card flex flex-col w-full relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                tier.highlight ? 'border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20' : ''
              }`}>
                {tier.highlight && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground font-normal text-sm">/month</span>
                  </CardTitle>
                  <div className="mt-2">
                    <h3 className="font-bold text-xl">{tier.name}</h3>
                    <CardDescription>{tier.description}</CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 space-y-4">
                  <div className="h-px w-full bg-border/50" />
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="size-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className={`w-full ${tier.highlight ? 'bg-primary hover:bg-primary/90' : ''}`} 
                    variant={tier.highlight ? "default" : "outline"}
                    size="lg"
                  >
                    {tier.cta}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
