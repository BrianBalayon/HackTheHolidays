import { useState, useEffect } from "react";
import axios from "axios";
import { ETH_USD_URL } from "./consts.js";

const useEthPrice = () => {
   const [ethUsdPrice, setEthPrice] = useState(0);
   const [ethUsdError, setEthError] = useState(false);
   const [ethUsdLoading, setEthLoading] = useState(true);

   async function getEthPrice() {
      try {
         setEthLoading(true);
         const price = await getPrices();
         setEthPrice(price);
      } catch (e) {
         setEthError(e);
      } finally {
         setEthError(false);
      }
   }
   useEffect(() => {
      getEthPrice();
   }, []);

   return [ethUsdPrice, ethUsdError, ethUsdLoading];
};

// Quaries CoinGecko's v3 API for the USD price of 1 ETH
const getPrices = async function () {
   let response = axios.get(ETH_USD_URL);

   let unpacked = await response.then((response) => {
      console.log(
         "%c In unpacking: " + response.data.ethereum.usd,
         "font-size: 18px; font-weight: bold"
      );
      return response.data.ethereum.usd;
   });

   console.log(
      "%c ETH to USD: " + unpacked,
      "font-size: 18px; font-weight: bold"
   );

   return unpacked;
};

export default useEthPrice;
