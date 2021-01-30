import { useState, useEffect } from "react";
import axios from "axios";
import { TOKEN_VAL_URL_P1, TOKEN_VAL_URL_P2 } from "./consts.js";

const getTokenVals = async (addresses) => {
   let retVal = {};


   if (addresses.length < 1) {
      return {};
   }

   let adds = addresses[0];
   addresses.map((a) => {
      adds = adds.concat("%2C");
      adds = adds.concat(a);
   });

   async function getVals() {
      try {
         retVal = await getPrices(adds);
      } catch (e) {
         console.error(e);
      }
   }

   await getVals();

   return retVal;
};

// Quaries CoinGecko's v3 API for the USD price of 1 ETH
const getPrices = async function (addresses) {
   let response = axios.get(TOKEN_VAL_URL_P1 + addresses + TOKEN_VAL_URL_P2);

   // console.log(TOKEN_VAL_URL_P1 + addresses + TOKEN_VAL_URL_P2);
   let unpacked = await response.then((response) => {
      console.log(
         "%c In unpacking: " + Object.keys(response.data),
         "font-size: 18px; font-weight: bold"
      );
      return response.data;
   });

   console.log("%c Vals: " + unpacked, "font-size: 18px; font-weight: bold");

   return unpacked;
};

export default getTokenVals;
