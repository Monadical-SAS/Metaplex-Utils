import * as fs from "fs";
import { appendFileSync, readFileSync } from "fs";
import { Keypair, } from '@solana/web3.js';
import { StorageType } from "./helpers/storage-type";
import { makeArweaveBundleUploadGenerator, withdrawBundlr } from "./arweave-bundle";

type Response = {
    [key: string]: any
}

const loadWalletKey = (keypair: any) => {
    if (!keypair || keypair == '') {
        throw new Error('Keypair is required!');
    }
    return Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(keypair).toString())),
    );
}

async function uploadBundle(keypair: string, env: string, rpc: string, dirname: string, cache: string) {
    let inCacheFiles = {}
    for (const line of readFileSync(cache).toString().split("\n").filter(e => e)) {
        inCacheFiles = Object.assign(inCacheFiles, JSON.parse(line))
    }
    const files = fs.readdirSync(dirname).filter(e => !Object.keys(inCacheFiles).includes(e)).map(e => ({
        mediaExt: e.split('.')[1],
        index: e.split('.')[0]
    }))
    const walletKeyPair = loadWalletKey(keypair);
    const arweaveBundleUploadGenerator = makeArweaveBundleUploadGenerator(
        StorageType.ArweaveSol,
        dirname,
        files,
        walletKeyPair,
        env,
        undefined,
        1,
    );
    let result = arweaveBundleUploadGenerator.next();
    while (!result.done) {
        const responseData = {} as Response
        const data = await result.value
        for (let i = 0; i < data.cacheKeys.length; i++) {
            responseData[data.cacheKeys[i] as string] = data.arweavePathManifestLinks[i]
        }
        result = arweaveBundleUploadGenerator.next();
        appendFileSync(cache, JSON.stringify(responseData))
        appendFileSync(cache, "\n")
    }
    if (env != "devnet") {
        await withdrawBundlr(walletKeyPair)
    }
    let data = {}
    for (const line of readFileSync(cache).toString().split("\n").filter(e => e)) {
        data = Object.assign(data, JSON.parse(line))
    }
    return data
}

export default uploadBundle
