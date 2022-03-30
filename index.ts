import { program } from 'commander';
import log from 'loglevel';
import uploadBundle from "./aerwave/upload";
import { writeFileSync } from "fs";
import generateNewMetadata from "./metadata/generateNewMetadata";

log.setLevel('info');
program.version('1.1.0');
const DEFAULT_ENV = "devnet"
const RPC_URL = "https://api.devnet.solana.com"

function programCommand(name: string) {
    return program
        .command(name)
        .option(
            '-e, --env <string>',
            'Solana cluster env name',
            DEFAULT_ENV, //mainnet-beta, testnet, devnet
        )
        .option(
            '-k, --keypair <path>',
            `Solana wallet location`,
            '--keypair not provided',
        ).option(
            '-r, --rpc <string>',
            `Solana rpc`,
            RPC_URL
        ).option(
            '-o, --output <path>',
            'Output file',
            'result'
        );
}


// @ts-ignore
programCommand('upload-to-aerwave')
    .option('-d, --dirname <string>', 'local path', "assets")
    .action(async (directory: string, cmd: any) => {
        const { keypair, env, rpc, dirname, output } = cmd.opts();
        const result = await uploadBundle(keypair as string, env as string, rpc as string, dirname as string)
        writeFileSync(output, JSON.stringify(result))
    })

programCommand('generate-new-metadata')
    .option('-m, --mints-path <string>', 'json mints file', "./mints.json")
    .option('-b, --batch-size <number>', 'batch size', "10")
    .action(async (directory: string, cmd: any) => {
        const { mintsPath, batchSize, rpc, output } = cmd.opts();
        await generateNewMetadata(mintsPath, batchSize as number, rpc)
        console.log("Data created successfully")
    })

program.parse(process.argv);