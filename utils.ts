export const resolveManyRequest = async (fn : any, parameters : Array<object>, batch : number) => {
    const promisePoll = []
    let promises = []
    let counter = 0
    for (let i = 0; i < parameters.length; i++) {
        if (counter === batch) {
            promisePoll.push([...promises])
            promises = []
            counter = 0
        }
        promises.push(parameters[i])
        counter+=1
    }
    if(promises.length > 0){
        promisePoll.push([...promises])
    }
    let response = [] as Array<object>
    for await (let promises of promisePoll){
        const data = await Promise.all(promises.map(async v => await fn(v))) as Array<object>
        response = response.concat(data)
    }
    return response as any
}