import { MarketCard } from "@/components/MarketCard";
import { Navbar } from "@/components/Navbar";
import { useActiveMarkets, useMarket } from "@/hooks/usePredictionMarket";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

const categorizeMarket = (question: string): string => {
  const q = question.toLowerCase();

  if (q.includes("bitcoin") || q.includes("ethereum") || q.includes("crypto") || q.includes("btc") || q.includes("eth")) {
    return "Crypto";
  }
  if (q.includes("ai") || q.includes("artificial") || q.includes("openai") || q.includes("anthropic") || q.includes("deepmind")) {
    return "Tech";
  }
  if (q.includes("fhe") || q.includes("encryption") || q.includes("zama") || q.includes("l2") || q.includes("layer") || q.includes("arbitrum") || q.includes("optimism")) {
    return "Tech";
  }
  if (q.includes("election") || q.includes("president") || q.includes("political")) {
    return "Politics";
  }
  if (q.includes("sport") || q.includes("football") || q.includes("basketball")) {
    return "Sports";
  }
  if (q.includes("stock") || q.includes("valuation") || q.includes("finance") || q.includes("economy")) {
    return "Finance";
  }
  if (q.includes("war") || q.includes("peace") || q.includes("geopolit")) {
    return "Geopolitics";
  }
  if (q.includes("movie") || q.includes("music") || q.includes("culture")) {
    return "Culture";
  }

  return "New";
};

const Home = () => {
  const { marketIds, isLoading } = useActiveMarkets();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  return (
    <div className="min-h-screen bg-background">
      <Navbar selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">ConcealMarket</h1>
            <p className="text-muted-foreground">
              Privacy-preserving prediction markets with FHE encryption
            </p>
          </div>
          <Link to="/create">
            <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Market
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 bg-muted/30 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : marketIds.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-4">No Active Markets</h2>
            <p className="text-muted-foreground mb-6">
              Be the first to create a prediction market!
            </p>
            <Link to="/create">
              <Button size="lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Market
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketIds.map((marketId) => (
              <MarketCardWrapper
                key={marketId.toString()}
                marketId={Number(marketId)}
                selectedCategory={selectedCategory}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const MarketCardWrapper = ({
  marketId,
  selectedCategory,
}: {
  marketId: number;
  selectedCategory: string;
}) => {
  const { market, isLoading } = useMarket(marketId);

  if (isLoading || !market) {
    return <div className="h-64 bg-muted/30 animate-pulse rounded-lg" />;
  }

  const category = categorizeMarket(market.question);

  if (selectedCategory !== "All" && category !== selectedCategory) {
    return null;
  }

  return (
    <MarketCard
      id={marketId.toString()}
      title={market.question}
      icon="🎲"
      category={category}
      endDate={new Date(Number(market.endTime) * 1000).toLocaleDateString()}
      volume={(Number(market.totalPool) / 1e18).toFixed(2) + " ETH"}
      status={market.status}
    />
  );
};

export default Home;
