const { assert }  = require("chai");
const { iterator } = require("core-js/fn/symbol");
const { getNamedAccounts, ethers, deployments } = require("hardhat");
const { network } = require ("../helper-hardhat-config");
const { developmentChains } = require("../helper-hardhat-config");

!developmentChains.includes(network.name) 
? describe.skip
: describe("basic NFT unit test " , async function(){
    let BasicNft , deployer

    beforeEach(async () => {
        accounts : await ethers.getSigners()

        deployer: accounts[0]
        await deployments.fixture(["mock" , "basicNft"])
        BasicNft = await ethers.getContract("BasicNft")
    
    })

    it("allows user to mint an NFT and update it Appropriately", async function (){
        const txResponse = await basicNft.mintNft()
        await txResponse.wait(1)
        const tokenURI = await basicNft.tokenURI(0)
        const tokenCounter = awaitNft.getTokenCounter()

        assert.equal(tokenCounter.toString(), "1")
        assert.equal(tokenURI, await basicNft, tokenURI())
    })
}) 