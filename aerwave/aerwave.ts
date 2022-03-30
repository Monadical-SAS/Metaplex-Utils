import * as anchor from '@project-serum/anchor';
import {PublicKey} from '@solana/web3.js';
// @ts-ignore
import { default as FormData } from "form-data";
import * as fs from 'fs';
import * as path from 'path';
import log from 'loglevel';
import fetch from 'node-fetch';
import {stat} from 'fs/promises';
import {calculate} from '@metaplex/arweave-cost';
import {sendTransactionWithRetryWithKeypair} from "./transactions";

const ARWEAVE_PAYMENT_WALLET = new PublicKey(
    '6FKvsq4ydWFci6nGq9ckbjYMtnmaqAoatz5c9XWjiDuS',
);
const ARWEAVE_UPLOAD_ENDPOINT =
    'https://us-central1-metaplex-studios.cloudfunctions.net/uploadFile';

async function fetchAssetCostToStore(fileSizes: number[]) {
    const result = await calculate(fileSizes);
    log.debug('Arweave cost estimates:', result);

    return result.solana * anchor.web3.LAMPORTS_PER_SOL;
}

async function upload(data: FormData, index) {
    log.debug(`trying to upload image ${index}`);
    return await (
        await fetch(ARWEAVE_UPLOAD_ENDPOINT, {
            method: 'POST',
            // @ts-ignore
            body: data,
        })
    ).json();
}

function estimateManifestSize(filenames: string[]) {
    const paths = {};

    for (const name of filenames) {
        paths[name] = {
            id: 'artestaC_testsEaEmAGFtestEGtestmMGmgMGAV438',
            ext: path.extname(name).replace('.', ''),
        };
    }

    const manifest = {
        manifest: 'arweave/paths',
        version: '0.1.0',
        paths,
        index: {
            path: 'metadata.json',
        },
    };

    const data = Buffer.from(JSON.stringify(manifest), 'utf8');
    log.debug('Estimated manifest size:', data.length);
    return data.length;
}

export async function arweaveUpload(
    walletKeyPair: any,
    anchorProgram: any,
    env: any,
    image: any,
    index: any,
) {
    const manifestBuffer = Buffer.from(JSON.stringify({"json": "json"}));

    const imageExt = path.extname(image);
    const fsStat = await stat(image);
    const storageCost = await fetchAssetCostToStore([
        fsStat.size,
    ]);
    console.log(`lamport cost to store ${image}: ${storageCost}`);

    const instructions = [
        anchor.web3.SystemProgram.transfer({
            fromPubkey: walletKeyPair.publicKey,
            toPubkey: ARWEAVE_PAYMENT_WALLET,
            lamports: storageCost,
        }),
    ];

    const tx = await sendTransactionWithRetryWithKeypair(
        anchorProgram.provider.connection,
        walletKeyPair,
        instructions,
        [],
        'confirmed',
    );
    console.log(`solana transaction (${env}) for arweave payment:`, tx);

    const data = new FormData();
    data.append('transaction', tx['txid']);
    data.append('env', env);
    data.append('file[]', fs.createReadStream(image), {
        filename: `${index}${imageExt}`,
        contentType: `image/${imageExt.replace('.', '')}`,
    });
    data.append('file[]', manifestBuffer, 'metadata.json');


    const result = await upload(data, index);
    console.log(result)
    const imageFile = result.messages?.find(
        m => m.filename === `${index}${imageExt}`,
    );
    const imageLink = `https://arweave.net/${imageFile.transactionId}?ext=${imageExt.replace('.', '')}`;
    return imageLink;
}
