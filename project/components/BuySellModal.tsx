import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { X } from "lucide-react";

interface BuySellModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'buy' | 'sell';
}

export function BuySellModal({ open, onOpenChange, mode }: BuySellModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader className="relative">
          <DialogTitle className="text-center">
            {mode.toUpperCase()}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === 'buy' ? 'Purchase cryptocurrency' : 'Sell cryptocurrency'}
          </DialogDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-6 w-6 p-0"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="instrument">Instrument</Label>
            <Select>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="--Selector--" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="btc">BTC</SelectItem>
                <SelectItem value="eth">ETH</SelectItem>
                <SelectItem value="ada">ADA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="side">Side</Label>
            <Select>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="--Selector--" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount-size">Amount or Size</Label>
            <Select>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="--Selector--" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="size">Size</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Enter value"
              className="rounded-lg"
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              className="flex-1 rounded-lg"
              onClick={() => onOpenChange(false)}
            >
              Confirm
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 rounded-lg"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}