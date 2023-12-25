const ERC20Token = artifacts.require("ERC20Token");

module.exports = function (deployer) {
  const initialAmount = 1000000; // Set your initial token amount
  const tokenName = "SampleToken";
  const decimalUnits = 18; // Set your decimal units
  const tokenSymbol = "STK";

  deployer.deploy(
    ERC20Token,
    initialAmount,
    tokenName,
    decimalUnits,
    tokenSymbol
  );
};