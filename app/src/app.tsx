import React, { useEffect, useState } from 'react';
import { ContractService } from './services/contract-service';
import { useAsyncWorker } from './utils/hooks';

export const App = () => {

  const [isSetup, setIsSetup] = useState(false);

  const [contractAddress, setContractAddress] = useState(undefined as undefined | string);
  const [userAddress, setUserAddress] = useState(undefined as undefined | string);
  const [balance, setBalance] = useState(0);

  const {loading, error, doWork} = useAsyncWorker(); 

  useEffect(()=>{
    // doWork(async (stopIfUnmounted)=>{

    //   await ContractService.setup();
    //   const resultContractAddress = await ContractService.getContractAddress();
    //   const resultUserAddress = await ContractService.getUserAddress();
    //   stopIfUnmounted();

    //   setContractAddress(resultContractAddress);
    //   setUserAddress(resultUserAddress);

    //   // Get balance
    //   const balanceResult = await ContractService.getBalance();
    //   setBalance(balanceResult);
    // });
  },[]);

  const setup = () => {
    if(!contractAddress){ return; }

    doWork(async (stopIfUnmounted)=>{

      await ContractService.setup(contractAddress);
      const resultContractAddress = await ContractService.getContractAddress();
      const resultUserAddress = await ContractService.getUserAddress();
      stopIfUnmounted();

      setContractAddress(resultContractAddress);
      setUserAddress(resultUserAddress);

      // Get balance
      const balanceResult = await ContractService.getBalance();
      setBalance(balanceResult);

      setIsSetup(true);
    });
  };

  const originate = () => {
    doWork(async (stopIfUnmounted)=>{

      const result = await ContractService.originate();
      stopIfUnmounted();

      setContractAddress(result);
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

      {!isSetup && (
        <>
            <h3>Enter Contract Address</h3>
            <input type={'text'} value={contractAddress} onChange={x => setContractAddress(x.target.value)} />
            <button onClick={setup}>Setup</button>
        </>
      )}
      {isSetup && (
        <>
          <h3>User</h3>
          <div>user address: {userAddress}</div>

          <h3>Contract Address</h3>
          <div>contract: {contractAddress}</div>

          {/* <h3>Contract</h3> 
          <button onClick={originate}>Originate</button> */}

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
