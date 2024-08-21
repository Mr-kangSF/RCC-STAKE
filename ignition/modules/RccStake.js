const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("RCCStakeModule", (m) => {
  const rccStake = m.contract("RCCStake", []);

  return { rccStake };
});
