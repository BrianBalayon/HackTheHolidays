import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import {
   makeStyles,
   Card,
   CardContent,
   Typography,
   Grid,
} from "@material-ui/core";
import Chart from "./chart.js";

const useStyles = makeStyles((theme) => ({
   root: {
      width: "85%",
      margin: "auto",
   },
   hSpace: {
      margin: theme.spacing(7),
   },
   vSpace: {
      marginTop: theme.spacing(1),
   },
   vSpace2: {
      marginTop: theme.spacing(2),
   },
   center: {
      margin: "auto",
   },
}));

function sortLargestFirst(tkns) {
   var retVal = Object.values(tkns);
   return retVal.sort((a, b) => {
      return b.vals.usd - a.vals.usd;
   });
}

function getTotals(tkns) {
   let usdReducer = (acc, curr) => {
      return acc + curr.vals.usd;
   };
   let ethReducer = (acc, curr) => {
      return acc + curr.vals.eth;
   };
   let usd = tkns.reduce(usdReducer, 0);
   let eth = tkns.reduce(ethReducer, 0);
   return { usd: usd, eth: eth };
}

const TokenCard = ({ className, tokens, showFiat, showEth }) => {
   const classes = useStyles();
   let sorted = sortLargestFirst(tokens);
   let totals = getTotals(sorted);

   if (totals.eth === 0) {
      return <></>;
   }
   function getTop(tkns) {
      var retVal = [];
      for (var i = 0; i < 5 && i < tkns.length; i += 1) {
         retVal.push(
            <Typography
               className={classes.vSpace}
               align={"center"}
               variant={"body1"}>
               #{i + 1} {tkns[i].name} ({" "}
               {((tkns[i].vals.eth / totals.eth) * 100).toFixed(2)}% )
            </Typography>
         );
      }

      return retVal;
   }

   //    console.log(totals);
   return (
      <Card className={clsx(className, classes.root)} elevation={3}>
         <CardContent>
            <Typography variant={"h3"}>Discovered HODL Breakdown</Typography>
            <Grid
               alignItems="center"
               container
               direction="row"
               justify="center">
               <Grid item xs={12} md={5}>
                  <Typography
                     className={classes.vSpace2}
                     align={"center"}
                     variant={"h4"}>
                     Top Holdings
                  </Typography>
                  {getTop(sorted)}
               </Grid>
               <Grid
                  item
                  xs={12}
                  md={7}
                  alignItems="center"
                  container
                  direction="row"
                  justify="center">
                  <Chart tokens={tokens} />
               </Grid>
            </Grid>
         </CardContent>
      </Card>
   );
};

TokenCard.propTypes = {
   className: PropTypes.string,
   tokens: PropTypes.object,
};

TokenCard.defaultProps = {
   className: "",
   tokens: {},
};

export default TokenCard;
