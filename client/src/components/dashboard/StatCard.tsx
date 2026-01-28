import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
  icon: React.ReactNode;
  delay?: number;
}

export function StatCard({ title, value, trend, trendDirection, icon, delay = 0 }: StatCardProps) {
  const isPositive = trendDirection === 'up';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="glass-card overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="p-2 rounded-lg bg-secondary text-primary group-hover:bg-primary/10 transition-colors">
              {icon}
            </div>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-foreground tracking-tight">{value}</h3>
            
            {trend && (
              <div className={cn(
                "flex items-center text-xs font-medium",
                isPositive ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
              )}>
                {isPositive ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                <span>{trend}</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
