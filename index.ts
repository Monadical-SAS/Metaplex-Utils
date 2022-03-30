import { program } from 'commander';
import log from 'loglevel';
import uploadBundle from "./aerwave/upload";
import { writeFileSync } from "fs";
import generateNewMetadata from "./metadata/generateNewMetadata";
import { CommandDocument } from "@mitsuru793/commander-document-generator";

log.setLevel('info');
program.version('1.1.0');
const DEFAULT_ENV = "devnet"  //mainnet-beta, testnet, devnet
const RPC_URL = "https://api.devnet.solana.com"

function programCommand(name: string) {
    return program
        .command(name)

        .option(
            '-r, --rpc <string>',
            `Solana rpc`,
            RPC_URL
        )
}


// @ts-ignore
programCommand('upload-to-aerwave')
    .description('Upload local dir to aerwave using SOL.')
    .option('-d, --dirname <string>', 'Local folder to read files', "assets")
    .option('-o, --output <path>', 'Output file', 'result.json')
    .option('-k, --keypair <path>', `Solana wallet location`, '--keypair not provided')
    .option('-e, --env <string>', 'Solana cluster env name', DEFAULT_ENV)
    .action(async (directory: string, cmd: any) => {
        const { keypair, env, rpc, dirname, output } = cmd.opts();
        const result = await uploadBundle(keypair as string, env as string, rpc as string, dirname as string)
        writeFileSync(output, JSON.stringify(result))
        console.log(`${output} file created successfully`)
    })

programCommand('generate-new-metadata')
    .description('Generate new metadata of giving mint list')
    .option('-m, --mints-path <string>', 'json mints file', "./mints.json")
    .option('-b, --batch-size <number>', 'batch size', "10")
    .action(async (directory: string, cmd: any) => {
        const { mintsPath, batchSize, rpc } = cmd.opts();
        await generateNewMetadata(mintsPath, batchSize as number, rpc)
        console.log("Data created successfully")
    })

const template = `
{{#commands}}
### {{name}} {{{args.0.display}}}
{{description}}
| Name    | Description    |
| ------- | -----------    |
{{#options}}
| {{{flags}}} |{{description}}    |
{{/options}}




{{/commands}}
`

const doc = CommandDocument.parse(program as any)
//console.log(doc.render(template))
program.parse(process.argv);