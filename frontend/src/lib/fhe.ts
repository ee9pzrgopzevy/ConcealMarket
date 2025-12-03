import { bytesToHex, getAddress } from "viem";
import type { Address } from "viem";

declare global {
    interface Window {
        RelayerSDK?: any;
        relayerSDK?: any;
        ethereum?: any;
        okxwallet?: any;
    }
}

let fheInstance: any = null;

const getSDK = () => {
    if (typeof window === "undefined") {
        throw new Error("FHE SDK requires a browser environment");
    }
    const sdk = window.RelayerSDK || window.relayerSDK;
    if (!sdk) {
        throw new Error("Relayer SDK not loaded. Ensure the CDN script tag is present.");
    }
    return sdk;
};

/**
 * Initialize FHE instance with Sepolia network configuration
 * Supports multiple wallet providers (MetaMask, OKX, Coinbase)
 */
export const initializeFHE = async (provider?: any) => {
    if (fheInstance) return fheInstance;
    if (typeof window === "undefined") {
        throw new Error("FHE SDK requires a browser environment");
    }

    const ethereumProvider =
        provider || window.ethereum || window.okxwallet?.provider || window.okxwallet;
    if (!ethereumProvider) {
        throw new Error("No wallet provider detected. Connect a wallet first.");
    }

    const sdk = getSDK();
    const { initSDK, createInstance, SepoliaConfig } = sdk;
    await initSDK();
    const config = { ...SepoliaConfig, network: ethereumProvider };
    fheInstance = await createInstance(config);
    return fheInstance;
};

const getInstance = async (provider?: any) => {
    if (fheInstance) return fheInstance;
    return initializeFHE(provider);
};

/**
 * Encrypt uint8 value (for option selection 0-255)
 * @param option - The option number to encrypt
 * @param contractAddress - The contract address
 * @param userAddress - The user's wallet address
 * @param provider - Optional ethereum provider
 */
export const encryptOption = async (
    option: number,
    contractAddress: string,
    userAddress: Address,
    provider?: any
): Promise<{
    handle: `0x${string}`;
    proof: `0x${string}`;
}> => {
    console.log('[FHE] Encrypting option:', option);
    const instance = await getInstance(provider);
    const contractAddr = getAddress(contractAddress);
    const userAddr = getAddress(userAddress);

    console.log('[FHE] Creating encrypted input for:', {
        contract: contractAddr,
        user: userAddr,
    });

    const input = instance.createEncryptedInput(contractAddr, userAddr);
    input.add8(option);  // euint8 for option

    console.log('[FHE] Encrypting input...');
    const { handles, inputProof } = await input.encrypt();
    console.log('[FHE] Encryption complete, handles:', handles.length);

    if (handles.length < 1) {
        throw new Error('FHE SDK returned insufficient handles');
    }

    return {
        handle: bytesToHex(handles[0]) as `0x${string}`,
        proof: bytesToHex(inputProof) as `0x${string}`,
    };
};

/**
 * Encrypt uint64 value (for bet amounts)
 * @param amount - The amount to encrypt (in wei as bigint)
 * @param contractAddress - The contract address
 * @param userAddress - The user's wallet address
 * @param provider - Optional ethereum provider
 */
export const encryptAmount = async (
    amount: bigint,
    contractAddress: string,
    userAddress: Address,
    provider?: any
): Promise<{
    handle: `0x${string}`;
    proof: `0x${string}`;
}> => {
    console.log('[FHE] Encrypting amount:', amount.toString());
    const instance = await getInstance(provider);
    const contractAddr = getAddress(contractAddress);
    const userAddr = getAddress(userAddress);

    const input = instance.createEncryptedInput(contractAddr, userAddr);
    input.add64(amount);  // euint64 for amount

    const { handles, inputProof } = await input.encrypt();

    if (handles.length < 1) {
        throw new Error('FHE SDK returned insufficient handles');
    }

    return {
        handle: bytesToHex(handles[0]) as `0x${string}`,
        proof: bytesToHex(inputProof) as `0x${string}`,
    };
};

/**
 * Encrypt both option and amount in single proof
 * This is more gas-efficient than two separate encryptions
 * @param option - The option number (0-9)
 * @param amountWei - The bet amount in wei
 * @param contractAddress - The contract address
 * @param userAddress - The user's wallet address
 * @param provider - Optional ethereum provider
 */
export const encryptBet = async (
    option: number,
    amountWei: bigint,
    contractAddress: string,
    userAddress: Address,
    provider?: any
): Promise<{
    optionHandle: `0x${string}`;
    amountHandle: `0x${string}`;
    proof: `0x${string}`;
}> => {
    console.log('[FHE] Encrypting bet - option:', option, 'amount:', amountWei.toString());
    const instance = await getInstance(provider);
    const contractAddr = getAddress(contractAddress);
    const userAddr = getAddress(userAddress);

    console.log('[FHE] Creating encrypted input for:', {
        contract: contractAddr,
        user: userAddr,
    });

    const input = instance.createEncryptedInput(contractAddr, userAddr);
    input.add8(option);    // euint8 for option
    input.add64(amountWei); // euint64 for amount

    console.log('[FHE] Encrypting input...');
    const { handles, inputProof } = await input.encrypt();
    console.log('[FHE] Encryption complete, handles:', handles.length);

    if (handles.length < 2) {
        throw new Error('FHE SDK returned insufficient handles');
    }

    return {
        optionHandle: bytesToHex(handles[0]) as `0x${string}`,
        amountHandle: bytesToHex(handles[1]) as `0x${string}`,
        proof: bytesToHex(inputProof) as `0x${string}`,
    };
};

/**
 * Check if FHE SDK is loaded and ready
 */
export const isFHEReady = (): boolean => {
    if (typeof window === "undefined") return false;
    return !!(window.RelayerSDK || window.relayerSDK);
};

/**
 * Check if FHE instance is initialized
 */
export const isFheInitialized = (): boolean => {
    return fheInstance !== null;
};

export const isSDKLoaded = isFHEReady;

/**
 * Wait for FHE SDK to be loaded (with timeout)
 */
export const waitForFHE = async (timeoutMs: number = 10000): Promise<boolean> => {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
        if (isFHEReady()) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return false;
};

/**
 * Get FHE status for debugging
 */
export const getFHEStatus = (): {
    sdkLoaded: boolean;
    instanceReady: boolean;
} => {
    return {
        sdkLoaded: isFHEReady(),
        instanceReady: fheInstance !== null,
    };
};
