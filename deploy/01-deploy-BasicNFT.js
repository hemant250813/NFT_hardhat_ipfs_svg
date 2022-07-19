const{ network } = require ("hardhat")
const { developmentChains } = require ("../helper-hardhat-config")
const { verify } = require("../utils/verify")


module.exports = async function({getNamedAccounts , deployments}){
    const{ deploy , log} = deployments
    const { deployer } = await getNamedAccounts()

    log("-------------------------------------")

    const args= []
    const BasicNft = await deploy("BasicNft", {
        from : deployer,
        args : args,
        log : true,
        waitConfirmation : network.config.blockConfirmations || 1,

    })

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("VERIFY-------------------------")
        await verify (BasicNft.address, args)
    }
    log("--------------------------g------------")
}