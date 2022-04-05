# Candy machine utils

In this repo you are going to find common scripts ussually used to obtain or modify Metaplex NFTs metadata.
You have to install https://www.npmjs.com/package/ts-node

You can run using 

  ``ts-node index.ts <command-name> <parameters>``

Use this two scripts if you want to update aerwave metadata of a NFTs list. 

### upload-to-aerwave
If you have to upload aerwave files in batch without create a candy machine and using SOL$ instead of Aerwave coins, you can use this script for that, just have to specify your RPC, the keypair of your wallet and the directory to upload.

| Name    | Description    |
| ------- | -----------    |
| -r, --rpc <string> |Solana rpc    |
| -d, --dirname <string> |Local folder to read files    |
| -k, --keypair <path> |Solana wallet location    |

 Optional
| Name    | Description    |
| ------- | -----------    |
| -o, --output <path> |Output file    |
| -e, --env <string> |Solana cluster env name    |
| -c, --cache <string> |Cache file    |




### generate-new-metadata
When you use CANDY MACHINE V2, there's a common problem related to edition name, as you already now all the editions use the same metadata link and this link doesn't have the edition number. (This problem is also common when you edit the metadata on chain). So, for that we created this little script that given a mint list recreate the aerwave metadata but now with the on chain name. 
 
You can optain the mint list using this. https://metaboss.rs/snapshot.html#snapshot-mints
 
| Name    | Description    |
| ------- | -----------    |
| -r, --rpc <string> |Solana rpc    |
| -m, --mints-path <string> |json mints file    |
| -b, --batch-size <number> |batch size    |

 

## WIP

### get-editions
Generate editions of a given master edition
| Name    | Description    |
| ------- | -----------    |
| -r, --rpc <string> |Solana rpc    |
| -m, --mint <string> |mint of master edition    |
| -s, --supply <number> |current supply    |




### get-editions-owners
Generate owners of a given master editions
| Name    | Description    |
| ------- | -----------    |
| -r, --rpc <string> |Solana rpc    |
| -f, --file <string> |master editions file    |
Usage: index [options] [command]

## Options:
  
  -V, --version                    output the version number
  
  -h, --help                       display help for command

## Commands:
  
  upload-to-aerwave [options]      Upload local dir to aerwave using SOL.
  
  generate-new-metadata [options]  Generate new aerwave metadata with edition number of a giving mint list
  
  get-editions [options]           Generate editions of a given master edition
  
  get-editions-owners [options]    Generate owners of a given master editions
  
  help [command]                   display help for command
  
