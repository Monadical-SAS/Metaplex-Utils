import { program } from 'commander';
import log from 'loglevel';
import uploadBundle from "./arweave/upload";
import { writeFileSync } from "fs";
import generateNewMetadata from "./metadata/generateNewMetadata";
import { CommandDocument } from "@mitsuru793/commander-document-generator";
import { getEditions, getMastersEditionsOwners } from "./editions/getEditions";
import {cacheToJsonOutput} from "./arweave/helpers/cacheToJsonOutput";

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
programCommand('upload-to-arweave')
    .description('Upload local dir to arweave using SOL.')
    .option('-d, --dirname <string>', 'Local folder to read files', "assets")
    .option('-o, --output <path>', 'Output file', 'result.json')
    .option('-k, --keypair <path>', `Solana wallet location`, '--keypair not provided')
    .option('-e, --env <string>', 'Solana cluster env name', DEFAULT_ENV)
    .option('-c, --cache <string>', 'Cache file', "cache")
    .action(async (directory: string, cmd: any) => {
        const { keypair, env, rpc, dirname, output, cache } = cmd.opts();
        const cacheContent = await uploadBundle(
            keypair as string,
            env as string,
            rpc as string,
            dirname as string,
            cache as string
        )

        const outputJson = cacheToJsonOutput(cacheContent);
        writeFileSync(output, JSON.stringify(outputJson));

        console.log(`${output} file created successfully`)
    })

programCommand('generate-new-metadata')
    .description('Generate new arweave metadata with edition number of a giving mint list')
    .option('-m, --mints-path <string>', 'json mints file', "./mints.json")
    .option('-b, --batch-size <number>', 'batch size', "10")
    .action(async (directory: string, cmd: any) => {
        const { mintsPath, batchSize, rpc } = cmd.opts();
        await generateNewMetadata(mintsPath, batchSize as number, rpc)
        console.log("Data created successfully")
    })

programCommand('get-editions')
    .description('Generate editions of a given master edition')
    .option('-m, --mint <string>', 'mint of master edition', '-- no mint provided')
    .option('-s, --supply <number>', 'current supply', 'no supply provided')
    .action(async (directory: string, cmd: any) => {
        const { mint, rpc, supply } = cmd.opts();
        const result = await getEditions({rpc, mint, supply})
        console.log(result)
    })

programCommand('get-editions-owners')
    .description('Generate owners of a given master editions')
    .option('-f, --file <string>', 'master editions file', 'masterEditions.json')
    .action(async (directory: string, cmd: any) => {
        const { file, rpc } = cmd.opts();
        const result = await getMastersEditionsOwners({
            masterEditionsFile: file,
            rpc: rpc
        })
        writeFileSync('result', JSON.stringify(result))
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
