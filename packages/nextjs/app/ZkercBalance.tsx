import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { tokens } from './tokens'
import { chains } from './chains'
import useReceipts from './useReceipts'

// chainName: tokens

interface ReadableReceiptInfo {
  [chainName: string]: {
    name: string;
    amount: number;
    availablePerTx: number;
  }[];
}

export const ZKBalance = () => {
  // const receipts = useContext(ReceiptContext);
  const { getReceiptInfoByWallet, getTop8ReceiptsInfoByWallet } = useReceipts();

  const { address } = useAccount();
  const [receiptInfo, setReceiptInfo] = useState<ReadableReceiptInfo>({});

  useEffect(() => {
    if (!address) {
      return;
    }
    const receiptInfo = getReceiptInfoByWallet(address);
    const top8Receipts = getTop8ReceiptsInfoByWallet(address);
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
    readableInfo.forEach((info, index) => {
      if (infoMapByChain[info.chainName] === undefined) {
        infoMapByChain[info.chainName] = [];
      }
      infoMapByChain[info.chainName].push({ name: info.tokenName, amount: info.amount, availablePerTx: top8Receipts[index].amount });
    })
    
    setReceiptInfo(infoMapByChain);
    console.log(readableInfo);
  }, [address, getReceiptInfoByWallet]);

  const receiptsComponents = Object.keys(receiptInfo).map((chainName: string) => {
    const tokens = receiptInfo[chainName];
    return (
      <div className="text-xs text-slate-800 my-3" key={address+chainName}>
        <div className="text-slate-600">{chainName}</div>
        {tokens.map(token => {
          return (
            <div key={address+chainName+token.name}>
              <div className="font-medium">
                <span>{token.amount} {token.name}</span>
                <span className="font-light text-slate-500 ml-2">
                  {token.availablePerTx} per txn
                </span>
              </div>
              
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
