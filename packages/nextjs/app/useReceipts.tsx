import { useCallback, useEffect, useMemo } from 'react'
import { useLocalStorage } from 'usehooks-ts';

interface Receipt {
  value: string; // the hash
  amount: number;
}

interface ReceiptInfo {
  chain: string;
  token: string;
  amount: number;
}

const useReceipts = () => {
  // State to store the value
  const [receipts, setReceipts] = useLocalStorage<{ [key: string]: Receipt[] }>("receipts", {});

  const getKey = (wallet: string, chain: string, tokenType: string): string => {
    return `${wallet}|${chain}|${tokenType}`;
  }

  const parseKey = (key: string): [string, string, string] => {
    const [wallet, chain, tokenType] = key.split("|");
    return [wallet, chain, tokenType];
  }

  const getTotalAmount = (wallet: string, chain: string, tokenType: string): number => {
    if (receipts[getKey(wallet, chain, tokenType)] === undefined) {
      return 0;
    }
    return receipts[getKey(wallet, chain, tokenType)].reduce((acc, cur) => acc + cur.amount, 0);
  }

  const getReceiptInfoByWallet = useCallback((wallet: string): ReceiptInfo[] => {
    const keys = Object.keys(receipts).filter(key => key.startsWith(wallet));
    return keys.map(key => {
      const [_, chain, tokenType] = parseKey(key);
      return {
        chain,
        token: tokenType,
        amount: getTotalAmount(wallet, chain, tokenType),
      };
    });
  }, [receipts]);

  const addReceipt = (value: string, amount: number, wallet: string, chain: string, tokenType: string) => {
    const key = getKey(wallet, chain, tokenType);
    const receiptsCopy = { ...receipts };
    if (receiptsCopy[key] === undefined) {
      receiptsCopy[key] = [];
    }
    receiptsCopy[key].push({ value, amount });
    receiptsCopy[key].sort((a, b) => b.amount - a.amount);
    setReceipts(receiptsCopy);
  }

  // gets the amount the user can send in one transaction
  const getTop8Amount = (wallet: string, chain: string, tokenType: string): number => {
    return receipts[getKey(wallet, chain, tokenType)].slice(0, 8).reduce((acc, cur) => acc + cur.amount, 0);
  }

  const getTop8ReceiptsInfoByWallet = useCallback((wallet: string): ReceiptInfo[] => {
    const keys = Object.keys(receipts).filter(key => key.startsWith(wallet));
    return keys.map(key => {
      const [_, chain, tokenType] = parseKey(key);
      return {
        chain,
        token: tokenType,
        amount: getTop8Amount(wallet, chain, tokenType),
      };
    });
  }, [receipts]);

  const popTopReceipts = (wallet: string, chain: string, tokenType: string): Receipt[] => {
    const key = getKey(wallet, chain, tokenType);
    const receiptsCopy = { ...receipts };
    const top8 = receiptsCopy[key].splice(0, 8);
    setReceipts(receiptsCopy);
    return top8;
  }

  return {
    getReceiptInfoByWallet,
    addReceipt,
    getTotalAmount,
    getTop8Amount,
    getTop8ReceiptsInfoByWallet,
    popTopReceipts,
  };
}

export default useReceipts;
