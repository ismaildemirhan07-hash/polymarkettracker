import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

// Mock History Data
const HISTORY_DATA = [
  { id: '1', market: 'Will Bitcoin hit $110k?', result: 'WON', pnl: 450.00, date: '2024-12-15', category: 'Crypto', roi: 45 },
  { id: '2', market: 'NYC White Christmas?', result: 'LOST', pnl: -200.00, date: '2024-12-25', category: 'Weather', roi: -100 },
  { id: '3', market: 'Chiefs win Super Bowl?', result: 'WON', pnl: 1200.00, date: '2024-02-11', category: 'Sports', roi: 120 },
  { id: '4', market: 'Tesla Stock > $250?', result: 'WON', pnl: 150.50, date: '2024-11-30', category: 'Stocks', roi: 15 },
  { id: '5', market: 'S&P 500 ATH in Q4?', result: 'LOST', pnl: -500.00, date: '2024-12-31', category: 'Stocks', roi: -100 },
  { id: '6', market: 'Rain in London > 5mm?', result: 'WON', pnl: 80.00, date: '2024-10-05', category: 'Weather', roi: 40 },
];

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = HISTORY_DATA.filter(item => 
    item.market.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Bet History</h1>
            <p className="text-muted-foreground">Review your past performance and resolved positions.</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="size-4" /> Export CSV
          </Button>
        </div>

        <Card className="glass-card">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search markets..." 
                  className="pl-9" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                 <Button variant="outline" size="sm" className="gap-2">
                   <Filter className="size-4" /> Filter
                 </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Market</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="text-right">ROI</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.market}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal opacity-80">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(item.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge className={item.result === 'WON' ? 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-0' : 'bg-rose-500/15 text-rose-600 hover:bg-rose-500/25 border-0'}>
                        {item.result}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {item.roi > 0 ? '+' : ''}{item.roi}%
                    </TableCell>
                    <TableCell className={`text-right font-mono font-bold ${item.pnl > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.pnl > 0 ? '+' : '-'}${Math.abs(item.pnl).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
