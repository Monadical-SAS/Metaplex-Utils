import * as path from 'path';
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


export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

