import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WalletConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWalletConnected?: (address: string) => void;
}

export function WalletConnectDialog({ open, onOpenChange, onWalletConnected }: WalletConnectDialogProps) {
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    // Validate Ethereum address format
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum wallet address (0x...)",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Call sync API
      const response = await fetch('/api/wallet/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          walletAddress,
          userId: 'demo-user' // TODO: Get from auth
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to sync wallet');
      }

      toast({
        title: "Wallet Connected!",
        description: `Synced ${result.data.syncedPositions} positions from Polymarket`
      });

      onWalletConnected?.(walletAddress);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="size-5" />
            Connect Polymarket Account
          </DialogTitle>
          <DialogDescription>
            Enter your Polymarket wallet address to sync your positions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Info Section */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              📍 Where to find your wallet address?
            </h4>
            <ol className="text-xs text-muted-foreground space-y-1 ml-4 list-decimal">
              <li>Go to <a href="https://polymarket.com" target="_blank" rel="noopener" className="underline">polymarket.com</a></li>
              <li>Click your profile icon (top-right)</li>
              <li>Copy your wallet address (starts with "0x...")</li>
            </ol>
          </div>

          {/* Input Field */}
          <div className="space-y-2">
            <Label htmlFor="wallet">Wallet Address</Label>
            <Input
              id="wallet"
              placeholder="0x1234567890abcdef..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              ✅ Read-only access - completely safe
            </p>
          </div>

          {/* Example */}
          <div className="text-xs bg-secondary/50 p-3 rounded-md">
            <span className="font-semibold">Example:</span>
            <code className="ml-2 text-primary">0x1a2b3c4d5e6f7890abcdef...</code>
          </div>

          {/* Connect Button */}
          <Button 
            className="w-full" 
            onClick={handleConnect}
            disabled={isLoading || !walletAddress}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Syncing Positions...
              </>
            ) : (
              <>
                <Wallet className="size-4 mr-2" />
                Connect & Sync
              </>
            )}
          </Button>

          {/* Help Link */}
          <div className="text-center">
            <a 
              href="https://docs.polymarket.com" 
              target="_blank" 
              rel="noopener"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              Need help? View Polymarket docs
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
