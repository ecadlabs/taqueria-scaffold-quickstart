import { TezosToolkit } from '@taquito/taquito';
import { ExampleCode } from '../types/example.code';
import { ExampleContractType } from '../types/example.types';
import { tas } from '../types/type-aliases';

const createContractService = () => {
    // localhost:4242 - flextesa local network
    const Tezos = new TezosToolkit(`http://localhost:4242`);

    const state = {
        contractAddress: undefined as undefined | string,
    };

    const service = {
        originate: async () => {
            // Originate contract
            const origination = await Tezos.contract.originate<ExampleContractType>({
                code: ExampleCode.code,
                storage: {
                    // Set initial value
                    "0": tas.int(42),
                },
            });
            // Wait for confirmations
            const contract = await origination.contract(5);
            // Store address
            state.contractAddress = contract.address;
        },
        getBalance: async () : Promise<number> => {
            if(!state.contractAddress){ throw new Error('Contract not originated yet'); }

            const contract = await Tezos.contract.at<ExampleContractType>(state.contractAddress);
            const storage = await contract.storage();
            return tas.number(storage[0]);
        },
        increment: async (amount: number): Promise<number> => {
            if(!state.contractAddress){ throw new Error('Contract not originated yet'); }

            const contract = await Tezos.contract.at<ExampleContractType>(state.contractAddress);
            const sendResult = await contract.methodsObject.increment(tas.int(amount)).send();
            await sendResult.confirmation(5);

            // Read state after update
            return service.getBalance();
        },
        decrement: async (amount: number): Promise<number> => {
            if(!state.contractAddress){ throw new Error('Contract not originated yet'); }

            const contract = await Tezos.contract.at<ExampleContractType>(state.contractAddress);
            const sendResult = await contract.methodsObject.decrement(tas.int(amount)).send();
            await sendResult.confirmation(5);

            // Read state after update
            return service.getBalance();
        },

    };

    return service;
};  

export const ContractService = createContractService();