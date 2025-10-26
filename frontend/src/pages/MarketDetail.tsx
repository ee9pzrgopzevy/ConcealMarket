import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Bookmark, Share2, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useMarket } from "@/hooks/usePredictionMarket";
import { useEncryptedBetting } from "@/hooks/useEncryptedBetting";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { formatEther } from "viem";

const MarketDetail = () => {
  const { id } = useParams();
  const marketId = Number(id);
  const { address } = useAccount();
  const { market, isLoading } = useMarket(marketId);
  const { placeBet, refundBet } = useEncryptedBetting();

  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [betAmount, setBetAmount] = useState("");
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const handlePlaceBet = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error("Please enter a valid bet amount");
      return;
    }

    if (!market) return;

    const amountWei = parseFloat(betAmount) * 1e18;
    const minBet = Number(market.minBet);
    const maxBet = Number(market.maxBet);

    if (amountWei < minBet) {
      toast.error(`Minimum bet is ${formatEther(BigInt(minBet))} ETH`);
      return;
    }

    if (amountWei > maxBet) {
      toast.error(`Maximum bet is ${formatEther(BigInt(maxBet))} ETH`);
      return;
    }

    try {
      setIsPlacingBet(true);
      const tx = await placeBet(marketId, selectedOption, betAmount);
      toast.success("Bet placed successfully! 🎉", {
        description: `Transaction: ${tx}`,
      });
      setBetAmount("");
    } catch (error: any) {
      console.error("Bet failed:", error);
      toast.error("Failed to place bet", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsPlacingBet(false);
    }
  };

  const handleRefund = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const tx = await refundBet(marketId);
      toast.success("Refund claimed successfully!", {
        description: `Transaction: ${tx}`,
      });
    } catch (error: any) {
      console.error("Refund failed:", error);
      toast.error("Failed to claim refund", {
        description: error.message || "Please try again",
      });
    }
  };

  const increaseAmount = (value: number) => {
    setBetAmount((prev) => {
      const current = parseFloat(prev || "0");
      return (current + value).toString();
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="h-96 bg-muted/30 animate-pulse rounded-lg" />
        </main>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Market Not Found</h2>
            <p className="text-muted-foreground mb-6">
              This market does not exist or has been removed.
            </p>
            <Link to="/">
              <Button>Back to Markets</Button>
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  const endDate = new Date(Number(market.endTime) * 1000);
  const isActive = market.status === 0; // Active
  const isCancelled = market.status === 3; // Cancelled
  const isSettled = market.status === 2; // Settled

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex items-start gap-4 mb-6">
              <div className="text-4xl">🎲</div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{market.question}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {(Number(market.totalPool) / 1e18).toFixed(4)} ETH Total Pool
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {endDate.toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-2">
                  {isActive && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-600">
                      Active
                    </span>
                  )}
                  {isCancelled && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-600">
                      Cancelled
                    </span>
                  )}
                  {isSettled && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-600">
                      Settled
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Market Details */}
            <Card className="p-6 mb-6">
              <h3 className="font-semibold mb-4">Market Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Creator</span>
                  <p className="font-mono text-xs mt-1">
                    {market.creator.slice(0, 6)}...{market.creator.slice(-4)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Oracle</span>
                  <p className="font-mono text-xs mt-1">
                    {market.oracle.slice(0, 6)}...{market.oracle.slice(-4)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Min Bet</span>
                  <p className="font-semibold mt-1">
                    {formatEther(BigInt(market.minBet))} ETH
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Max Bet</span>
                  <p className="font-semibold mt-1">
                    {formatEther(BigInt(market.maxBet))} ETH
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Market ID</span>
                  <p className="font-mono mt-1">#{marketId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">End Date</span>
                  <p className="mt-1">
                    {endDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Market Context */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Privacy Features</h3>
              <div className="prose max-w-none text-sm text-muted-foreground space-y-3">
                <p>
                  🔒 This market uses <strong>Zama FHE (Fully Homomorphic Encryption)</strong> to ensure complete privacy of your bets.
                </p>
                <p>
                  ✨ Your bet amount and option choice are encrypted on your device before being submitted to the blockchain.
                </p>
                <p>
                  🎯 No one (including the market creator) can see your bet details until the market is settled.
                </p>
                <p>
                  💰 Your encrypted bets are accumulated on-chain using FHE operations, allowing fair odds calculation without revealing individual positions.
                </p>
              </div>
            </Card>
          </div>

          {/* Betting Sidebar */}
          <div>
            <Card className="p-6 sticky top-20">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🎲</div>
                <div className="text-sm text-muted-foreground">
                  {endDate.toLocaleDateString()}
                </div>
              </div>

              {isCancelled ? (
                <div className="space-y-4">
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg text-center">
                    <p className="text-sm text-orange-600 font-semibold">
                      Market Cancelled
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Claim your refund if you placed a bet
                    </p>
                  </div>
                  <Button
                    className="w-full h-12"
                    size="lg"
                    onClick={handleRefund}
                  >
                    Claim Refund
                  </Button>
                </div>
              ) : isSettled ? (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
                  <p className="text-sm text-blue-600 font-semibold">
                    Market Settled
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Winning option: {market.options[market.winningOption]}
                  </p>
                </div>
              ) : !isActive ? (
                <div className="p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg text-center">
                  <p className="text-sm text-gray-600 font-semibold">
                    Betting Closed
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Waiting for settlement
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-3 block">
                      Select Your Prediction
                    </label>
                    <RadioGroup
                      value={selectedOption.toString()}
                      onValueChange={(v) => setSelectedOption(parseInt(v))}
                      className="space-y-2"
                    >
                      {market.options.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                        >
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                          <Label
                            htmlFor={`option-${index}`}
                            className="flex-1 cursor-pointer font-medium"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block">
                      Bet Amount (ETH)
                    </label>
                    <div className="relative mb-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-muted-foreground">
                        Ξ
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        className="pl-10 text-xl h-14 text-right"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => increaseAmount(0.1)}
                      >
                        +0.1
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => increaseAmount(0.5)}
                      >
                        +0.5
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => increaseAmount(1)}
                      >
                        +1.0
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setBetAmount(formatEther(BigInt(market.maxBet)))
                        }
                      >
                        Max
                      </Button>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 text-lg">🔐</span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-blue-600">
                          Encrypted Bet
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Your bet will be encrypted using FHE before submission
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12"
                    size="lg"
                    onClick={handlePlaceBet}
                    disabled={!address || isPlacingBet}
                  >
                    {isPlacingBet
                      ? "Placing Bet..."
                      : !address
                      ? "Connect Wallet to Bet"
                      : "Place Encrypted Bet"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground mt-4">
                    Your bet details remain private until market settlement
                  </p>
                </>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MarketDetail;
