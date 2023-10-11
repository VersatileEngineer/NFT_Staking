import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import useTWMFinance from "../../../../hooks/useTWMFinance";
import { ReturnInfo } from "../../../../twm-finance/types";
import CharLeft from "../../../../assets/pixelwork/char-left-new.png";
import CharRight from "../../../../assets/pixelwork/char-right-new.png";
import "@solana/wallet-adapter-react-ui/styles.css";
import Ok from "../../../../assets/pixelwork/check-ok.png";
import Fail from "../../../../assets/pixelwork/check-fail.png";

import Spinner from "../Spinner";

function Claim() {
  const twmFinance = useTWMFinance();
  const { account } = useWeb3React();
  const [accumulatedAmount, setAccumulatedAmount] = useState<string>("0");
  const [twtBalance, setTwtBalance] = useState<string>("0");
  const [result, setResult] = useState<ReturnInfo>({
    success: true,
    reason: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [changed, setChange] = useState<boolean>(true);
  const render = () => {
    setChange(!changed);
  };

  const handleAccumulatedAmount = async () => {
    const res = await twmFinance?.getAccumulatedAmount();
    if (res) {
      setAccumulatedAmount(res);
    }
  };

  const fetchTWTBalance = async () => {
    const res = await twmFinance?.getTWTBalance();
    console.log("fetchTWTBalance:", res);
    if (res) {
      setTwtBalance(res.split(".")[0]);
    }
  };

  const claimTWT = async (e: any) => {
    setIsLoading(true);

    if (account) {
      const res = await twmFinance?.claim();
      setIsLoading(false);
      if (res) {
        setResult(res);
      }
      e.preventDefault();
      document.getElementById("modal-claim")?.classList.add("open");

      document
        .getElementById("modal-claim")
        ?.addEventListener("click", function () {
          render();
          document.getElementById("modal-claim")?.classList.remove("open");
        });
    }
  };

  useEffect(() => {
    async function fetchAccumulatedAmount() {
      try {
        setResult({ success: true, reason: "" });
        if (account && twmFinance?.myAccount) {
          handleAccumulatedAmount();
          fetchTWTBalance();
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchAccumulatedAmount();
  }, [account, changed, twmFinance?.myAccount]);

  return (
    <section className="claim">
      <div className="container">
        <div className="row">
          <div className="col-xl-3">
            <img className="char-left" src={CharLeft} alt="" />
          </div>
          <div className="col-xl-6 claim-content">
            <div className="subheading center">The Watchmaker</div>
            <div className="heading center">Claim your $TWT</div>
            <div className="description center text-bold">
              <h2 className="text-white text-underline">
                Current accumulated reward:
              </h2>
              <h2 className="text-white">
                {" "}
                {!account
                  ? Number(0).toFixed(2)
                  : Number(accumulatedAmount).toFixed(2)}
                {" TWT"}
              </h2>
            </div>
            <div className="description">
              - Current <span className="text-important">$TWT</span> balance:{" "}
              {twtBalance}
              <br />
              - For each TWM NFT, holders can claim 150 $TWT per 24 hours
              <br />- Ultra TWM NFT claim over 500{" "}
              <span className="text-important">$TWT</span> per 24 hours
              <br />- For any questions or concerns, please visit{" "}
              <span className="text-white text-underline">
                The Watchmaker Discord
              </span>{" "}
            </div>
            {!account ? (
              <></>
            ) : (
              <button
                type="button"
                className="btn-medium"
                id="claim"
                onClick={claimTWT}
                disabled={isLoading}
              >
                {isLoading ? <Spinner type={"small"} /> : ""} Claim $TWT{" "}
              </button>
            )}
          </div>
          <div className="col-xl-3">
            <img src={CharRight} className="char-right" alt="" />
          </div>
        </div>
      </div>
      <div className="overlay" id="modal-claim">
        <div className="modal">
          <img src={result.success ? Ok : Fail} alt="ok" />
          {result.success ? (
            <div className="modal-text">
              <strong>Great!</strong> Succesfully claimed!
              <br />
              <a href="#" className="btn-medium">
                Thanks!
              </a>
            </div>
          ) : (
            <div className="modal-text">
              <strong>Oops!</strong> Claim failed!
              <br />
              <p>{result.reason}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Claim;
