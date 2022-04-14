type Cache = {
    [mint: string]: string
}

type Output = {
    mint_account: string,
    new_uri: string
}

export function cacheToJsonOutput(cache: Cache): Output[] {
    let output_json: Output[] = [];

    for (let mint_account in cache) {
        if (cache.hasOwnProperty(mint_account)) {
            output_json.push({
                mint_account,
                new_uri: cache[mint_account]
            })
        }
    }

    return output_json
}
