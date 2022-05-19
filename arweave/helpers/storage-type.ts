import * as path from "path";
import * as fs from "fs";

type Manifest = {
    image: string;
    animation_url: string;
    name: string;
    symbol: string;
    seller_fee_basis_points: number;
    properties: {
        files: Array<{ type: string; uri: string }>;
        creators: Array<{
            address: string;
            share: number;
        }>;
    };
};

export enum StorageType {
    ArweaveBundle = 'arweave-bundle',
    ArweaveSol = 'arweave-sol',
    Arweave = 'arweave',
    Ipfs = 'ipfs',
    Aws = 'aws',
    NftStorage = 'nft-storage',
    Pinata = 'pinata',
}

export type AssetKey = { mediaExt: string; index: string };

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function getAssetManifest(dirname: string, assetKey: string): Manifest {
    const assetIndex = assetKey.includes('.json')
        ? assetKey.substring(0, assetKey.length - 5)
        : assetKey;
    const manifestPath = path.join(dirname, `${assetIndex}.json`);
    const manifest: Manifest = JSON.parse(
        fs.readFileSync(manifestPath).toString(),
    );
    manifest.image = manifest.image.replace('image', assetIndex);

    if ('animation_url' in manifest) {
        manifest.animation_url = manifest.animation_url.replace(
            'animation_url',
            assetIndex,
        );
    }
    return manifest;
}