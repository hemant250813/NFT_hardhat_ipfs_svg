const{ network, ethers } = require ("hardhat")
const { developmentChains , networkConfig} = require ("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages, storeTokeUriMetadata } = require("../utils/uploadToPinata")



const FUND_AMOUNT = "1000000000000000000000"
const imagesLocation = "./images/RandomNft/"

const metaDataTemplate = {

    name: "",
    describtion: "",
    image: "",
    attributes: [
        {
            trait_type : "cuteness",
            value: 100,

        },
    ],
}
let tokenUris = [
    "ipfs://QmZ7p8T9drC5LuDDxhmXRoA381gzMHBuaG783kv3ajorRG",
    "ipfs://QmNvJ2qFB8XMDwhZzUmWG6yaFcKmZg9JY6dNYJd47AJTTP",
    "ipfs://QmSxgA5snYe4c9mGmQqAyHBCEBpNaoCuTJr9D6LJLPdkcZ",
]

module.exports = async function({getNamedAccounts , deployments}){
    const{ deploy , log} = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //get the IPFS hashes

    if(process.env.UPLOAD_TO_PINATA == "true"){

        tokenUris = await handleTokenUris();
    }
    //1. uploading images on ipfs and using it urself
    //1. using pinata and uploading images 
    //3. nft.storage use for everyone bt its tough

    let vrfCoordinatorV2Address, subscriptionId

    if(developmentChains.includes(network.name)){
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2mock")
        vrfCoordinatorV2Address = VRFCoordinatorV2Mock.address
        const tx = await vrfCoordinatorV2AMock.createSubscription()
        const txReciept = await tx.wait(1)
        subscriptionId = txReciept.events[0].args.subscriptionId
        await vrfCoordinatorV2AMock.funSubscription(subscriptionId, FUND_AMOUNT)
    }
    else{
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }
    log("-----------------------------------------");

    

    const args= [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane, 
        networkConfig[chainId].mintFee,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,
        ]

        const randomIpfsNft = await deploy("randomIpfsNft", {
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: network.config.blockConfirmations || 1, 
        })
        log("-----------------------------------------");
        if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
            log("VERIFY-------------------------")
            await verify (randomIpfsNft.address, args)
        }



}
async function handleTokenUris(){
    tokenUris = []

    const {response : imageUploadResponses, files} = await storeImages(imagesLocation)
    for (imageUploadResponseIndex in imageUploadResponses){
        //create and upload metadata...
        let tokenUriMetaData = {...metaDataTemplate}
        tokenUriMetaData.name = files[imageUploadResponseIndex].replace(".png", "")
        tokenUriMetaData.describtion = `an adorable but dangerous ${tokenUriMetaData.name} ocotopods assemble`
        tokenUriMetaData.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
        console.log(`uploading ${tokenUriMetaData.name}... `)
        const metadataUploadResponse = await storeTokeUriMetadata(tokenUriMetaData)
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }
    console.log("Token URIs uploaded they are :")
    console.log(tokenUris)

    return tokenUris
}


module.exports.tags = ["all", "randomipfs", "main"]