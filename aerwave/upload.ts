import * as fs from "fs";
import { Keypair, } from '@solana/web3.js';
import { StorageType } from "./helpers/storage-type";
import { makeArweaveBundleUploadGenerator } from "./aerwave-bundle";


const loadWalletKey = (keypair: any) => {
    if (!keypair || keypair == '') {
        throw new Error('Keypair is required!');
    }
    return Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(keypair).toString())),
    );
}

async function uploadBundle(keypair: string, env: string, rpc: string, dirname: string) {
    const files = fs.readdirSync(dirname).map(e => ({
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
        100,
    );
    let result = arweaveBundleUploadGenerator.next();
    while (!result.done) {
        const data = await result.value
        result = arweaveBundleUploadGenerator.next();
    }

}

export default uploadBundle