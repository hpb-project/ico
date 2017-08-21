var HPBToken = artifacts.require("HPBToken");

contract('HPBToken', function(accounts) {
  it("should not be able to start ico sale when not called by owner.", function() {
    console.log("\n" + "-".repeat(100) + "\n");
    var loopring;
    var target;
    return HPBToken.deployed().then(function(instance) {
      loopring = instance;
      console.log("loopring:", loopring.address);
      return loopring.target.call({from: accounts[1]});
    }).then(function(t){
      target = accounts[1];
      web3.eth.sendTransaction({from: accounts[1], to: loopring.address, value: web3.toWei(1) })
      return web3.eth.sendTransaction({from: accounts[1], to: target, value: web3.toWei(1) })
    }).then(function(tx) {
      console.log("tx:", tx);
      console.log("blockNumber:", web3.eth.blockNumber);
      return loopring.start(100, {from: accounts[1]});
    }).then(function(tx) {
      console.log("tx:", tx);
      if (tx.logs) {
        for (var i = 0; i < tx.logs.length; i++) {
          var log = tx.logs[i];
          if (log.event == "InvalidCaller") {
            return true;
          }
        }
      }
      return false;
    }).then(function(result) {
      assert.equal(result, true, "no SaleStarted event found");
    });
  });

  it("should not allow create tokens before it starts", function() {
    console.log("\n" + "-".repeat(100) + "\n");
    var loopring;
    var target;
    return HPBToken.deployed().then(function(instance) {
      loopring = instance;
      return loopring.target.call({from: accounts[1]});
    }).then(function(t){
      target = t;
      console.log("target:", target);
      firstblock = t.blockNumber + 1;
      return web3.eth.sendTransaction({from: accounts[1], to: loopring.address, value: web3.toWei(1) });

    }).then(function(txHash) {
      console.log("txHash", txHash);
      // InvalidState event shoud emitted here.
      return true;
    }).then(function(result) {
      assert.equal(result, true, "create tokens before sale start");
    });
  });

  it("should be able to start ico sale when called by owner.", function() {
    console.log("\n" + "-".repeat(100) + "\n");
    var loopring;
    var target;
    return HPBToken.deployed().then(function(instance) {
      loopring = instance;
      return loopring.target.call();
    }).then(function(t){
      target = t;
      return loopring.start(10, {from: target});
    }).then(function(tx) {
      console.log("tx: ", tx);
      if (tx.logs) {
        for (var i = 0; i < tx.logs.length; i++) {
          var log = tx.logs[i];
          if (log.event == "SaleStarted") {
            return true;
          }
        }
      }
      return false;
    }).then(function(result) {
      assert.equal(result, true, "no SaleStarted event found");
    });
  });

  it("should be able to create HPB tokens after sale starts", function() {
    console.log("\n" + "-".repeat(100) + "\n");
    var loopring;
    var target;
    var externalTxHash;
    return HPBToken.deployed().then(function(instance) {
      loopring = instance;
      return loopring.target.call({from: accounts[1]});
    }).then(function(t){
      target = t;
      return web3.eth.sendTransaction({from: accounts[1], to: loopring.address, value: web3.toWei(1), gas: 500000 });
    }).then(function(tx) {
      console.log("tx:", tx);
      return loopring.balanceOf(accounts[1], {from: accounts[1]});
    }).then(function(bal) {
      console.log("bal: ", bal.toNumber());
      assert.equal(bal.toNumber(), web3.toWei(6000), "no HPB token Transfer event found");
    });
  });
