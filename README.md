# candy-machine-utils

Candy machine common scripts used to fix metadata

You can run using 

ts-node index.ts <command-name> --<parameters>

### upload-to-aerwave
Upload local dir to aerwave using SOL.
| Name    | Description    |
| ------- | -----------    |
| -r, --rpc <string> |Solana rpc    |
| -d, --dirname <string> |Local folder to read files    |
| -o, --output <path> |Output file    |
| -k, --keypair <path> |Solana wallet location    |
| -e, --env <string> |Solana cluster env name    |




### generate-new-metadata
Generate new aerwave metadata with edition number of a giving mint list
| Name    | Description    |
| ------- | -----------    |
| -r, --rpc <string> |Solana rpc    |
| -m, --mints-path <string> |json mints file    |
| -b, --batch-size <number> |batch size    |
  
  
Usage: index [options] [command]

Options:
  -V, --version                    output the version number
  -h, --help                       display help for command

Commands:
  upload-to-aerwave [options]      Upload local dir to aerwave using SOL.
  
  generate-new-metadata [options]  Generate new metadata of giving mint list
  
  help [command]                   display help for command
