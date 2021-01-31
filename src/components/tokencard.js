import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import {
   makeStyles,
   Card,
   CardContent,
   Typography,
   Button,
   Grid,
   Link,
} from "@material-ui/core";
import { addToWallet } from "../utils/addToWallet.js";
import LaunchIcon from "@material-ui/icons/Launch";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";

const useStyles = makeStyles((theme) => ({
   root: { height: "72pt" },
   card: {
      // height: "130pt",
      // width: "85%",
      margin: theme.spacing(3),
   },
   vSpace: {
      marginTop: theme.spacing(1),
   },
   vSpace2: {
      marginTop: theme.spacing(2),
   },
}));

const TokenCard = ({ className, token, showFiat }) => {
   const classes = useStyles();

   return (
      <Grid className={clsx(className, classes.root)} xs={12} md={3} lg={4}>
         <Card className={classes.card} elevation={3}>
            <CardContent>
               <Typography variant={"h3"}>{token.name}</Typography>
               <Typography className={classes.vSpace} variant={"body1"}>
                  {token.balance} {token.symbol}
               </Typography>
               {showFiat && token.vals && (
                  <Typography color={"textSecondary"} variant={"body2"}>
                     ${token.vals.usd.toFixed(2)}
                  </Typography>
               )}

               {token.symbol !== "ETH" && (
                  <>
                     {token.vals && (
                        <Typography color={"textSecondary"} variant={"body2"}>
                           {token.vals.eth} ETH
                        </Typography>
                     )}
                     <Button
                        className={classes.vSpace2}
                        color="primary"
                        variant="contained"
                        startIcon={<AccountBalanceWalletIcon />}
                        onClick={() => {
                           try {
                              addToWallet(
                                 token.address,
                                 token.symbol,
                                 token.decimals
                              );
                           } catch {}
                        }}>
                        Add {token.symbol} to Wallet
                     </Button>
                     <Link
                        color={"inherit"}
                        rel={"noopener noreferrer"}
                        target={"_blank"}
                        href={
                           "https://etherscan.io/token/" +
                           token.address +
                           "?a=" +
                           window.ethereum.selectedAddress
                        }>
                        <Button
                           className={classes.vSpace}
                           color="secondary"
                           variant="outlined"
                           startIcon={<LaunchIcon />}>
                           View on Etherscan
                        </Button>
                     </Link>
                  </>
               )}
            </CardContent>
         </Card>
      </Grid>
   );
};

TokenCard.propTypes = {
   className: PropTypes.string,
   token: PropTypes.object,
};

TokenCard.defaultProps = {
   className: "",
   token: {},
};

export default TokenCard;
