import { Configuration } from "./config";
import { BigNumber, Contract, ethers } from "ethers";
import { Promise } from "bluebird";
import { getDefaultProvider } from "../utils/provider";
import { NftInfo, ReturnInfo } from "./types";
// import { getContract } from "../utils/contractHelpers";
import { balanceToDecimal } from "./ether-utils";
import axios from "axios";
/**
 * An API module of TWM Finance contracts.
 * All contract-interacting domain logic should be defined in here.
 */
export class TWMFinance {
  myAccount: string;
  provider: ethers.providers.Web3Provider;
  signer?: ethers.Signer;
  config: Configuration;
  serverUrl: string;
  contracts: { [name: string]: Contract };

  constructor(cfg: Configuration) {
    const { deployments, serverUrl } = cfg;
    const provider = getDefaultProvider();
    this.myAccount = "";
    this.serverUrl = serverUrl;

    // loads contracts from deployments
    this.contracts = {};
    for (const [name, deployment] of Object.entries(deployments)) {
      this.contracts[name] = new Contract(
        deployment.address,
        deployment.abi,
        provider
      );
    }

    this.config = cfg;
    this.provider = provider;
  }

  /**
   * @param provider From an unlocked wallet. (e.g. Metamask)
   * @param account An address of unlocked wallet account.
   */

  unlockWallet(provider: any, account: string) {
    this.signer = provider.getSigner(0);
    this.myAccount = account;
    if (this.signer) {
      for (const [name, contract] of Object.entries(this.contracts)) {
        this.contracts[name] = contract.connect(this.signer);
      }
    }
    console.log(`🔓 Wallet is unlocked. Welcome, ${account}!`);
  }

  get isUnlocked(): boolean {
    return !!this.myAccount;
  }

  async getUnstakedNFTs(): Promise<NftInfo[]> {
    const { TWM_NFT } = this.contracts;
    let myNftsInfo: NftInfo[] = [];
    if (this.myAccount === "") return myNftsInfo;
    // const myNftBalance = await TWM_NFT.counterOfOwner(this.myAccount);
    let myNfts: BigNumber[] = await TWM_NFT.walletOfOwner(this.myAccount);
    let IntNfts = [];
    let traits: any[] = [];
    for (var i = 0; i < myNfts.length; i++) {
      IntNfts.push(myNfts[i].toNumber());
    }
    try {
      let res = await axios.get(
        this.serverUrl + "traits/" + JSON.stringify(IntNfts),
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          },
        }
      );
      traits = res.data;
    } catch (error) {
      return myNftsInfo;
    }
    await Promise.map(myNfts, async (value) => {
      let url = await TWM_NFT.tokenURI(value);
      let res = await axios.get(url);
      let obj = traits.find((o) => o.no === value.toNumber());
      myNftsInfo.push({
        imageUrl: res.data.image,
        name: res.data.name,
        normalReward: obj.trait,
        id: value.toNumber(),
      });
    });
    return myNftsInfo;
  }

  async getStakedNFTs(): Promise<NftInfo[]> {
    const { TWM_BANK, TWM_NFT } = this.contracts;
    let myNftsInfo: NftInfo[] = [];
    if (this.myAccount === "") return myNftsInfo;
    // const myNftBalance = await TWM_NFT.counterOfOwner(this.myAccount);
    let myNfts: BigNumber[] = await TWM_BANK.getStakerTokens(this.myAccount);
    let IntNfts = [];
    let traits: any[] = [];
    for (var i = 0; i < myNfts.length; i++) {
      IntNfts.push(myNfts[i].toNumber());
    }
    try {
      let res = await axios.get(
        this.serverUrl + "traits/" + JSON.stringify(IntNfts),
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          },
        }
      );
      traits = res.data;
    } catch (error) {
      return myNftsInfo;
    }
    await Promise.map(myNfts, async (value) => {
      let url = await TWM_NFT.tokenURI(value);
      let res = await axios.get(url);
      let obj = traits.find((o) => o.no === value.toNumber());
      myNftsInfo.push({
        imageUrl: res.data.image,
        name: res.data.name,
        normalReward: obj.trait,
        id: value.toNumber(),
      });
    });
    return myNftsInfo;
  }

  async isApprovedForAll(address: string): Promise<boolean> {
    const { TWM_NFT, TWM_BANK } = this.contracts;
    if (await TWM_NFT.isApprovedForAll(address, TWM_BANK.address)) {
      return true;
    }
    return false;
  }

  async setApproveForAll(): Promise<ReturnInfo> {
    const { TWM_BANK, TWM_NFT } = this.contracts;
    try {
      const txx = await TWM_NFT.setApprovalForAll(TWM_BANK.address, true);
      const receipt = await txx.wait();
      console.log(
        `setApprovalForAll tx: https://goerli.etherscan.io/tx/${receipt.transactionHash}`
      );
      return {
        success: true,
        reason: "",
      };
    } catch (error) {
      return {
        success: false,
        reason: "setApprovalForAll transaction fail!",
      };
    }
  }

  async getTWTBalance(): Promise<string> {
    const { TWM_TOKEN } = this.contracts;
    if (this.myAccount === "") return "0";
    try {
      let balance = await TWM_TOKEN.balanceOf(this.myAccount);
      return balanceToDecimal(balance.toString());
    } catch (error) {
      return "0";
    }
  }

  async getAccumulatedAmount(): Promise<string> {
    const { TWM_BANK } = this.contracts;
    if (this.myAccount === "") return "0";
    let accumulatedAmount: BigNumber = await TWM_BANK.getAccumulatedAmount(
      this.myAccount
    );
    return balanceToDecimal(accumulatedAmount.toString());
  }

  async claim(): Promise<ReturnInfo> {
    const { TWM_BANK } = this.contracts;

    try {
      let accumulatedAmount = await TWM_BANK.getAccumulatedAmount(
        this.myAccount
      );

      const txx = await TWM_BANK.claim(accumulatedAmount);
      const receipt = await txx.wait();
      console.log(
        `claim tx: https://goerli.etherscan.io/tx/${receipt.transactionHash}`
      );
      return {
        success: true,
        reason: "",
      };
    } catch (error) {
      return {
        success: false,
        reason: "Claim transaction fail!",
      };
    }
  }

  async withdraw(nums: number[]): Promise<ReturnInfo> {
    const { TWM_BANK, TWM_NFT } = this.contracts;
    let hexNums: string[] = [];
    nums.forEach((num) => {
      hexNums.push(ethers.utils.hexlify(num));
    });

    let tokens: BigNumber[] = await TWM_BANK.getStakerTokens(this.myAccount);
    tokens.forEach(async (token) => {
      let flag = false;
      for (let i = 0; i < nums.length; i++) {
        if (token.toNumber() === nums[i]) {
          flag = true;
          break;
        }
      }

      if (!flag) {
        return {
          success: false,
          reason: "Please select the correct nfts for withdrawing!",
        };
      }
    });

    try {
      const txx = await TWM_BANK.withdraw(TWM_NFT.address, hexNums);
      const receipt = await txx.wait();
      console.log(
        `withdraw tx: https://goerli.etherscan.io/tx/${receipt.transactionHash}`
      );
      return {
        success: true,
        reason: "",
      };
    } catch (error) {
      return {
        success: false,
        reason: "Withdraw Transaction Error!",
      };
    }
  }

  async depositNFTs(nums: number[]): Promise<ReturnInfo> {
    const { TWM_BANK, TWM_NFT } = this.contracts;
    let hexNums: string[] = [];

    nums.forEach((num) => {
      hexNums.push(ethers.utils.hexlify(num));
    });
    if ((await TWM_BANK.stakingLaunched()) === false) {
      return {
        success: false,
        reason: "Staking is disable now!",
      };
    } else {
      if (await this.isApprovedForAll(this.myAccount)) {
        let res: any;
        try {
          res = await axios.get(
            this.serverUrl + "traits/deposit/" + JSON.stringify(nums),
            {
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods":
                  "GET,PUT,POST,DELETE,PATCH,OPTIONS",
              },
            }
          );
        } catch (error) {
          return {
            success: false,
            reason: "TWM Server is fail!",
          };
        }
        try {
          const txx = await TWM_BANK.deposit(
            TWM_NFT.address,
            res.data.hexNums,
            res.data.traits,
            res.data.signature
          );
          const receipt = await txx.wait();
          console.log(
            `deposit tx: https://goerli.etherscan.io/tx/${receipt.transactionHash}`
          );
          return {
            success: true,
            reason: "",
          };
        } catch (error) {
          return {
            success: false,
            reason: "Deposit Transaction Error!",
          };
        }
      } else {
        return {
          success: false,
          reason: "The Bank is not approved for All!",
        };
      }
    }
  }

  async stakeAll(): Promise<ReturnInfo> {
    const { TWM_NFT } = this.contracts;
    let unstakedNFTs: number[] = [];
    if (this.myAccount === "")
      return {
        success: false,
        reason: "Not Connected Wallet!",
      };

    try {
      let myNfts: BigNumber[] = await TWM_NFT.walletOfOwner(this.myAccount);
      myNfts.forEach(async (value, index) => {
        unstakedNFTs.push(value.toNumber());
      });
      let res: ReturnInfo = await this.depositNFTs(unstakedNFTs);
      return res;
    } catch (error) {
      return {
        success: false,
        reason: "Stake All Fail!",
      };
    }
  }

  async withdrawAll(): Promise<ReturnInfo> {
    const { TWM_BANK } = this.contracts;
    let stakedNFTs: number[] = [];
    if (this.myAccount === "")
      return {
        success: false,
        reason: "Not Connected Wallet!",
      };

    try {
      let myNfts: BigNumber[] = await TWM_BANK.getStakerTokens(this.myAccount);
      myNfts.forEach(async (value, index) => {
        stakedNFTs.push(value.toNumber());
      });
      let res: ReturnInfo = await this.withdraw(stakedNFTs);
      return res;
    } catch (error) {
      return {
        success: false,
        reason: "Unstake All Fail!",
      };
    }
  }

  async progressInfo(): Promise<number> {
    const { TWM_BANK, TWM_NFT } = this.contracts;
    let balance: BigNumber = await TWM_NFT.balanceOf(TWM_BANK.address);
    return balance.toNumber();
  }
}
