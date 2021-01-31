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

const TokenCard = ({ className, tokens }) => {
   const classes = useStyles();

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
