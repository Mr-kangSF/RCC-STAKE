require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  paths:{
    // 设置hardhat的编译目录
    artifacts: "./src/artifacts"
  }
};
