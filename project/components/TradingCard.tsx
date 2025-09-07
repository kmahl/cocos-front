import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { DepositWithdrawModal } from "./DepositWithdrawModal";
import { BuySellModal } from "./BuySellModal";

export function TradingCard() {
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [buySellModalOpen, setBuySellModalOpen] = useState(false);
  const [buySellMode, setBuySellMode] = useState<'buy' | 'sell'>('buy');
  const [depositWithdrawMode, setDepositWithdrawMode] = useState<'deposit' | 'withdraw'>('deposit');

  const handleBuy = () => {
    setBuySellMode('buy');
    setBuySellModalOpen(true);
  };

  const handleSell = () => {
    setBuySellMode('sell');
    setBuySellModalOpen(true);
  };

  const handleDeposit = () => {
    setDepositWithdrawMode('deposit');
    setDepositModalOpen(true);
  };

  const handleWithdraw = () => {
    setDepositWithdrawMode('withdraw');
    setDepositModalOpen(true);
  };

  return (
    <>
      <Card className="w-full max-w-5xl mx-auto bg-card border border-border rounded-3xl shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Balance Section */}
              <div className="space-y-4">
                <h3 className="text-lg">Balance</h3>
                <div className="bg-muted rounded-xl p-4 space-y-2 border-2 border-gray-400">
                  <div className="flex justify-between">
                    <span className="text-sm">Total: xx</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Available: xx</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">reserved: xxx</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={handleDeposit}
                    >
                      Deposit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={handleWithdraw}
                    >
                      Withdraw
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    size="default" 
                    className="px-8"
                    onClick={handleBuy}
                  >
                    Buy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="default" 
                    className="px-8"
                    onClick={handleSell}
                  >
                    Sell
                  </Button>
                </div>
              </div>

              {/* Positions Section */}
              <div className="space-y-3">
                <h3 className="text-lg">Positions:</h3>
                <div className="bg-muted rounded-xl p-3 border-2 border-gray-400 min-h-[200px]">
                  {/* Position rows */}
                  {[1, 2, 3, 4].map((position) => (
                    <div key={position} className="bg-background rounded-lg p-3 mb-2 border border-gray-300">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div>Name</div>
                          <div>quantity</div>
                        </div>
                        <div>
                          <div>marketValue</div>
                          <div>totalReturnPercent</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <h3 className="text-lg">Order list</h3>
              <div className="bg-muted rounded-xl p-3 border-2 border-gray-400 min-h-[400px]">
                {/* Header */}
                <div className="grid grid-cols-5 gap-2 text-sm bg-background rounded-lg p-3 mb-2 border border-gray-300">
                  <div>Id Ticker</div>
                  <div>Type Side</div>
                  <div>Price: Size:</div>
                  <div>Status</div>
                  <div>Cancel</div>
                </div>
                
                {/* Order rows */}
                {[1, 2, 3, 4, 5, 6, 7].map((order) => (
                  <div key={order} className="grid grid-cols-5 gap-2 text-sm bg-background rounded-lg p-3 mb-2 border border-gray-300">
                    <div>Id Ticker</div>
                    <div>Type Side</div>
                    <div>Price: Size:</div>
                    <div>Status</div>
                    <div>
                      <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DepositWithdrawModal 
        open={depositModalOpen}
        onOpenChange={setDepositModalOpen}
        mode={depositWithdrawMode}
      />
      
      <BuySellModal 
        open={buySellModalOpen}
        onOpenChange={setBuySellModalOpen}
        mode={buySellMode}
      />
    </>
  );
}