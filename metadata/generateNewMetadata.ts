import { Connection } from "@solana/web3.js";
import axios from "axios";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { resolveManyRequest } from "../utils";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { withdrawBundlr } from "../arweave/arweave-bundle";

const FOLDER_NAME = "./assets"
type ChainMetadataParameters = {
    connection: Connection,
    mint: string
}
const retrieveOnChainMetadata = async ({ connection, mint }: ChainMetadataParameters) => {
    const pda = await Metadata.getPDA(mint)
    const onchain = (await Metadata.load(connection as Connection, pda)).data
    return { ...onchain.data, mint: mint }
}
const retrieveExternalMetadata = async (onchainMetadata: any) => {
    const metadataExternal = (await axios.get(onchainMetadata.uri)).data;
    return {
        onChainMetadata: onchainMetadata,
        arweaveMetadata: metadataExternal
    }
}
const generateNewMetadata = async (mintsPath: string, batchSize: number, rpc: string) => {
    const connection = new Connection(rpc)
    const mintsToReveal = JSON.parse(readFileSync(mintsPath).toString()) as Array<string>
    let items = await resolveManyRequest(retrieveOnChainMetadata, mintsToReveal.map(mint => ({
        connection,
        mint
    })), batchSize)
    items = await resolveManyRequest(retrieveExternalMetadata, items, batchSize)
    for (const item of items) {
        if (item.arweaveMetadata.name.replace(/\D/g, '').length === 0) {
            const newMetadata = { ...item.arweaveMetadata }
            newMetadata.properties.category = "video"
            newMetadata.properties.files = [
                {uri: item.image, type: "image/png"},
                {uri: item.animation_url, type: "video/mp4"},
            ]
            if (!existsSync(FOLDER_NAME)) {
                mkdirSync(FOLDER_NAME)
            }
            writeFileSync(`${FOLDER_NAME}/${item.onChainMetadata.mint}.json`, JSON.stringify(newMetadata));
        }
    }
}
export default generateNewMetadata
