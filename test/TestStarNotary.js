const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    let tokenId = 123;
    let instance = await StarNotary.deployed();
    await instance.createStar('TestStarName', tokenId, {from: accounts[0]})
    const startContractName = await instance.name();
    const startContractSymbol = await instance.symbol();

    assert.equal(startContractName,'Star Notary Token 2021');
    assert.equal(startContractSymbol,'SNT');
});

it('lets 2 users exchange stars', async() => {
    let instance = await StarNotary.deployed();
    let account1 = accounts[0];
    let account2 = accounts[1];
    let tokenId1 = 744;
    let tokenId2 = 4448;
    await instance.createStar('PopStar',tokenId1, {from: account1}); 
    await instance.createStar('FilmStar',tokenId2, {from: account2});
    await instance.exchangeStars(tokenId1,tokenId2);
    let star1 = await instance.ownerOf.call(tokenId1); 
    let star2 = await instance.ownerOf.call(tokenId2); 
    assert.equal(star1,account2);
    assert.equal(star2,account1); 
});

it('lets a user transfer a star', async() => {
    let instance = await StarNotary.deployed();
    let account1 = accounts[0];
    let account2 = accounts[1];
    let tokenId = 934343;
    await instance.createStar('star934343',tokenId, {from: account1}); 
    await instance.transferStar(account2,tokenId); 
    let stars = await instance.ownerOf.call(tokenId); 
    assert.equal(stars,account2); 
});

it('lookUptokenIdToStarInfo test', async() => {
    let tokenId = 334343;
    let instance = await StarNotary.deployed();
    await instance.createStar('TestStar334343', tokenId, {from: accounts[0]})
    let starName = await instance.lookUptokenIdToStarInfo(tokenId); //get star name
    assert.equal(starName,"TestStar334343");
});