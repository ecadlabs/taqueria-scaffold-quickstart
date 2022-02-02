import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from "@taquito/beacon-wallet";
import { NetworkType } from "@airgap/beacon-sdk";
import { ExampleCode } from '../types/example.code';
import { ExampleContractType, ExampleWalletType } from '../types/example.types';
import { tas } from '../types/type-aliases';

const createContractService = () => {
    // localhost:4242 - flextesa local network
    // const Tezos = new TezosToolkit(`http://localhost:20000`);

    // // Flextesa
    // const network = { 
    //     // Use react dev server proxy
    //     rpcUrl:  `/`,
    //     type: NetworkType.CUSTOM,
    // };

    // Testnet
    const network = {
        type: NetworkType.HANGZHOUNET,
        rpcUrl: "https://hangzhounet.api.tez.ie"
    };

    const Tezos = new TezosToolkit(network.rpcUrl);

    const state = {
        isConnected: false,
        userAddress: undefined as undefined | string,
        userBalance: undefined as undefined | number,
        contractAddress: undefined as undefined | string,
        contract: undefined as undefined | ExampleWalletType,
    };

    const service = {
        getUserAddress: async () => state.userAddress,
        getUserBalance: async () => state.userBalance,
        getContractAddress: async () => state.contractAddress,
        connectWallet: async () => {
            console.log('connectWallet START');

            const wallet = new BeaconWallet({
                name: "Example Dapp",
            });
            await wallet.requestPermissions({ 
                network,
            });

            state.userAddress = await wallet.getPKH();
            Tezos.setWalletProvider(wallet);

            state.userBalance = (await Tezos.tz.getBalance(state.userAddress)).toNumber() / 1000000;

            state.isConnected = true;

            console.log('connectWallet DONE');
        },
        loadContract: async (contractAddress: string) => {
            if(!state.isConnected){ throw new Error('Not connected'); }
           
            state.contract = await Tezos.wallet.at<ExampleWalletType>(contractAddress);
            state.contractAddress = state.contract.address;
    
            console.log('setup', {state});
        },
        originateContract: async () => {
            if(!state.isConnected){ throw new Error('Not connected'); }

            // Originate contract
            const origination = await Tezos.wallet.originate<ExampleWalletType>({
                code: ExampleCode.code,
                storage: tas.int(42),
            }).send();

            console.log('Deploying contract... might take a bit...')
            state.contract = await origination.contract();
            state.contractAddress = state.contract.address;
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