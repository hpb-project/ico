var HPBToken = artifacts.require("./HPBToken.sol")
module.exports = function(deployer) {
  deployer.deploy(HPBToken);
};
