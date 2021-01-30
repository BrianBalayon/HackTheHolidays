// Query to get current value
export const ETH_USD_URL =
   "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";

//
export const TOKEN_VAL_URL_P1 =
   "https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=";
export const TOKEN_VAL_URL_P2 = "&vs_currencies=usd%2Ceth";

export const BALANCE_CHECK_ADD = "0xb1F8e55c7f64D203C1400B9D8555d050F94aDF39";
export const ERC20_BALANCE_ABI = [
   {
      constant: true,
      inputs: [
         { name: "user", type: "address" },
         { name: "token", type: "address" },
      ],
      name: "tokenBalance",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function",
   },
   {
      constant: true,
      inputs: [
         { name: "users", type: "address[]" },
         { name: "tokens", type: "address[]" },
      ],
      name: "balances",
      outputs: [{ name: "", type: "uint256[]" }],
      payable: false,
      stateMutability: "view",
      type: "function",
   },
   { payable: true, stateMutability: "payable", type: "fallback" },
];
