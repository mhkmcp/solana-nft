import React from 'react'
import {
    clusterApiUrl,
    Connection,
    PublicKey,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    sendAndConfirmTransaction
} from '@solana/web3.js';

import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    transfer,
    Account,
    getMint,
    getAccount,
    createSetAuthorityInstruction,
    AuthorityType
} from '@solana/spl-token';

window.Buffer = window.Buffer || require("buffer").Buffer;

function MintNFT() {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const fromWallet = Keypair.generate();
    let mint: PublicKey;
    let fromTokenAccount: Account;

    async function createNFT() {
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
            0        // only allow whole tokens
        );
        console.log(`Create NFT: ${mint.toBase58()}`);

        fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            fromWallet,
            mint,
            fromWallet.publicKey,
        );
        console.log(`Create NFT Token: ${fromTokenAccount.address.toBase58()}`);
    }


    async function mintNFT() {
        const signature = await mintTo(
            connection,
            fromWallet,
            mint,
            fromTokenAccount.address,
            fromWallet.publicKey,
            1
        )
        console.log(`Mint NFT signature: ${signature}`);
    }

    async function lockNFT() {
        // Create our transaction to change minting permissions
        let transaction = new Transaction().add(createSetAuthorityInstruction(
            mint,
            fromWallet.publicKey,
            AuthorityType.MintTokens,
            null
        ));

        // Send transaction
        const signature = await sendAndConfirmTransaction(connection, transaction, [fromWallet]);
        console.log(`Lock NFT signature ${signature}`);
    }


    return (
        <div>
            <h2>Mint NFT Section</h2>
            <button onClick={createNFT}>Create NFT</button>
            <button onClick={mintNFT}>Mint NFT</button>
            <button onClick={lockNFT}>Lock Token</button>
        </div>
    )
}

export default MintNFT;

