import React, { useEffect, useState } from 'react';
import { ContractService } from './services/contract-service';
import { useAsyncWorker } from './utils/hooks';

export const App = () => {

  const [isWalletReady, setIsWalletReady] = useState(false);
  const [isContractReady, setIsContractReady] = useState(false);

  const [userAddress, setUserAddress] = useState(undefined as undefined | string);
  const [contractAddress, setContractAddress] = useState(undefined as undefined | string);
  const [balance, setBalance] = useState(0);

  const {loading, error, doWork} = useAsyncWorker(); 

  const connectWallet = () => {
    doWork(async (stopIfUnmounted)=>{
      await ContractService.connectWallet();
      const resultUserAddress = await ContractService.getUserAddress();
      stopIfUnmounted();
      setUserAddress(resultUserAddress);
      setIsWalletReady(true);
    });
  };

  const loadData = async (stopIfUnmounted: () => void) => {
    const resultContractAddress = await ContractService.getContractAddress();
    stopIfUnmounted();

    setContractAddress(resultContractAddress);

    // Get balance
    const balanceResult = await ContractService.getBalance();
    stopIfUnmounted();
    setBalance(balanceResult);

    setIsContractReady(true);
  };

  const loadContract = () => {
    if(!contractAddress){ return; }

    doWork(async (stopIfUnmounted)=>{
      await ContractService.loadContract(contractAddress);
      await loadData(stopIfUnmounted);
    });
  };

  const originateContract = () => {
    doWork(async (stopIfUnmounted)=>{
      await ContractService.originateContract();
      await loadData(stopIfUnmounted);
    });
  };
  const increment = () => {
    doWork(async (stopIfUnmounted)=>{

      const result = await ContractService.increment(1);
      stopIfUnmounted();

      setBalance(result);
    });
  };
  const decrement = () => {
    doWork(async (stopIfUnmounted)=>{

      const result = await ContractService.decrement(1);
      stopIfUnmounted();

      setBalance(result);
    });
  };

  return (
    <div className='app'>
      {loading && (<div>loading...</div>)}
      {error && (<div className='error'>{error.message}</div>)}

      {!isWalletReady && (
        <>
            <h3>Connect Wallet</h3>
            <button onClick={connectWallet}>Connect</button>
        </>
      )}
      {isWalletReady && (
        <>
          <h3>User</h3>
          <div>user address: {userAddress}</div>
        </>
      )}
      
      {isWalletReady && !isContractReady && (
        <>
            <h3>Enter Existing Contract Address</h3>
            <input type={'text'} value={contractAddress} onChange={x => setContractAddress(x.target.value)} />
            <button onClick={loadContract}>Load Contract</button>

            <h3>Deploy (Originate) New Contract</h3>
            <button onClick={originateContract}>Deploy Contract</button>
        </>
      )}
      {isWalletReady && isContractReady && (
        <>
          <h3>Contract Address</h3>
          <div>contract: {contractAddress}</div>

          <h3>Contract State</h3>
          <div>balance: {balance}</div>

          <h3>Contract Methods</h3>
          <button onClick={increment}>Add</button>
          <button onClick={decrement}>Subtract</button>
        </>
      )}

    </div>
  );
}
