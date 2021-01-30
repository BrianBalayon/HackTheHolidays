import contractMap from "@metamask/contract-metadata";
import { BigNumber, ethers } from "ethers";
import { BALANCE_CHECK_ADD, ERC20_BALANCE_ABI } from "./consts";

export const useMetaMaskBalances = async (tokenContract) => {

   var retVal = {};
   try {
      // Array of the tokens' contract addresses
      let tknAddresses = Object.keys(contractMap);

      // Connect to the blockchain
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let signerAdd = await signer.getAddress();

      // Query the tokens
      const tokenContract = new ethers.Contract(
         BALANCE_CHECK_ADD,
         ERC20_BALANCE_ABI,
         signer
      );
      let rawBalances = await tokenContract.balances([signerAdd], tknAddresses);

      // Return only non zero balances
      for (let i = 0; i < rawBalances.length; i += 1) {
         let amt = rawBalances[i];
         let addy = tknAddresses[i];
         if (amt.gt(0)) {
            // Divide by the decimals
            let divisor = BigNumber.from(10);
            divisor = divisor.pow(contractMap[addy].decimals);
            amt = amt.div(divisor);
            retVal[addy] = amt.toNumber();
            // console.log(tknAddresses[i]);
         }
      }

      let eth = await signer.getBalance();
      // Need to get ETH from wei
      let div = Math.pow(10, 18);
      retVal.eth = parseFloat(eth.toString()) / div;
   } catch (e) {
      console.log("Issue with trying to get token balances");
      console.error(e);
   }
   // console.log(retVal);
   return retVal;
};
