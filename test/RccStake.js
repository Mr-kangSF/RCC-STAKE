const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("RccStake", function () {
  async function deployRccStakeFixture() {
    // 部署ERC20Reward代币合约
    const ERC20Reward = await ethers.getContractFactory("ERC20Reward");
    erc20Reward = await ERC20Reward.deploy();

    // 部署RCCStake合约
    const RCCStake = await ethers.getContractFactory("RCCStake");
    rccStake = await RCCStake.deploy();

    // 获取账户地址
    [owner, account1, account2] = await ethers.getSigners();

    // 初始化RCCStake合约
    await rccStake.initialize(
      erc20Reward.target,
      (await ethers.provider.getBlock("latest")).number, // startBlock
      (await ethers.provider.getBlock("latest")).number + 1000, // endBlock
      10 // RCCPerBlock
    );

    return { erc20Reward, rccStake, owner, account1, account2 };
  }

  // 测试代币合约的部署是否有误
  describe("ERC20Reward", function () {
    it("Should deployment the correct ERC20Reward address", async function () {
      const { erc20Reward } = await loadFixture(deployRccStakeFixture);

      // 检查代币合约中定义的代币名称，符号和精确度是否有误
      expect(await erc20Reward.name()).to.equal("RCC");
      expect(await erc20Reward.symbol()).to.equal("rcc");
      expect(await erc20Reward.decimals()).to.equal(18);
    });

    it("Should set the correct ERC20Reward address in RCCStake", async function () {
      const { erc20Reward, rccStake } = await loadFixture(deployRccStakeFixture);
      // 检查质押合约中的代币合约地址是否有误
      expect(await rccStake.RCC()).to.equal(erc20Reward.target);
    });

    it("Should assign the correct roles to the deployer", async function () {
      const { rccStake, owner } = await loadFixture(deployRccStakeFixture);
      // 检查合约部署者是否被赋予了正确的角色
      expect(await rccStake.hasRole(await rccStake.UPGRADE_ROLE(), owner.address)).to.be.true;
      expect(await rccStake.hasRole(await rccStake.ADMIN_ROLE(), owner.address)).to.be.true;
      expect(await rccStake.hasRole(await rccStake.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
    });

    it("Should mint erc20Reward correctly to owner", async function () {
      const { erc20Reward, owner } = await loadFixture(deployRccStakeFixture);

      // 检查代币合约的铸币功能(当前调用铸币功能的是owner)
      await erc20Reward.mint(ethers.parseUnits("1000"));
      expect(await erc20Reward.balanceOf(owner)).to.equal(ethers.parseUnits("1000"));
    })

    it("Should mint erc20Reward correctly to account1", async function () {
      const { erc20Reward, owner, account1 } = await loadFixture(deployRccStakeFixture);

      // 检查代币合约的铸币功能(当前调用铸币功能的是account1)
      await erc20Reward.connect(account1).mint(ethers.parseUnits("1000"));
      expect(await erc20Reward.balanceOf(account1)).to.equal(ethers.parseUnits("1000"));
    })

    // 创建代币并转移给RccStake合约
    it("Should mint and transfer to rccStake", async function () {
      const { erc20Reward, rccStake, owner } = await loadFixture(deployRccStakeFixture);

      await erc20Reward.mint(ethers.parseUnits("1000"));
      await erc20Reward.transfer(rccStake, ethers.parseUnits("400"));
      expect(await erc20Reward.balanceOf(rccStake)).to.equal(ethers.parseUnits("400"));
      expect(await erc20Reward.balanceOf(owner)).to.equal(ethers.parseUnits("600"));
    })
  });


  describe("Staking", function () {
    it("Should set and check the account1 balance", async function () {
      const { owner, account1, account2 } = await loadFixture(deployRccStakeFixture);

      // 获取账户当前的ETH余额
      const ownerBalance = await ethers.provider.getBalance(owner);
      const account1Balance = await ethers.provider.getBalance(account1);
      const account2Balance = await ethers.provider.getBalance(account2);

      console.log("owner:", ownerBalance);
      console.log("account1:", account1Balance);
      console.log("account2:", account2Balance);
      // 验证账户余额是否为10000 ETH(默认的账户余额都是10000)
      expect(account1Balance).to.equal(ethers.parseUnits("10000"));
    });

    it("Should add pool successful by owner", async function () {
      const { rccStake, owner } = await loadFixture(deployRccStakeFixture);

      // 检查是否触发事件
      await expect(rccStake.connect(owner).addPool(
        "0x0000000000000000000000000000000000000000",
        10,
        ethers.parseUnits("100"),
        2,
        true
      )).to.emit(rccStake, "AddPool")
        .withArgs("0x0000000000000000000000000000000000000000", 10, ethers.parseUnits("100"), 2);

      // 检查池是否正确添加
      expect(await rccStake.poolLength()).to.equal(1);

      const pool = await rccStake.pool(0);
      console.log("pool msg:", pool);
      expect(pool.poolWeight).to.equal(10);
    });

    it("should not allow non-owner to add a pool", async function () {
      const { rccStake, account1 } = await loadFixture(deployRccStakeFixture);

      // 尝试通过非所有者添加池
      await expect(
        rccStake.connect(account1).addPool(
          "0x0000000000000000000000000000000000000000",
          10,
          ethers.parseUnits("100"),
          2,
          true
        )
      ).to.be.reverted;
      // ).to.be.revertedWith("Ownable: caller is not the owner");

      expect(await rccStake.poolLength()).to.equal(0);
    });

    it("Should allow users to stake tokens", async function () {
      const { erc20Reward, rccStake, owner, account1 } = await loadFixture(deployRccStakeFixture);

      // 1.添加原生货币质押池
      await rccStake.connect(owner).addPool(
        "0x0000000000000000000000000000000000000000",
        10,
        ethers.parseUnits("100"),
        2,
        true
      );

      // 2.质押ETH
      const account1BeforeBalance = await ethers.provider.getBalance(account1);
      const rccStakeBeforeBalance = await ethers.provider.getBalance(rccStake.target);
      const transferAmount = ethers.parseUnits("100");
      await rccStake.connect(account1).depositnativeCurrency({ value: transferAmount });
      const account1AfterBalance = await ethers.provider.getBalance(account1);
      const rccStakeAfterBalance = await ethers.provider.getBalance(rccStake.target);

      console.log("account1AfterBalance:", account1AfterBalance);
      // 返回的类型是bigint，不支持.add和.sub方法
      console.log("Type of account1AfterBalance:", typeof account1AfterBalance);
      // 确保 account1AfterBalance 是 BigNumber 类型
      // expect(account1AfterBalance).to.be.instanceOf(ethers.BigNumber);

      // expect(account1BeforeBalance).to.equal(account1AfterBalance + transferAmount);
      expect(rccStakeBeforeBalance).to.equal(rccStakeAfterBalance - transferAmount);
    });
  });

  // 解除质押
  describe("Unstaking", function () {
    it("Should allow users to unstake tokens", async function () {
      const { rccStake, owner, account1 } = await loadFixture(deployRccStakeFixture);
      await rccStake.connect(owner).addPool(
        "0x0000000000000000000000000000000000000000",
        10,
        ethers.parseUnits("100"),
        2,
        true
      );
      const transferAmount = ethers.parseUnits("100");
      await rccStake.connect(account1).depositnativeCurrency({ value: transferAmount });

      // 测试异常是否正确抛出
      await expect(rccStake.connect(account1).unstake(0, ethers.parseUnits("150")))
        .to.be.revertedWith("Not enough staking token balance");

      const tx = await rccStake.connect(account1).unstake(0, ethers.parseUnits("60"))
      expect(await rccStake.stakingBalance(0, account1)).to.equal(ethers.parseUnits("40"));

      await expect(tx)
        .to.emit(rccStake, "RequestUnstake")
        .withArgs(account1, 0, ethers.parseUnits("60"));
    });
  });

  describe("Claiming Rewards", function () {
    it("Should allow users to claim rewards", async function () {
      const { erc20Reward, rccStake, owner, account1 } = await loadFixture(deployRccStakeFixture);
      // 1.铸币
      await erc20Reward.connect(owner).mint(ethers.parseUnits("1000"));
      // 2.奖励代币转移一部分给rccStake进行分配
      await erc20Reward.connect(owner).transfer(rccStake, ethers.parseUnits("600"));
      expect(await erc20Reward.balanceOf(rccStake)).to.equal(ethers.parseUnits("600"));
      // 3.添加质押池
      await rccStake.connect(owner).addPool(
        "0x0000000000000000000000000000000000000000",
        10,
        // ethers.parseUnits("60"),
        60,
        1,
        true
      );
      // 4.account1质押100个ETH
      const transferAmount = ethers.parseUnits("100");
      await rccStake.connect(account1).depositnativeCurrency({ value: 100 });

      // 5.假设已经过去了足够的区块，用户可以领取奖励
      // 首先获取当前最新的区块号
      const latestBlock = await ethers.provider.getBlock("latest");
      console.log(`latest block number is: ${latestBlock.number}`);
      // 增加时间，通常增加一个区块的时间（比如15秒）
      await ethers.provider.send("evm_increaseTime", [15]);
      // 然后挖掘新区块
      await ethers.provider.send("evm_mine", []);
      await ethers.provider.send("evm_increaseTime", [15]);
      await ethers.provider.send("evm_mine", []);
      // 检查新区块的号是否正确递增
      const newBlock = await ethers.provider.getBlock("latest");
      console.log(`New block number is: ${newBlock.number}`);
      const pool = await rccStake.pool(0);
      console.log("pool msg:", pool);

      // 6.领取奖励
      const tx = await rccStake.connect(account1).claim(0);
      const balance = await erc20Reward.balanceOf(account1);
      console.log("account1 RCC balance", balance);
      const pool2 = await rccStake.pool(0);
      console.log("pool2 msg:", pool2);


      // 检查用户是否领取了奖励
      expect(balance).to.be.above(ethers.parseUnits("0"));

      // 检查事件
      await expect(tx)
        .to.emit(rccStake, "Claim")
        .withArgs(account1, 0, balance);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow the admin to pause and unpause withdraw", async function () {
      const { rccStake, owner } = await loadFixture(deployRccStakeFixture);

      await rccStake.connect(owner).pauseWithdraw();
      expect(await rccStake.withdrawPaused()).to.be.true;

      await rccStake.connect(owner).unpauseWithdraw();
      expect(await rccStake.withdrawPaused()).to.be.false;
    });

    it("Should allow the admin to pause and unpause claim", async function () {
      const { rccStake, owner } = await loadFixture(deployRccStakeFixture);

      await rccStake.connect(owner).pauseClaim();
      expect(await rccStake.claimPaused()).to.be.true;

      await rccStake.connect(owner).unpauseClaim();
      expect(await rccStake.claimPaused()).to.be.false;
    });
  });


});
