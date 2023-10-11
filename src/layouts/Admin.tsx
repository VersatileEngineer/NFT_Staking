/* eslint-disable */
// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";

// core components
import Home from "../views/Home/Home";

import dashboardStyle from "../assets/jss/material-dashboard-react/layouts/dashboardStyle";

import "@solana/wallet-adapter-react-ui/styles.css";

import { ethers } from "ethers";
import { Web3ReactProvider } from "@web3-react/core";
import TWMFinanceProvider from "../contexts/TWMFinanceProvider";
import { RefreshContextProvider } from "../contexts/RefreshContext";
import MetamaskProvider from "../contexts/MetamaskProvider";

const POLLING_INTERVAL = 12000;
const getLibrary = (provider: any): ethers.providers.Web3Provider => {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = POLLING_INTERVAL;
  return library;
};

function HomeWithProvider() {
  // Clear localStorage for mobile users
  if (
    typeof localStorage.version_app === "undefined" ||
    localStorage.version_app !== "1.0"
  ) {
    localStorage.clear();
    localStorage.setItem("connectorId", "");
    localStorage.setItem("version_app", "1.0");
  }
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <MetamaskProvider>
        <TWMFinanceProvider>
          <RefreshContextProvider>
            <Home />
          </RefreshContextProvider>
        </TWMFinanceProvider>
      </MetamaskProvider>
    </Web3ReactProvider>
  );
}

export default withStyles(dashboardStyle)(HomeWithProvider);
