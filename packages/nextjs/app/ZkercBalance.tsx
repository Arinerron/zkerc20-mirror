import { useContext, useEffect, useState } from 'react'
import { ReceiptContext } from './page';
import { useAccount } from 'wagmi'
import { tokens } from './tokens'
import { chains } from './chains'

// chainName: tokens

interface ReadableReceiptInfo {
  [chainName: string]: {
    name: string;
    amount: number;
  }[];
}

export const ZKBalance = () => {
  const receipts = useContext(ReceiptContext);
  const { address } = useAccount();
  const [receiptInfo, setReceiptInfo] = useState<ReadableReceiptInfo>({});

  useEffect(() => {
    if (!receipts || !address) {
      return;
    }
    console.log('receipts', receipts.receipts);
    const receiptInfo = receipts.getReceiptInfoByWallet(address);
    const readableInfo = receiptInfo.map(({ amount, token: tokenAddress, chain: chainId }) => {
      const tokenName = tokens.find(token => token.address === tokenAddress)!.symbol;
      const chainName = chains.find(chain => chain.chainId.toString() === chainId)!.name;
      return {
        amount,
        tokenName,
        chainName,
      }
    })

    const infoMapByChain: ReadableReceiptInfo = {}
    for (const info of readableInfo) {
      if (infoMapByChain[info.chainName] === undefined) {
        infoMapByChain[info.chainName] = [];
      }
      infoMapByChain[info.chainName].push({ name: info.tokenName, amount: info.amount });
    }
    


    setReceiptInfo(infoMapByChain);
    console.log(readableInfo);
  }, [receipts, address]);

  const receiptsComponents = Object.keys(receiptInfo).map((chainName: string) => {
    const tokens = receiptInfo[chainName];
    return (
      <div className="text-xs text-slate-800 my-3" key={address+chainName}>
        <div className="text-slate-600">{chainName}</div>
        {tokens.map(token => {
          return (
            <div key={address+chainName+token.name} className="font-medium">
              {token.amount} {token.name}
            </div>
          )
        })}
      </div>
    )
  })



  return (
    <div className="w-48 bg-slate-100 rounded-t-md text-slate-600 px-1.5 py-3">
      <div className="text-sm">ZKERC20 Balance</div>
      <div className="mt-5">
        {receiptsComponents}
      </div>
    </div>
  );
}
