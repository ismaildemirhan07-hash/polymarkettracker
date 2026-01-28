import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, Shield, Infinity as InfinityIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PricingPage() {
  const [showBanner, setShowBanner] = useState(true);

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

  const faqs = [
    {
      q: "Can I cancel anytime?",
      a: "Yes, you can cancel your subscription at any time from your account settings. There are no long-term commitments or cancellation fees."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit cards (Visa, Mastercard, Amex) as well as crypto payments in USDC and ETH via the Ethereum or Polygon networks."
    },
    {
      q: "Do you offer refunds?",
      a: "We offer a 7-day money-back guarantee for all new subscriptions. If you're not satisfied, just reach out to support within the first week."
    },
    {
      q: "Can I upgrade or downgrade?",
      a: "Absolutely. You can change your plan at any time. Upgrades take effect immediately with pro-rated billing, while downgrades apply at the end of your billing cycle."
    },
    {
      q: "Is my data private?",
      a: "Yes, your trading data and portfolio information are strictly private. We never sell your data to third parties or advertisers. Ever."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      <Header />
      
      {/* Special Offer Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 border-b border-primary/20 backdrop-blur-sm"
          >
            <div className="container mx-auto px-4 py-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 mx-auto font-medium text-foreground">
                <span className="text-base">🔥</span> 
                Launch Special: 50% off Pro for first 100 users 
                <span className="hidden sm:inline text-muted-foreground mx-1">•</span>
                <code className="bg-primary/20 px-2 py-0.5 rounded text-primary font-mono font-bold">Code: LAUNCH50</code>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 ml-4 hover:bg-black/10 dark:hover:bg-white/10"
                onClick={() => setShowBanner(false)}
              >
                <X className="size-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="flex-1 container mx-auto px-4 py-16 space-y-20">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/10 text-primary mb-2">
            Pricing Plans
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Simple, transparent pricing
          </h1>
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
              animate={{ opacity: 1, y: 0 }}
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

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-border">
                <AccordionTrigger className="text-left font-medium hover:text-primary transition-colors">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

      </main>
    </div>
  );
}
