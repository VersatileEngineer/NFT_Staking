import { useState, useEffect } from "react";
import styled from "styled-components";
import { useWeb3React } from "@web3-react/core";
import StakedNFT from "./Staking/StakedNFT";
import UnStakedNFT from "./Staking/UnStakedNFT";
import Ok from "../../../assets/pixelwork/check-ok.png";
import Fail from "../../../assets/pixelwork/check-fail.png";
import Spinner from "./Spinner";
import useTWMFinance from "../../../hooks/useTWMFinance";
import { NftInfo, ReturnInfo } from "../../../twm-finance/types";

interface IBtn {
  percent: number;
}

const ProgressBar = styled.div<IBtn>`
  background-color: #8718ed;
  width: ${(props) => props.percent}%;
  border-radius: 20px;
  height: 15px;
`;

export interface AllTWMs {
  stakedTWMs: NftInfo[];
  unstakedTWMs: NftInfo[];
}

function NFTStaking() {
  const twmFinance = useTWMFinance();
  const { account } = useWeb3React();
  const [myTWMs, setMyTWMs] = useState<AllTWMs>({
    stakedTWMs: [],
    unstakedTWMs: [],
  });
  const [selectedUnstakeIndexes, setSelectedUnstakeIndexes] = useState([]);
  const [selectedStakeIndexes, setSelectedStakeIndexes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [changed, setChange] = useState<boolean>(true);
  const [totalStaked, setTotalStaked] = useState<number>(0);
  const [result, setResult] = useState<ReturnInfo>({
    success: true,
    reason: "",
  });

  const render = () => {
    setChange(!changed);
  };

  useEffect(() => {
    async function fetchNftsInfo() {
      try {
        setIsLoading(true);
        handleProgress();
        setSelectedStakeIndexes([]);
        setSelectedUnstakeIndexes([]);
        if (twmFinance?.myAccount) {
          let tempStakedTWMs = await twmFinance.getStakedNFTs();
          let tempUnstakedTWMs = await twmFinance.getUnstakedNFTs();
          setMyTWMs({
            stakedTWMs: tempStakedTWMs,
            unstakedTWMs: tempUnstakedTWMs,
          });
        }
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        console.error(err);
      }
    }
    fetchNftsInfo();
  }, [twmFinance?.myAccount, changed]);

  const handleResult = () => {
    document.getElementById("modal-result")?.classList.add("open");
    window.addEventListener("click", function (e: any) {
      if (e.target.id === "modal-result") {
        document.getElementById("modal-result")?.classList.remove("open");
      }
    });
  };

  const handleStake = async () => {
    setIsLoading(true);
    let res = await twmFinance?.depositNFTs(selectedUnstakeIndexes);
    setIsLoading(false);
    if (res) {
      setResult(res);
    }
    handleResult();
    render();
  };

  const handleWithdraw = async () => {
    setIsLoading(true);
    let res = await twmFinance?.withdraw(selectedStakeIndexes);
    setIsLoading(false);
    if (res) {
      setResult(res);
    }
    handleResult();
    render();
  };

  const handleAllStake = async () => {
    setIsLoading(true);
    let res = await twmFinance?.stakeAll();
    setIsLoading(false);
    if (res) {
      setResult(res);
    }
    handleResult();
    render();
  };

  const handleAllWithdraw = async () => {
    setIsLoading(true);
    let res = await twmFinance?.withdrawAll();
    setIsLoading(false);
    if (res) {
      setResult(res);
    }
    handleResult();
    render();
  };

  const handleProgress = async () => {
    let res = await twmFinance?.progressInfo();
    if (res) {
      setTotalStaked(res);
    }
  };

  return (
    <section className="defi">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="subheading center">READY TO STAKE?</div>
            <div className="heading center">THE WATCHMAKER STAKING</div>
            <div className="description center text-bold">
              <span className="text-white text-underline">
                {((totalStaked / 5555) * 100).toFixed(2)}%
              </span>
              <span className="text-white"> TWM Staked ({totalStaked}/</span>
              5555
              <span className="text-white">)</span>
            </div>
            <div className="defi-progress">
              <ProgressBar percent={(totalStaked / 5555) * 100} />
            </div>

            {!account ? (
              <></>
            ) : (
              <>
                <div className="to-center">
                  <button
                    className="btn-large"
                    onClick={async (e: any) => {
                      await handleAllStake();
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? <Spinner type={"small"} /> : ""} Stake ALL{" "}
                    {!account || !myTWMs.unstakedTWMs.length
                      ? ""
                      : "(" + myTWMs.unstakedTWMs.length + ")"}
                  </button>

                  <button
                    className="btn-large"
                    onClick={async (e: any) => {
                      await handleAllWithdraw();
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? <Spinner type={"small"} /> : ""} Unstake ALL{" "}
                    {!account || !myTWMs.stakedTWMs.length
                      ? ""
                      : "(" + myTWMs.stakedTWMs.length + ")"}
                  </button>
                </div>

                <div className="heading center other">
                  <span className="text-white">
                    Staked NFTs{" "}
                    {!account || !myTWMs.stakedTWMs.length
                      ? ""
                      : " - " + myTWMs.stakedTWMs.length}
                  </span>
                </div>

                {isLoading ? (
                  <div className="row defi-row">
                    <div className="spin-box">
                      <Spinner type={"large"} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="row defi-row">
                      {myTWMs.stakedTWMs.map((nft, idx) => {
                        return (
                          <div className="col-xl-3 col-lg-3" key={idx}>
                            <StakedNFT
                              index={nft.id}
                              nftData={nft}
                              indexes={selectedStakeIndexes}
                              changeIndexes={setSelectedStakeIndexes}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="to-center">
                      <button
                        className="btn-large"
                        onClick={async (e: any) => {
                          await handleWithdraw();
                        }}
                        disabled={!account ? true : false}
                      >
                        Confirm Unstake
                      </button>
                    </div>
                  </>
                )}

                <div className="defi-separator"></div>
                <br />
                <div className="heading center other">
                  <span className="text-white">
                    Unstaked NFTs{" "}
                    {!account || !myTWMs.unstakedTWMs.length
                      ? ""
                      : " - " + myTWMs.unstakedTWMs.length}
                  </span>
                </div>

                {isLoading ? (
                  <div className="row defi-row">
                    <div className="spin-box">
                      <Spinner type={"large"} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="row defi-row">
                      {myTWMs.unstakedTWMs.map((nft, idx) => {
                        return (
                          <div className="col-xl-3 col-lg-3" key={idx}>
                            <UnStakedNFT
                              index={nft.id}
                              nftData={nft}
                              indexes={selectedUnstakeIndexes}
                              changeIndexes={setSelectedUnstakeIndexes}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="to-center">
                      <button
                        className="btn-large"
                        onClick={async (e: any) => {
                          if (await twmFinance?.isApprovedForAll(account)) {
                            await handleStake();
                          } else {
                            document
                              .getElementById("modal-approve-all")
                              ?.classList.add("open");
                            window.addEventListener("click", function (e: any) {
                              if (e.target.id === "modal-approve-all") {
                                document
                                  .getElementById("modal-approve-all")
                                  ?.classList.remove("open");
                              }
                            });
                          }
                        }}
                        disabled={!account ? true : false}
                      >
                        Confirm Stake
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="overlay" id="modal-result">
        <div className="modal">
          <img src={result.success ? Ok : Fail} alt="ok" />
          {result.success ? (
            <div className="modal-text">
              <strong>Great!</strong> Success!
              <br />
              <p>Thanks!</p>
            </div>
          ) : (
            <div className="modal-text">
              <strong>Oops!</strong> Failed!
              <br />
              <p>{result.reason}</p>
            </div>
          )}
        </div>
      </div>

      <div className="overlay" id="modal-approve-all">
        <div className="modal" id="modal-area">
          <div className="modal-text lock">
            <div className="subheading center white">Approved All Nfts</div>
            <div className="defi-separator"></div>
            <a
              className="btn-medium"
              style={{ marginTop: "-15px" }}
              onClick={async (e: any) => {
                document
                  .getElementById("modal-approve-all")
                  ?.classList.remove("open");
                setIsLoading(true);
                let res = await twmFinance?.setApproveForAll();
                setIsLoading(false);
                if (res) {
                  setResult(res);
                }
                handleResult();
                e.preventDefault();
              }}
            >
              Approve All
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NFTStaking;
