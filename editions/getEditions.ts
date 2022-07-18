import { MasterEdition, Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { Connection, PublicKey, TokenBalance } from "@solana/web3.js";
import * as anchor from '@project-serum/anchor'
import fs, { readdirSync, readFileSync } from "fs";
import { resolveManyRequest } from "../utils";
function sleep(ms : number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export const getEditions = async ({ rpc, mint, supply }: { rpc: string, mint: string, supply: number }) => {
    const connection = new anchor.web3.Connection(rpc);
    const master_edition = await MasterEdition.getPDA(new PublicKey(mint))
    const editionsMints: string[] = []
    const transactions: Array<string|undefined> = []
    let lastSig: string | undefined = "2LL9udjeoUaxcP1cuGdKmcNafuTGJXVJTShUs6aEF2Fq8bSpvbAox84jo5Wq4ARAQR49w2RAYKzDjxo2UAAXZtaY"
    while (editionsMints.length < supply) {
        console.log(editionsMints.length)
        const fetched = await connection.getConfirmedSignaturesForAddress2(
            new PublicKey("G6ifCoT3PZWT156oBtjmupGNT8Ss4LcAET9ybVW88UYx"),
            {
                limit: 1,
                before: lastSig
            }
        ) as any;
        if (fetched && fetched.length > 0) {
            lastSig = fetched[fetched.length - 1].signature
            const nonErrorTx = fetched.filter((f: { err: any; }) => !f?.err)
            if (nonErrorTx) {
                await sleep(2000);
                const parsedTxs = await connection.getParsedTransactions(nonErrorTx.map((tx: { signature: any; }) => tx.signature)) as any;
                for (let i = 0; i < parsedTxs.length; i++) {
                    const txOnInx = parsedTxs[i]
                    if (txOnInx !== null) {
                        //console.log(txOnInx, "<<<<<<<--------")
                        const messages = txOnInx.meta?.logMessages || [];
                        let mintNew = false;
                        let specialMint = false;
                        if (messages.includes("Program log: Instruction: MintNft") && messages.includes("Program log: Instruction: Burn")){
                            mintNew = true
                            transactions.push(lastSig)
                        }
                        // for (const message of messages) {
                        //      if (message.includes("Burn")){
                        //         console.log(message, "Burn")
                        //     }
                        //     if (message.toLowerCase().includes("Instruction: MintNft".toLowerCase())) {
                        //         mintNew = true
                        //     } else if(message.toLowerCase().includes("Candy machine is empty!, Candy Machine Botting is taxed at 10000000 lamports".toLowerCase())) {
                        //         mintNew = false
                        //     }
                        // }
                        if (mintNew) {
                            const postBalances = txOnInx?.meta?.postTokenBalances as Array<any> || [] as Array<any>;
                            let preBalanceMap: { [index: number]: TokenBalance } = {};
                            const preBalances = txOnInx?.meta?.preTokenBalances as Array<any> || [] as Array<any>;
                            preBalances.forEach(
                                (balance) => (preBalanceMap[balance.accountIndex] = balance)
                            );
                            let account = postBalances.find(e => e.mint !== mint && e.mint !== "So11111111111111111111111111111111111111112") as any
                            /*for (const index in postBalances) {
                                const postBalance = postBalances[index];
                                if(["GpxDPR7oXKDaFisiaDfBbhHB5if5WWg2wjn5pVXsiTmK", "2CN5iBu6sVNinowao2m1LfBAiAiyEJbm47qkn3HAYHzn", "Hkay768XjJwatmFSiozjLkWXXv5zgNWz62UYcdXXSELx"].includes(postBalance.mint)){
                                    console.log(postBalances, postBalance)
                                }
                                const preBalance = preBalanceMap[postBalance.accountIndex];
                                if (!preBalance) {
                                    const tokenMint = postBalance.mint
                                    const uiTokenAmount = postBalance.uiTokenAmount;
                                    const decimals = uiTokenAmount.decimals;
                                    if (tokenMint !== mint && decimals === 0) {
                                        const delta = parseInt(uiTokenAmount.amount)
                                        console.log(delta)
                                        if (delta === 1) {
                                            editionsMints.push(postBalance.mint)
                                        }
                                    }
                                }
                            }*/
                            if(account){
                                editionsMints.push(account.mint)
                            }else{
                                console.log(postBalances)
                            }
                        }
                    }
                }
            }
        } else {
            break
        }
    }

    const fs = require('fs');
    fs.writeFileSync("mintsoddkey.json", JSON.stringify(editionsMints, null, 4));
    fs.writeFileSync("transactions.json", JSON.stringify(transactions, null, 4));
    return editionsMints
}

const getNftOwner = async ({ connection, mint }: { connection: Connection, mint: String }) => {
    const pda = await Metadata.getPDA(new PublicKey(mint))
    const metadata = (await Metadata.load(connection as Connection, pda)).data
    return metadata.updateAuthority
}

export const getMastersEditionsOwners = async ({
                                                   masterEditionsFile,
                                                   rpc
                                               }: { masterEditionsFile: string, rpc: string }) => {
    const masterEditions = JSON.parse(readFileSync(masterEditionsFile).toString()) as Array<{ mint: string, supply: number }>
    const mints = (await resolveManyRequest(getEditions, masterEditions.map(e => ({
        ...e,
        rpc
    })), 10)).flat(1) as Array<string>
    const connection = new anchor.web3.Connection(rpc);
    const owners = (await resolveManyRequest(getNftOwner, mints.map(e => ({ mint: e, connection })), 20)) as Array<string>
    return {
        mints: mints,
        // @ts-ignore
        owners: [...new Set(owners)]
    }
}