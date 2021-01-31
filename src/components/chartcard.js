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
import Chart from "./chart.js";

const useStyles = makeStyles((theme) => ({
   root: {
      width: "85%",
      margin: "auto",
   },
   card: {
      margin: theme.spacing(3),
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
   return { usd: usd, eth, eth };
}

const TokenCard = ({ className, tokens }) => {
   const classes = useStyles();
   let sorted = sortLargestFirst(tokens);
   let totals = getTotals(sorted);
   console.log(totals);
   return (
      <Card className={clsx(className, classes.root)} elevation={3}>
         <CardContent>
            <Typography variant={"h3"}>Discovered HODL Breakdown</Typography>
            <Grid
               alignItems="center"
               container
               direction="column"
               item
               justify="center"
               xs={12}>
               <Chart className={classes.center} tokens={tokens} />
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
