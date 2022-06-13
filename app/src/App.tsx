import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, useAnchorWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import React, { FC, ReactNode, useMemo, useState, useRef } from 'react';
import idl from './idl.json';
import { Program, BN, Provider, web3 } from "@project-serum/anchor";

const stateAccount = web3.Keypair.generate();

export const App: FC = () => {
    return (
        <Context>
            <Content />
        </Context>
    );
};

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded.
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const Content: FC = () => {
    const [counter, setCounter] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const wallet = useAnchorWallet();

    if (!wallet) {
        return null;
    }
    const network = "http://127.0.0.1:8899";
    const connection = new Connection(network, "processed");

    const provider = new Provider(
        connection, wallet, {"preflightCommitment": "processed"},
    );

    if (!provider) {
        throw("Provider is null");
    }
    const a = JSON.stringify(idl);
    const b = JSON.parse(a);
    const program = new Program(b, idl.metadata.address, provider);
    
    async function initialize() {
        try {
            await program.rpc.initialize({
                accounts: {
                  state: stateAccount.publicKey,
                  user: program.provider.wallet.publicKey,
                  systemProgram: web3.SystemProgram.programId
                },
                signers: [stateAccount],
            });

            const state = await program.account.state.fetch(stateAccount.publicKey);
            console.log("counter: ", state.counter);
            setCounter(state.counter);
        } catch (err) {
            console.log("tx err: ", err);
        }
    }

    async function increment() {
        try {
            await program.rpc.increment({
                accounts: {
                  state: stateAccount.publicKey,
                },
            });

            const state = await program.account.state.fetch(stateAccount.publicKey);
            console.log("counter: ", state.counter);
            setCounter(state.counter);
        } catch (err) {
            console.log("tx err: ", err);
        }
    }

    async function decrement() {
        try {
            await program.rpc.decrement({
                accounts: {
                  state: stateAccount.publicKey,
                },
            });

            const state = await program.account.state.fetch(stateAccount.publicKey);
            console.log("counter: ", state.counter);
            setCounter(state.counter);
        } catch (err) {
            console.log("tx err: ", err);
        }
    }
    async function set() {
        try {
            if (inputRef.current == undefined) {
                throw("Invalid number");
            }
            const value = parseInt(inputRef.current.value);
            console.log("receive value:", value);
            await program.rpc.set(new BN(value), {
                accounts: {
                  state: stateAccount.publicKey,
                },
            });

            const state = await program.account.state.fetch(stateAccount.publicKey);
            console.log("counter: ", state.counter);
            setCounter(state.counter);
        } catch (err) {
            console.log("tx err: ", err);
        }
    }
    return (
        <>
            <WalletMultiButton />
            <button onClick={initialize}>Initialize</button>
            <button onClick={decrement}>Decrement</button>
            <button onClick={increment}>Increment</button>
            <button onClick={set}>Set</button>
            <input ref={inputRef} type="number"/>
            <div>Counter: {counter}</div>
        </>
    );
};
