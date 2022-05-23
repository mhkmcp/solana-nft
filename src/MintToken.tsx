import React from 'react'
import {
    clusterApiUrl,
    Connection,
    PublicKey,
    Keypair,
    LAMPORTS_PER_SOL
} from '@solana/web3.js'
import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    transfer,
    Account,
    getMint,
    getAccount

} from '@solana/spl-token'

window.Buffer = window.Buffer || require("buffer").Buffer;

function MintToken() {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const fromWallet = Keypair.generate();
    let mint: PublicKey;
    let fromTokenAccount: Account;
    const toWallet = new PublicKey("Ewk26iuGZ1gDZJsC8jEhUxJtvfdwW3t62q16tmTFTGZQ");

    async function createToken() {
        const fromAirdropSignature = await connection.requestAirdrop(
            fromWallet.publicKey,
            LAMPORTS_PER_SOL
        )
        await connection.confirmTransaction(fromAirdropSignature);

        mint = await createMint(
            connection,
            fromWallet,
            fromWallet.publicKey,
            null,
            9       // means we have decimal of 9 0's
        );
        console.log(`Create token: ${mint.toBase58()}`);

        fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            fromWallet,
            mint,
            fromWallet.publicKey,
        );
        console.log(`Create Token Account: ${fromTokenAccount.address.toBase58()}`);
    }

    async function mintToken() {
        const signature = await mintTo(
            connection,
            fromWallet,
            mint,
            fromTokenAccount.address,
            fromWallet.publicKey,
            10000000000     // 10 billion
        )
        console.log(`Mint Signature: ${signature}`);
    }

    async function checkBalance() {
        const mintInfo = await getMint(connection, mint);
        console.log(mintInfo.supply);

        const tokenAccountInfo = await getAccount(connection, fromTokenAccount.address);
        console.log(tokenAccountInfo.amount);
    }

    async function sendToken() {
        const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toWallet)
        console.log(`toTokenAccount: ${toTokenAccount}`);
        const signature = await transfer(
            connection,
            fromWallet,
            fromTokenAccount.address,
            toTokenAccount.address,
            fromWallet.publicKey,
            1000000000      // 1 bn
        );
        console.log(`finished transfer with ${signature}`);
    }


    return (
        <div>
            <h2>Mint Token</h2>
            <button onClick={createToken}>Create Token</button>
            <button onClick={mintToken}>Mint Token</button>
            <button onClick={checkBalance}>Check Balance</button>
            <button onClick={sendToken}>Send Token</button>
        </div>
    )
}

export default MintToken