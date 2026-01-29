import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link2, Loader2, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddBetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBetAdded?: () => void;
}

export function AddBetDialog({ open, onOpenChange, onBetAdded }: AddBetDialogProps) {
  const [activeTab, setActiveTab] = useState("polymarket");
  const [isLoading, setIsLoading] = useState(false);
  const [polymarketUrl, setPolymarketUrl] = useState("");
  const [marketData, setMarketData] = useState<any>(null);
  const { toast } = useToast();

  // Manual entry form state
  const [formData, setFormData] = useState({
    market: "",
    position: "YES",
    amount: "",
    shares: "",
    entryOdds: "",
    resolveDate: ""
  });

  const handlePolymarketUrlParse = async () => {
    if (!polymarketUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Polymarket URL",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/polymarket/parse-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: polymarketUrl })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to parse URL');
      }

      setMarketData(result.data);
      toast({
        title: "Market Found!",
        description: result.data.question
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to parse Polymarket URL",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBet = async () => {
    setIsLoading(true);
    try {
      let betData;

      if (activeTab === "polymarket" && marketData) {
        // Create bet from Polymarket data
        betData = {
          market: marketData.question,
          position: formData.position,
          amount: parseFloat(formData.amount),
          shares: parseFloat(formData.shares),
          entryOdds: formData.position === "YES" ? marketData.yesPrice : marketData.noPrice,
          resolveDate: marketData.endDate,
          polymarketId: marketData.marketId
        };
      } else {
        // Create bet from manual entry
        betData = {
          market: formData.market,
          position: formData.position,
          amount: parseFloat(formData.amount),
          shares: parseFloat(formData.shares),
          entryOdds: parseFloat(formData.entryOdds),
          resolveDate: formData.resolveDate
        };
      }

      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(betData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create bet');
      }

      toast({
        title: "Bet Created!",
        description: "Your bet is now being tracked"
      });

      // Reset form
      setPolymarketUrl("");
      setMarketData(null);
      setFormData({
        market: "",
        position: "YES",
        amount: "",
        shares: "",
        entryOdds: "",
        resolveDate: ""
      });

      onOpenChange(false);
      onBetAdded?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create bet",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="size-5" />
            Add New Bet
          </DialogTitle>
          <DialogDescription>
            Import from Polymarket or manually enter bet details
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="polymarket">
              <Link2 className="size-4 mr-2" />
              From Polymarket
            </TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="polymarket" className="space-y-4 mt-4">
            {/* Polymarket URL Input */}
            <div className="space-y-2">
              <Label htmlFor="polymarket-url">Polymarket URL</Label>
              <div className="flex gap-2">
                <Input
                  id="polymarket-url"
                  placeholder="https://polymarket.com/event/..."
                  value={polymarketUrl}
                  onChange={(e) => setPolymarketUrl(e.target.value)}
                  disabled={isLoading}
                />
                <Button 
                  onClick={handlePolymarketUrlParse}
                  disabled={isLoading || !polymarketUrl.trim()}
                >
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Parse"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste a Polymarket market URL to auto-fill details
              </p>
            </div>

            {/* Market Preview */}
            {marketData && (
              <div className="rounded-lg border bg-card p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium">Market</p>
                  <p className="text-sm text-muted-foreground">{marketData.question}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">YES Price</p>
                    <p className="text-lg font-bold text-green-500">{(marketData.yesPrice * 100).toFixed(1)}¢</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">NO Price</p>
                    <p className="text-lg font-bold text-red-500">{(marketData.noPrice * 100).toFixed(1)}¢</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ends</p>
                  <p className="text-sm">{new Date(marketData.endDate).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            {/* Position Details */}
            {marketData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) => setFormData({ ...formData, position: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YES">YES</SelectItem>
                        <SelectItem value="NO">NO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="200"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shares">Number of Shares</Label>
                  <Input
                    id="shares"
                    type="number"
                    placeholder="400"
                    value={formData.shares}
                    onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleCreateBet}
                  disabled={isLoading || !formData.amount || !formData.shares}
                >
                  {isLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                  Create Bet
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="manual-market">Market Question</Label>
              <Input
                id="manual-market"
                placeholder="Will Bitcoin hit $110,000 before Feb 1?"
                value={formData.market}
                onChange={(e) => setFormData({ ...formData, market: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manual-position">Position</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YES">YES</SelectItem>
                    <SelectItem value="NO">NO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-amount">Amount ($)</Label>
                <Input
                  id="manual-amount"
                  type="number"
                  placeholder="200"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manual-shares">Shares</Label>
                <Input
                  id="manual-shares"
                  type="number"
                  placeholder="400"
                  value={formData.shares}
                  onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-odds">Entry Odds</Label>
                <Input
                  id="manual-odds"
                  type="number"
                  step="0.01"
                  placeholder="0.50"
                  value={formData.entryOdds}
                  onChange={(e) => setFormData({ ...formData, entryOdds: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-date">Resolve Date</Label>
              <Input
                id="manual-date"
                type="date"
                value={formData.resolveDate}
                onChange={(e) => setFormData({ ...formData, resolveDate: e.target.value })}
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleCreateBet}
              disabled={isLoading || !formData.market || !formData.amount}
            >
              {isLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Create Bet
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
