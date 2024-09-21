import { tokens } from './tokens'

export type TokenType = string;

interface Receipt {
  value: string; // the hash
  amount: number;
}

interface ReceiptInfo {
  chain: string;
  token: string;
  amount: number;
}

export class Receipts {
  // key = wallet+chain+tokenType
  receipts: { [key: string]: Receipt[] } = {}; // sorted
  localStorage: Storage;

  constructor(localStorage: Storage) {
    this.localStorage = localStorage;
    this.receipts = JSON.parse(this.localStorage.getItem("receipts") ?? "{}");
  }

  private save() {
    this.localStorage.setItem("receipts", JSON.stringify(this.receipts));
  }

  private getKey(wallet: string, chain: string, tokenType: TokenType): string {
    return `${wallet}|${chain}|${tokenType}`;
  }

  private parseKey(key: string): [string, string, TokenType] {
    const [wallet, chain, tokenType] = key.split("|");
    return [wallet, chain, tokenType as TokenType];
  }

  // {chain, tokenAddress, amount}
  getReceiptInfoByWallet(wallet: string): ReceiptInfo[] {
    const keys = Object.keys(this.receipts).filter(key => key.startsWith(wallet));
    return keys.map(key => {
      const [_, chain, tokenType] = this.parseKey(key);
      return {
        chain,
        token: tokenType,
        amount: this.getTotalAmount(wallet, chain, tokenType),
      };
    });
  }
  
  addReceipt(value: string, amount: number, wallet: string, chain: string, tokenType: TokenType) {
    const key = this.getKey(wallet, chain, tokenType);
    if (this.receipts[key] === undefined) {
      this.receipts[key] = [];
    }
    this.receipts[key].push({ value, amount });
    this.receipts[key].sort((a, b) => b.amount - a.amount);
    this.save();
  }

  getTotalAmount(wallet: string, chain: string, tokenType: TokenType): number {
    if (this.receipts[this.getKey(wallet, chain, tokenType)] === undefined) {
      return 0;
    }
    return this.receipts[this.getKey(wallet, chain, tokenType)].reduce((acc, cur) => acc + cur.amount, 0);
  }

  // gets the amount the user can send in one transaction
  getTop8Amount(wallet: string, chain: string, tokenType: TokenType): number {
    return this.receipts[this.getKey(wallet, chain, tokenType)].slice(0, 8).reduce((acc, cur) => acc + cur.amount, 0);
  }

  // pops up to 8 receipts
  popTopReceipts(wallet: string, chain: string, tokenType: TokenType): Receipt[] {
    const key = this.getKey(wallet, chain, tokenType);
    const top8 = this.receipts[key].splice(0, 8);
    this.save();
    return top8;
  }
}
