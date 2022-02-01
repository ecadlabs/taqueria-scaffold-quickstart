import React, { useState } from 'react';
import { ContractService } from './services/contract-service';
import { useAsyncWorker } from './utils/hooks';

export const App = () => {
  const [balance, setBalance] = useState(0);

  const {loading, error, doWork} = useAsyncWorker(); 
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
    <div>
      <h3>Contract Methods</h3>
      <button onClick={increment}>Add</button>
      <button onClick={decrement}>Subtract</button>

      <h3>Contract State</h3>
      <div>balance: {balance}</div>
    </div>
  );
}
