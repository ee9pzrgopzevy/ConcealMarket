import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { usePredictionMarket, useMarketCreationFee } from "@/hooks/usePredictionMarket";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";

const CreateMarket = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { createMarket } = usePredictionMarket();
  const { fee } = useMarketCreationFee();

  const [date, setDate] = useState<Date>();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [minBet, setMinBet] = useState("0.01");
  const [maxBet, setMaxBet] = useState("10");
  const [isCreating, setIsCreating] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!question || !date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const validOptions = options.filter(opt => opt.trim() !== "");
    if (validOptions.length < 2) {
      toast.error("Please provide at least 2 options");
      return;
    }

    if (parseFloat(minBet) <= 0 || parseFloat(maxBet) < parseFloat(minBet)) {
      toast.error("Invalid bet limits");
      return;
    }

    try {
      setIsCreating(true);
      const endTime = Math.floor(date.getTime() / 1000);

      const tx = await createMarket(
        question,
        validOptions,
        endTime,
        minBet,
        maxBet,
        formatEther(fee)
      );

      toast.success("Market created successfully!");
      console.log("Transaction:", tx);

      setTimeout(() => navigate("/"), 2000);
    } catch (error: any) {
      console.error("Create market error:", error);
      toast.error(error?.message || "Failed to create market");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Create Prediction Market</h1>
          <p className="text-muted-foreground mb-8">
            Create a new prediction market with encrypted bets
          </p>

          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="question">Market Question *</Label>
                <Input
                  id="question"
                  placeholder="e.g., Will Bitcoin reach $100,000 by end of 2024?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Options * (2-10)</Label>
                <div className="space-y-3 mt-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                      />
                      {options.length > 2 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeOption(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {options.length < 10 && (
                    <Button
                      variant="outline"
                      onClick={addOption}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Option
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minBet">Min Bet (ETH) *</Label>
                  <Input
                    id="minBet"
                    type="number"
                    step="0.001"
                    placeholder="0.01"
                    value={minBet}
                    onChange={(e) => setMinBet(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="maxBet">Max Bet (ETH) *</Label>
                  <Input
                    id="maxBet"
                    type="number"
                    step="0.1"
                    placeholder="10"
                    value={maxBet}
                    onChange={(e) => setMaxBet(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label>Resolution Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-2"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Creation Fee</span>
                  <span className="font-semibold">{formatEther(fee)} ETH</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={isCreating || !address}
                  className="flex-1"
                >
                  {isCreating ? "Creating..." : "Create Market"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateMarket;
