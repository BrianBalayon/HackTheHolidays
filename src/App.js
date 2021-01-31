import React, { useEffect, useState } from "react";
import { ThemeProvider } from "@material-ui/core/styles";
import useEthPrice from "./utils/ethprice.js";
import contractMap from "@metamask/contract-metadata";
import { useMetaMaskBalances } from "./utils/getbalances.js";
import { theme } from "./theme";
import TokenCard from "./components/tokencard.js";
import getTknVals from "./utils/tknvals.js";
import {
   Box,
   Typography,
   makeStyles,
   Button,
   FormControlLabel,
   Switch,
   Grid,
} from "@material-ui/core";
import ChartCard from "./components/chartcard.js";
import TrackChangesIcon from "@material-ui/icons/TrackChanges";

const ethDets = { decimals: 18, name: "Ethereum", symbol: "ETH" };

const useStyles = makeStyles((theme) => ({
   root: {},
   container: {
      height: "100%",
      width: "85%",
      margin: theme.spacing(5),
      padding: theme.spacing(3),
   },
   vSpace: {
      marginTop: theme.spacing(1),
   },
   vSpace2: {
      marginTop: theme.spacing(2),
   },
   vSpace5: {
      marginTop: theme.spacing(5),
   },
   hSpace: {
      marginLeft: theme.spacing(3),
   },
}));

function App() {
   let classes = useStyles();
   let [balances, setBalances] = useState({});
   let [injected, setInjected] = useState(true);
   let [rightChain, setChain] = useState(true);
   let [show, setShow] = useState(0);
   let [showFiat, setShowFiat] = useState(false);
   let [showEth, setShowEth] = useState(false);
   let [address, setAddress] = useState("");

   const handleChangeShowFiat = () => {
      setShowFiat(!showFiat);
   };

   const handleChangeShowEth = () => {
      setShowEth(!showEth);
   };

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
               throw new Error("wrong chain");
            }

            if (show === 1) {
               await allow();
            }
         } catch (e) {
            console.error(e);
            setChain(false);
         }
         setAddress(window.ethereum.selectedAddress);
      } else {
         setInjected(false);
      }
   };

   var [ethUsdPrice] = useEthPrice();

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
            return null;
         });
         Object.keys(vals).map((tkn) => {
            toSet[tkn] = {
               ...toSet[tkn],
               conv: vals[tkn],
            };
            return null;
         });
         if (typeof toSet.eth != "undefined") {
            toSet = await calcValues(toSet);
         }
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
            return null;
         });
         toSetAll[tkn] = { ...toSetAll[tkn], vals: computed };
         // console.log(toSetAll[tkn]);
         return null;
      });
      toSetAll.eth.vals.eth = toSetAll.eth.balance;
      // console.log(toSetAll);
      // await setBalances(toSetAll);
      return toSetAll;
   };

   async function scan() {
      await connect();
      if (rightChain) {
         await GetBalances();
      }
   }

   useEffect(() => {
      scan();
   }, [show]);

   useEffect(() => {}, [balances, showEth, showFiat, address]);

   return (
      <div className="App">
         <ThemeProvider theme={theme}>
            <Box className={classes.container}>
               <Typography variant={"h1"}>Pocket Change </Typography>
               {injected && rightChain && (
                  <>
                     <Typography className={classes.vSpace} variant={"body2"}>
                        Look for MetaMask supported ERC-20 tokens held by your
                        address and add them to your watch list.
                     </Typography>
                     <div className={classes.vSpace}>
                        <Button
                           color={"primary"}
                           variant={"contained"}
                           startIcon={<TrackChangesIcon />}
                           onClick={() => {
                              setShow(show + 1);
                           }}>
                           Look for Tokens
                        </Button>
                        <FormControlLabel
                           className={classes.hSpace}
                           control={
                              <Switch
                                 checked={showEth}
                                 onChange={handleChangeShowEth}
                                 name="Show ETH Value"
                                 color="primary"
                              />
                           }
                           label="Show ETH Value"
                        />
                        <FormControlLabel
                           className={classes.hSpace}
                           control={
                              <Switch
                                 checked={showFiat}
                                 onChange={handleChangeShowFiat}
                                 name="Show Fiat Value"
                                 color="primary"
                              />
                           }
                           label="Show Fiat Value"
                        />
                     </div>
                  </>
               )}
               {!injected && (
                  <Typography className={classes.vSpace} variant={"body2"}>
                     Please download and enable MetaMask
                  </Typography>
               )}
               {!rightChain && (
                  <Typography className={classes.vSpace} variant={"body2"}>
                     Please switch to the Ethereum Mainnet
                  </Typography>
               )}
               {show > 0 && injected && rightChain && (
                  <>
                     <div className={classes.vSpace5}>
                        <ChartCard tokens={balances} />
                     </div>
                     <div className={classes.vSpace5}>
                        <Typography variant={"h3"}>
                           Tokens Found Held{" "}
                           {address !== ""
                              ? ""
                              : "by" +
                                address.slice(0, 6) +
                                "..." +
                                address.slice(address.length - 4)}
                        </Typography>
                        <Grid
                           container
                           direction="row"
                           justify="space-evenly"
                           alignItems="center">
                           {Object.keys(balances).map((tkn, k) => {
                              return (
                                 <TokenCard
                                    key={k}
                                    showFiat={showFiat}
                                    showEth={showEth}
                                    token={balances[tkn]}
                                 />
                              );
                           })}
                        </Grid>
                     </div>
                  </>
               )}
            </Box>
         </ThemeProvider>
      </div>
   );
}

export default App;
