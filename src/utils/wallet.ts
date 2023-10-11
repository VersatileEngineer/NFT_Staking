// Set of helper functions to facilitate wallet setup
// import { BASE_BSC_SCAN_URL, BASE_URL } from 'config'
import { nodes } from "./getRpcUrl";
import { ChainId } from "../twm-finance/types";

export const BSC_BLOCK_TIME = 3;

export const BASE_ETHEREUM_SCAN_URLS = {
  [ChainId.MAINNET]: "https://etherscan.io/",
  [ChainId.GOERLI]: "https://goerli.etherscan.io/",
};

export const BASE_BSC_SCAN_URL = BASE_ETHEREUM_SCAN_URLS[ChainId.MAINNET];

export const BASE_URL = "https://moonshield.finance/";

/**
 * Prompt the user to add BSC as a network on Metamask, or switch to BSC if the wallet is on a different network
 * @returns {boolean} true if the setup succeeded, false otherwise
 */
export const setupNetwork = async () => {
  const provider = window.ethereum;
  if (provider?.request) {
    const chainId = 56; // const chainId = parseInt(process.env.REACT_APP_CHAIN_ID, 10)
    try {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${chainId.toString(16)}`,
            chainName: "Binance Smart Chain Mainnet",
            nativeCurrency: {
              name: "BNB",
              symbol: "bnb",
              decimals: 18,
            },
            rpcUrls: nodes,
            blockExplorerUrls: [`${BASE_BSC_SCAN_URL}/`],
          },
        ],
      });
      return true;
    } catch (error) {
      console.error("Failed to setup the network in Metamask:", error);
      return false;
    }
  } else {
    console.error(
      "Can't setup the BSC network on metamask because window.ethereum is undefined"
    );
    return false;
  }
};

/**
 * Prompt the user to add a custom token to metamask
 * @param tokenAddress
 * @param tokenSymbol
 * @param tokenDecimals
 * @returns {boolean} true if the token has been added, false otherwise
 */
export const registerToken = async (
  tokenAddress: string,
  tokenSymbol: string,
  tokenDecimals: number
) => {
  const provider = window.ethereum;
  if (provider?.request) {
    const tokenAdded = await provider.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: tokenAddress,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
          image: `${BASE_URL}/images/tokens/${tokenAddress}.png`,
        },
      },
    });
    return tokenAdded;
  }
};
