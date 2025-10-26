import { useWriteContract, useReadContract, useAccount } from "wagmi";
import { parseEther } from "viem";

const MARKET_ADDRESS = import.meta.env.VITE_MARKET_ADDRESS as `0x${string}`;

const MARKET_ABI = [
  {
    inputs: [
      { name: "question", type: "string" },
      { name: "options", type: "string[]" },
      { name: "endTime", type: "uint64" },
      { name: "minBetAmount", type: "uint256" },
      { name: "maxBetAmount", type: "uint256" },
    ],
    name: "createMarket",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "newOracle", type: "address" },
    ],
    name: "changeOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "closeMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "winningOption", type: "uint8" },
    ],
    name: "settleMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "reason", type: "string" },
    ],
    name: "cancelMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "getMarket",
    outputs: [
      { name: "creator", type: "address" },
      { name: "question", type: "string" },
      { name: "options", type: "string[]" },
      { name: "endTime", type: "uint64" },
      { name: "oracle", type: "address" },
      { name: "status", type: "uint8" },
      { name: "winningOption", type: "uint8" },
      { name: "totalPool", type: "uint256" },
      { name: "minBet", type: "uint256" },
      { name: "maxBet", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "getBettorCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserCreatedMarkets",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getActiveMarkets",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "marketCreationFee",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function usePredictionMarket() {
  const { writeContractAsync } = useWriteContract();

  const createMarket = async (
    question: string,
    options: string[],
    endTime: number,
    minBetETH: string,
    maxBetETH: string,
    creationFeeETH: string
  ) => {
    return await writeContractAsync({
      address: MARKET_ADDRESS,
      abi: MARKET_ABI,
      functionName: "createMarket",
      args: [
        question,
        options,
        BigInt(endTime),
        parseEther(minBetETH),
        parseEther(maxBetETH),
      ],
      value: parseEther(creationFeeETH),
    });
  };

  const changeOracle = async (marketId: number, newOracle: string) => {
    return await writeContractAsync({
      address: MARKET_ADDRESS,
      abi: MARKET_ABI,
      functionName: "changeOracle",
      args: [BigInt(marketId), newOracle as `0x${string}`],
    });
  };

  const closeMarket = async (marketId: number) => {
    return await writeContractAsync({
      address: MARKET_ADDRESS,
      abi: MARKET_ABI,
      functionName: "closeMarket",
      args: [BigInt(marketId)],
    });
  };

  const settleMarket = async (marketId: number, winningOption: number) => {
    return await writeContractAsync({
      address: MARKET_ADDRESS,
      abi: MARKET_ABI,
      functionName: "settleMarket",
      args: [BigInt(marketId), winningOption],
    });
  };

  const cancelMarket = async (marketId: number, reason: string) => {
    return await writeContractAsync({
      address: MARKET_ADDRESS,
      abi: MARKET_ABI,
      functionName: "cancelMarket",
      args: [BigInt(marketId), reason],
    });
  };

  return { createMarket, changeOracle, closeMarket, settleMarket, cancelMarket };
}

export function useMarket(marketId: number) {
  const { data, isLoading, refetch } = useReadContract({
    address: MARKET_ADDRESS,
    abi: MARKET_ABI,
    functionName: "getMarket",
    args: [BigInt(marketId)],
  });

  return {
    market: data
      ? {
          creator: data[0],
          question: data[1],
          options: data[2],
          endTime: data[3],
          oracle: data[4],
          status: data[5],
          winningOption: data[6],
          totalPool: data[7],
          minBet: data[8],
          maxBet: data[9],
        }
      : null,
    isLoading,
    refetch,
  };
}

export function useActiveMarkets() {
  const { data, isLoading, refetch } = useReadContract({
    address: MARKET_ADDRESS,
    abi: MARKET_ABI,
    functionName: "getActiveMarkets",
  });

  return { marketIds: (data as bigint[]) || [], isLoading, refetch };
}

export function useUserMarkets(userAddress?: string) {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  const { data, isLoading } = useReadContract({
    address: MARKET_ADDRESS,
    abi: MARKET_ABI,
    functionName: "getUserCreatedMarkets",
    args: targetAddress ? [targetAddress as `0x${string}`] : undefined,
  });

  return { marketIds: (data as bigint[]) || [], isLoading };
}

export function useBettorCount(marketId: number) {
  const { data, isLoading } = useReadContract({
    address: MARKET_ADDRESS,
    abi: MARKET_ABI,
    functionName: "getBettorCount",
    args: [BigInt(marketId)],
  });

  return { count: data || BigInt(0), isLoading };
}

export function useMarketCreationFee() {
  const { data, isLoading } = useReadContract({
    address: MARKET_ADDRESS,
    abi: MARKET_ABI,
    functionName: "marketCreationFee",
  });

  return { fee: data || BigInt(0), isLoading };
}
