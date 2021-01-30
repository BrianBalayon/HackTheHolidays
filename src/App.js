import React, { useEffect, useState } from "react";
import { ThemeProvider } from "@material-ui/core/styles";
import useEthPrice from "./utils/ethprice.js";
import contractMap from "@metamask/contract-metadata";
import { useMetaMaskBalances } from "./utils/getbalances.js";
import { theme } from "./theme";
import TokenCard from "./components/tokencard.js";
import getTknVals from "./utils/tknvals.js";
import { Box, Typography, makeStyles } from "@material-ui/core";
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

   let connect = async () => {
      let ethereum = window.ethereum;
      let web3 = window.web3;
      if (typeof ethereum !== "undefined") {
         await ethereum.enable();
         web3 = new Web3(ethereum);
      } else if (typeof web3 !== "undefined") {
         web3 = new Web3(web3.currentProvider);
      } else {
         web3 = new Web3(
            new Web3.providers.HttpProvider(process.env.WEB3_PROVIDER)
         );
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
         console.log(toSet);
         toSetAll[tkn] = { ...toSet, vals: computed };
      });

      setBalances(toSetAll);
      console.log(toSetAll);
   };

   useEffect(async () => {
      await connect();
      await GetBalances();
      await calcValues();
   }, []);

   console.log(balances);

   return (
      <div className="App">
         <ThemeProvider theme={theme}>
            <Box className={classes.container}>
               <Box className={classes.container}>
                  <Typography variant={"h1"}>Token Recovery Tool</Typography>
                  <Typography variant={"body2"}>
                     Scan for MetaMask suppoerted ERC-20 tokens held by your
                     address and add them to your watch list.
                  </Typography>
                  <Typography variant={"body2"}>
                     If you see no tokens listed, you have to enable MetaMask to
                     connect.
                  </Typography>
               </Box>
               {Object.keys(balances).map((tkn) => {
                  return <TokenCard token={balances[tkn]} />;
               })}
            </Box>
         </ThemeProvider>
      </div>
   );
}

export default App;
