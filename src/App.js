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
         setBalances(toSet);
      });
   };

   const calcValues = async () => {
      var toSetAll = { ...balances };

      Object.keys(toSetAll).map((tkn) => {
         let toSet = balances[tkn];
         // Value in another currency
         var computed = {};
         // Other currencies
         console.log(balances[tkn]);
         let currency = Object.keys(balances[tkn].conv);
         let convs = balances[tkn].conv;
         console.log(currency);
         currency.map((c) => {
            computed[c] = balances[tkn].balance * convs[c];
            // console.log(computed[c]);
         });
         // console.log(toSet);
         toSetAll[tkn] = { ...toSet, vals: computed };
      });

      setBalances(toSetAll);
      console.log(toSetAll);
   };

   const scan = async () => {
      await connect();
      if (rightChain) {
         await GetBalances();
         await calcValues();
      }
   };

   // useEffect(() => {
   //    scan();
   // }, []);

   useEffect(async () => {
      scan();
   }, [show]);

   console.log(balances);

   return (
      <div className="App">
         <ThemeProvider theme={theme}>
            <Box className={classes.container}>
               <Box className={classes.container}>
                  <Typography variant={"h1"}>Token Recovery Tool </Typography>
                  {injected && rightChain && (
                     <div>
                        <Typography variant={"body2"}>
                           Scan for MetaMask supported ERC-20 tokens held by
                           your address and add them to your watch list.
                        </Typography>
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
                  <Button
                     color={"primary"}
                     variant={"contained"}
                     onClick={() => {
                        setShow(show + 1);
                     }}>
                     Scan for Tokens
                  </Button>
               </Box>
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
