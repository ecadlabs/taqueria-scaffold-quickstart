import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from "@taquito/beacon-wallet";
import { ExampleCode } from '../types/example.code';
import { ExampleContractType } from '../types/example.types';
import { tas } from '../types/type-aliases';

const createContractService = () => {
    // localhost:4242 - flextesa local network
    // const Tezos = new TezosToolkit(`http://localhost:20000`);

    // Using proxy
    const Tezos = new TezosToolkit(`/`);


    const state = {
        userAddress: undefined as undefined | string,
        contractAddress: undefined as undefined | string,
        contract: undefined as undefined | ExampleContractType,
    };

    const setup = async (contractAddress: string) => {
        const wallet = new BeaconWallet({
            name: "Example Wallet",
            // preferredNetwork: 'hangzhounet'
        });
        state.userAddress = await wallet.getPKH();

        Tezos.setWalletProvider(wallet);
        //state.contractAddress = 'KT1VbxGBSwPeGWu8WtmCpTFSyqwJQMPiLVpn';
        state.contractAddress = contractAddress;

        state.contract = await Tezos.contract.at<ExampleContractType>(state.contractAddress);

        console.log('setup', {state});
    };

    const service = {
        setup,
        getUserAddress: async () => state.userAddress,
        getContractAddress: async () => state.contractAddress,
        originate: async () : Promise<string> => {
            if(state.contractAddress){ throw new Error(`Contract already originated at ${state.contractAddress}`); }

            // Originate contract
            const origination = await Tezos.contract.originate<ExampleContractType>({
                code: ExampleCode.code,
                storage: tas.int(42),
            });
            // Wait for confirmations
            const contract = await origination.contract(5);
            // Store address
            state.contractAddress = contract.address;

            return state.contractAddress;
        },
        getBalance: async () : Promise<number> => {
            if(!state.contract){ throw new Error('Contract is not setup'); }

            const storage = await state.contract.storage();
            console.log('getBalance storage', {storage});
            return tas.number(storage);
        },
        increment: async (amount: number): Promise<number> => {
            if(!state.contract){ throw new Error('Contract is not setup'); }

            const sendResult = await state.contract.methodsObject.increment(tas.int(amount)).send();
            await sendResult.confirmation(5);

            // Read state after update
            return service.getBalance();
        },
        decrement: async (amount: number): Promise<number> => {
            if(!state.contract){ throw new Error('Contract is not setup'); }

            const sendResult = await state.contract.methodsObject.decrement(tas.int(amount)).send();
            await sendResult.confirmation(5);

            // Read state after update
            return service.getBalance();
        },

    };

    return service;
};  

export const ContractService = createContractService();