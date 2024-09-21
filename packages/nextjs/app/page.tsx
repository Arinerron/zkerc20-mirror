"use client";

import React, { use, useContext } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount, useConnect } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { injected } from 'wagmi/connectors'
import { useEffect, useState } from 'react'
import { tokens } from './tokens'
import { Receipts, TokenType } from './receipts';
import { chains } from './chains'
import { ZKBalance } from './ZkercBalance'
import useReceipts from './useReceipts'


enum Tab {
  Lock = 'Lock', // converting raw token to encrypted data
  Transfer = 'Transfer',
  CashOut = 'CashOut',
}

interface InputProps {
  label: string;
  type: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const Input: React.FC<InputProps> = ({ label, type, value, onChange, className }) => {
  return (
    <div className={`relative z-0 w-full my-3 group ${className}`}>
      <input type={type} name={label} id={label} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required
        onChange={onChange}
        value={value}
      />
      <label className="absolute text-xs text-gray-500 duration-300 transform -translate-y-6 top-3 -z-10 origin-[0] peer-placeholder-shown:text-sm peer-placeholder-shown:translate-y-0 peer-focus:text-xs peer-focus:-translate-y-6">{label}</label>
    </div>
  )
}

const LockTab = () => {
  const [token, setToken] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const { addReceipt } = useReceipts();
  const { address: walletAddress } = useAccount();

  const lockTokens = () => {
    console.log(`locking ${amount} of ${token}`)
    addReceipt("some hash", amount, walletAddress!, chains[0].chainId.toString(), token);
  }

  const options = tokens.map(token => <option key={token.address} value={token.address}>{token.name}</option>)

  const buttonStyle = "mt-auto bg-transparent text-blue-700 font-semibold py-2 px-4 border border-blue-500 rounded"
  const buttonEnabledStyle = `${buttonStyle} hover:bg-blue-500 hover:text-white hover:border-transparent`
  const buttonStyleDisabled = `${buttonStyle} opacity-50 cursor-not-allowed`

  if (!walletAddress) {
    return <div> Loading...</div>
  }

  return (
    <div className="w-full mb-6 flex flex-col">
      <label className="block mt-2 mb-1 text-xs text-gray-500 ">
        Token
      </label>
      <select
        id="tokens"
        value={token}
        onChange={e => setToken(e.target.value)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      >
        <option value="" disabled>
          Choose a token
        </option>
        {options}
      </select>

      <div className="mt-5">
        <Input label="Amount" type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} />
      </div>

      <button 
        className={token === "" || amount === 0 ? buttonStyleDisabled : buttonEnabledStyle}
        onClick={lockTokens}
        disabled={token === "" || amount === 0}
      >
        ZK-fy
      </button>
    </div>
  )
}

const TransferTab = () => {
  const [sendingChain, setSendingChain] = useState<string>("")
  const [receivingChain, setReceivingChain] = useState<string>("")
  const [token, setToken] = useState<string>(""); // token address
  const [amount, setAmount] = useState(0);
  const [receivingAddress, setReceivingAddress] = useState<string>("");
  const [amountAvailable, setAmountAvailable] = useState(0);

  const receipts = useContext(ReceiptContext);

  const { address } = useAccount();
  console.log('mywallet', address);

  const tokenOptions = tokens.map(token => <option key={token.address} value={token.address}>{token.name}</option>)
  const chainOptions = chains.map(chain => <option key={chain.chainId} value={chain.chainId}>{chain.name}</option>)

  useEffect(() => {
    if (!address || !sendingChain || !token || receipts === null) {
      return;
    }

  }, [address, sendingChain, receivingChain, token, receipts]);

  const transfer = () => {
    console.log(`transferring ${amount} ${token} from ${sendingChain} to ${receivingChain}'s address ${receivingAddress}`)
  }

  const buttonStyle = "mt-auto bg-transparent text-blue-700 font-semibold py-2 px-4 border border-blue-500 rounded"
  const buttonEnabledStyle = `${buttonStyle} hover:bg-blue-500 hover:text-white hover:border-transparent`
  const buttonStyleDisabled = `${buttonStyle} opacity-50 cursor-not-allowed`


  return (
    <div className="w-full mb-6 flex flex-col">
      <label className="block mt-2 mb-1 text-xs text-gray-500">
        Sender chain
      </label>
      <select
        id="sendingchains"
        value={sendingChain}
        onChange={e => setSendingChain(e.target.value)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      >
        <option value="" disabled>
          Choose a sending chain
        </option>
        {chainOptions}
      </select>

      <label className="block mt-2 mb-1 text-xs text-gray-500">
        Receiving chain
      </label>
      <select
        id="receivingchains"
        value={receivingChain}
        onChange={e => setReceivingChain(e.target.value)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      >
        <option value="" disabled>
          Choose a receiving chain
        </option>
        {chainOptions}
      </select>


      <div className="flex">
        <div className="w-1/2">
          <label className="block mt-2 mb-1 text-xs text-gray-500">
            Token
          </label>
          <select
            id="tokens"
            value={token}
            onChange={e => setToken(e.target.value)}
            className="mb-6 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-4/5 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          >
            <option value="" disabled>
              Choose
            </option>
            {tokenOptions}
          </select>
        </div>
        <div className="mt-3 w-1/2">
          <Input label="Amount" type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))}/>
        </div>
      </div>

      <Input label="Receiving address" type="string" value={receivingAddress} onChange={(e) => setReceivingAddress(e.target.value)} className="my-0"/>

      <button 
        className={[token, sendingChain, receivingChain, receivingAddress, amount].includes("") ? buttonStyleDisabled : buttonEnabledStyle}
        onClick={transfer}
        disabled={[token, sendingChain, receivingChain, receivingAddress, amount].includes("")}
      >
        Transfer
      </button>
    </div>
  )
}

const CashOutTab = () => {
  const [chain, setChain] = useState<string>("")
  const [token, setToken] = useState<string>(""); // token address
  const [amount, setAmount] = useState(0);
  const [amountAvailable, setAmountAvailable] = useState(0);

  const receipts = useContext(ReceiptContext);

  const { address } = useAccount();
  console.log('mywallet', address);

  const tokenOptions = tokens.map(token => <option key={token.address} value={token.address}>{token.name}</option>)
  const chainOptions = chains.map(chain => <option key={chain.chainId} value={chain.chainId}>{chain.name}</option>)

  useEffect(() => {
    if (!address || !chain || !token || receipts === null) {
      return;
    }

    const available = receipts.getTotalAmount(address, chain, token);
    setAmountAvailable(available);
    console.log(`available receipts in chain ${chain} and token ${token}`, available);
  }, [address, chain, token, receipts]);

  const cashOut = () => {
    console.log(`cashing out ${amount} of ${token} on chain ${chain}`)
  }

  const buttonStyle = "mt-auto bg-transparent text-blue-700 font-semibold py-2 px-4 border border-blue-500 rounded"
  const buttonEnabledStyle = `${buttonStyle} hover:bg-blue-500 hover:text-white hover:border-transparent`
  const buttonStyleDisabled = `${buttonStyle} opacity-50 cursor-not-allowed`


  return (
    <div className="w-full mb-6 flex flex-col">
      <label className="block mt-2 mb-1 text-xs text-gray-500">
        Chain
      </label>
      <select
        id="chains"
        value={chain}
        onChange={e => setChain(e.target.value)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      >
        <option value="" disabled>
          Choose a chain
        </option>
        {chainOptions}
      </select>



      <label className="block mt-2 mb-1 text-xs text-gray-500">
        Token
      </label>
      <select
        id="tokens"
        value={token}
        onChange={e => setToken(e.target.value)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      >
        <option value="" disabled>
          Choose a token
        </option>
        {tokenOptions}
      </select>

      <div className="mt-5">
        <Input label="Amount" type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} />
      </div>

      <button 
        className={(token === "" || chain === "" || amount === 0) ? buttonStyleDisabled : buttonEnabledStyle}
        onClick={cashOut}
        disabled={(token === "" || chain === "" || amount === 0)}
      >
        Cash out
      </button>
    </div>
  )
}

export const ReceiptContext = React.createContext<Receipts|null>(null);

const Home: NextPage = () => {
  const [activeTab, setActiveTab] = useState(Tab.Lock);
  const [receiptsObj, setReceiptsObj] = useState<any>(null);
  const { address } = useAccount();

  const receiptsInited = new Receipts(localStorage);
  // receiptsInited.addReceipt("some hash 1", 88, address ?? "1", chains[0].chainId.toString(), tokens[1].address);
  // receiptsInited.addReceipt("some hash 2", 5, address ?? "1", chains[2].chainId.toString(), tokens[3].address);
  // receiptsInited.addReceipt("some hash 3", 10, address ?? "1", chains[4].chainId.toString(), tokens[2].address);

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
  };


  return (
    <ReceiptContext.Provider value={receiptsInited}>
      <div className="flex justify-center pt-10 items-stretch">
        {/* main square thing */}
      <div className="mx-2">
        
        <div className="w-96">
          {/* tabs */}
          <div className="w-full">
            <div className="relative right-0">
              <ul className="relative flex flex-wrap px-1.5 py-1.5 list-none rounded-t-md bg-slate-100" role="list">
                <li className="flex-auto text-center">
                  <a
                    className={`flex items-center justify-center w-full px-0 py-2 text-sm mb-0 transition-all ease-in-out rounded-md cursor-pointer ${
                      activeTab === Tab.Lock ? 'bg-white text-slate-700' : 'bg-inherit text-slate-600'
                    }`}
                    role="tab"
                    aria-selected={activeTab === Tab.Lock}
                    onClick={() => handleTabClick(Tab.Lock)}
                  >
                    ZK-fy
                  </a>
                </li>
                <li className="flex-auto text-center">
                  <a
                    className={`flex items-center justify-center w-full px-0 py-2 text-sm mb-0 transition-all ease-in-out rounded-md cursor-pointer ${
                      activeTab === Tab.Transfer ? 'bg-white text-slate-700' : 'bg-inherit text-slate-600'
                    }`}
                    role="tab"
                    aria-selected={activeTab === Tab.Transfer}
                    onClick={() => handleTabClick(Tab.Transfer)}
                  >
                    Transfer
                  </a>
                </li>
                <li className="flex-auto text-center">
                  <a
                    className={`flex items-center justify-center w-full px-0 py-2 mb-0 text-sm transition-all ease-in-out rounded-lg cursor-pointer ${
                      activeTab === Tab.CashOut ? 'bg-white text-slate-700' : 'bg-inherit text-slate-600'
                    }`}
                    role="tab"
                    aria-selected={activeTab === Tab.CashOut}
                    onClick={() => handleTabClick(Tab.CashOut)}
                  >
                    Cash out
                  </a>
                </li>
              </ul>
            </div>
          </div>


          <div className='w-full bg-slate-100 h-96 flex px-6'>
              {activeTab === Tab.Transfer && <TransferTab />}
              {activeTab === Tab.Lock && <LockTab />}
              {activeTab === Tab.CashOut && <CashOutTab />}
          </div>
        </div>


      </div>

      <ZKBalance />
      </div>
    </ReceiptContext.Provider>
  );
};

export default Home;
