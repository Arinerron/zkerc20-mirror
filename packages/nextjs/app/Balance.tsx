// import { useContext, useEffect, useState } from 'react'
// import { ReceiptContext } from './page';
// import { useAccount } from 'wagmi'
// import { tokens } from './tokens'
// import { chains } from './chains'

// // chainName: tokens

// interface ReadableReceiptInfo {
//   [chainName: string]: {
//     name: string;
//     amount: number;
//   }[];
// }

// export const WalletBalance = () => {
//   const receipts = useContext(ReceiptContext);
//   const { address } = useAccount();

//   useEffect(() => {

//   }, [receipts, address]);

//   const receiptsComponents = Object.keys(receiptInfo).map((chainName: string) => {
//     const tokens = receiptInfo[chainName];
//     return (
//       <div className="text-xs text-slate-800 my-3" key={address+chainName}>
//         <div className="text-slate-600">{chainName}</div>
//         {tokens.map(token => {
//           return (
//             <div key={address+chainName+token.name} className="font-medium">
//               {token.amount} {token.name}
//             </div>
//           )
//         })}
//       </div>
//     )
//   })



//   return (
//     <div className="w-48 bg-slate-100 rounded-t-md text-slate-600 px-1.5 py-3">
//       <div className="text-sm">Wallet Balance</div>
//       <div className="mt-5">
//         {receiptsComponents}
//       </div>
//     </div>
//   );
// }
