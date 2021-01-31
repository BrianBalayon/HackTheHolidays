import React, { useEffect, useState } from "react";
import { ThemeProvider } from "@material-ui/core/styles";
import useEthPrice from "./utils/ethprice.js";
import contractMap from "@metamask/contract-metadata";
import { useMetaMaskBalances } from "./utils/getbalances.js";
import { theme } from "./theme";
import TokenCard from "./components/tokencard.js";
import getTknVals from "./utils/tknvals.js";
import { Box, Typography, makeStyles, Button, setRef } from "@material-ui/core";
import Web3 from "web3";

const ethDets = { decimals: 18, name: "Ethereum", symbol: "ETH" };

const useStyles = makeStyles((theme) => ({
   root: {},
   container: {
      height: "100%",
      width: "85%",
      margin: theme.spacing(3),
      margin: "auto",
      padding: theme.spacing(3),
   },
}));

function App() {
   let classes = useStyles();
   let [balances, setBalances] = useState({});
   let [injected, setInjected] = useState(true);
   let [rightChain, setChain] = useState(true);
   let [show, setShow] = useState(0);

   let allow = async () => {
      // MetaMask pop up
      window.ethereum
         .request({
            method: "wallet_requestPermissions",
            params: [{ eth_accounts: {} }],
         })
         .then((permissions) => {
            const accountsPermission = permissions.find(
               (permission) => permission.parentCapability === "eth_accounts"
            );
            if (accountsPermission) {
               console.log("eth_accounts permission successfully requested!");
               setInjected(true);
            }
         })
         .catch((error) => {
            if (error.code === 4001) {
               // EIP-1193 userRejectedRequest error
               console.log("Permissions needed to continue.");
            } else {
               console.error(error);
            }
            setInjected(false);
         });
   };

   let connect = async () => {
      if (typeof ethereum !== "undefined") {
         try {
            let ethereum = window.ethereum;

            ethereum.on("accountsChanged", (accounts) => {
               // Handle the new accounts, or lack thereof.
               // "accounts" will always be an array, but it can be empty.
               window.location.reload();
            });

            ethereum.on("chainChanged", (chainId) => {
               window.location.reload();
            });

            let chain = await ethereum.request({ method: "eth_chainId" });
            if (chain !== "0x1") {
               throw "wrong chain";
            }

            if (show === 1) {
               await allow();
            }
         } catch (e) {
            console.error(e);
            setChain(false);
         }
      } else {
         setInjected(false);
      }
   };

   let [ethUsdPrice] = useEthPrice();

   let tokensHeld = [];

   const GetBalances = async () => {
      useMetaMaskBalances().then(async (r) => {
         var toSet = {};
         tokensHeld = Object.keys(r);
         let vals = await getTknVals(tokensHeld);
         tokensHeld.map((tkn) => {
            let lower = tkn.toLowerCase();
            if (tkn === "eth") {
               toSet[lower] = {
                  ...ethDets,
                  balance: r[tkn],
                  conv: { usd: ethUsdPrice },
               };
            } else {
               toSet[lower] = {
                  ...contractMap[tkn],
                  balance: r[tkn],
                  address: tkn,
               };
            }
         });
         Object.keys(vals).map((tkn) => {
            toSet[tkn] = {
               ...toSet[tkn],
               conv: vals[tkn],
            };
         });
         toSet = await calcValues(toSet)
         setBalances(toSet);
      });
   };

   const calcValues = async (addVals) => {
      var toSetAll = { ...addVals };
      Object.keys(toSetAll).map((tkn) => {
         // Value in another currency
         var computed = {};
         // Other currencies
         // console.log(balances[tkn]);
         let currency = Object.keys(toSetAll[tkn].conv);
         var convs = toSetAll[tkn].conv;
         // console.log(currency);
         currency.map((c) => {
            computed[c] = toSetAll[tkn].balance * convs[c];
            // console.log(convs[c]);
         });
         toSetAll[tkn] = { ...toSetAll[tkn], vals: computed };
         // console.log(toSetAll[tkn]);
      });
      console.log(toSetAll);
      // await setBalances(toSetAll);
      return toSetAll;
   };

   const scan = async () => {
      await connect();
      if (rightChain) {
         await GetBalances();
      }
   };

   // useEffect(() => {
   //    scan();
   // }, []);

   useEffect(async () => {
      scan();
   }, [show]);

   useEffect(async () => {
   }, [balances]);

   return (
      <div className="App">
         <ThemeProvider theme={theme}>
            <Box className={classes.container}>
               <Typography variant={"h1"}>Token Sweeper </Typography>
               {injected && rightChain && (
                  <div>
                     <Typography variant={"body2"}>
                        Scan for MetaMask supported ERC-20 tokens held by your
                        address and add them to your watch list.
                     </Typography>
                     <Button
                        color={"primary"}
                        variant={"contained"}
                        onClick={() => {
                           setShow(show + 1);
                        }}>
                        Scan for Tokens
                     </Button>
                  </div>
               )}
               {!injected && (
                  <Typography variant={"body2"}>
                     Please download and enable MetaMask
                  </Typography>
               )}
               {!rightChain && (
                  <Typography variant={"body2"}>
                     Please switch to the Ethereum Mainnet
                  </Typography>
               )}
               {show > 0 &&
                  Object.keys(balances).map((tkn) => {
                     return <TokenCard token={balances[tkn]} />;
                  })}
            </Box>
         </ThemeProvider>
      </div>
   );
}

export default App;
