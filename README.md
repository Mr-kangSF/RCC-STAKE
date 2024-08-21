<<<<<<< HEAD
## 1 : 合约测试
基本实现RCCStake主要功能点的覆盖测试

![20240821151426.png](images/20240821151426.png)


## 2  前端简单实现MetaMask连接 


由于speolia测试网络上的余额不够交易，连接MetaMask主动询问切换本地hardhat网络

![20240821151646.png](images/20240821151646.png)
![20240821151910.png](images/20240821151910.png)
![20240821151944.png](images/20240821151944.png)



## 3 测试合约读取操作

读取RCCStake合约的结束区块，默认是0
![20240821152033.png](images/20240821152033.png)






## 4 测试合约写入操作
代码默认写入100
![20240709223647390](images/20240821152252.png)

写入成功：
![20240821152429](images/20240821152429.png)
  

## 5 后续优化
1.除了原生货币pool,同时新开stake token是erc20Token的pool

2.学习点前端，完善下交互页面，实现从质押到解除质押，提取奖励的全流程页面交互
=======
# RCC stake
### 需求文档
建议：

1. 需要写测试！！！
2. 合约开发完成后部署到 sepolia 进行测试
3. 可以自己在sepolia 上面发一个erc20 token 作为reward token的代币
4. 第一个stake token 是所在链的native currency；如果想开其他pool，stake token 可以是erc20Token，合约自行改造调整。

#### 1. 系统概述

RCCStake 是一个基于区块链的质押系统，支持多种代币的质押，并基于用户质押的代币数量和时间长度分配 RCC 代币作为奖励。系统可提供多个质押池，每个池可以独立配置质押代币、奖励计算等。

#### 2. 功能需求

##### 2.1 质押功能

- **输入参数**: 池 ID(_pid)，质押数量(_amount)。
- **前置条件**: 用户已授权足够的代币给合约。
- **后置条件**: 用户的质押代币数量增加，池中的总质押代币数量更新。
- **异常处理**: 质押数量低于最小质押要求时拒绝交易。

##### 2.2 解除质押功能

- **输入参数**: 池 ID(_pid)，解除质押数量(_amount)。
- **前置条件**: 用户质押的代币数量足够。
- **后置条件**: 用户的质押代币数量减少，解除质押请求记录，等待锁定期结束后可提取。
- **异常处理**: 如果解除质押数量大于用户质押的数量，交易失败。

##### 2.3 领取奖励

- **输入参数**: 池 ID(_pid)。
- **前置条件**: 有可领取的奖励。
- **后置条件**: 用户领取其奖励，清除已领取的奖励记录。
- **异常处理**: 如果没有可领取的奖励，不执行任何操作。

##### 2.4 添加和更新质押池

- **输入参数**: 质押代币地址(_stTokenAddress)，池权重(_poolWeight)，最小质押金额(_minDepositAmount)，解除质押锁定区(_unstakeLockedBlocks)。
- **前置条件**: 只有管理员可操作。
- **后置条件**: 创建新的质押池或更新现有池的配置。
- **异常处理**: 权限验证失败或输入数据验证失败。

##### 2.5 合约升级和暂停

- **升级合约**: 只有持有升级角色的账户可执行。
- **暂停/恢复操作**: 可以独立控制质押、解除质押、领奖等操作的暂停和恢复。

#### 3. 数据结构

##### 3.1 Pool

- **stTokenAddress**: 质押代币的地址。
- **poolWeight**: 质押池的权重，影响奖励分配。
- **lastRewardBlock**: 最后一次计算奖励的区块号。
- **accRCCPerST**: 每个质押代币累积的 RCC 数量。
- **stTokenAmount**: 池中的总质押代币量。
- **minDepositAmount**: 最小质押金额。
- **unstakeLockedBlocks**: 解除质押的锁定区块数。

##### 3.2 User

- **stAmount**: 用户质押的代币数量。
- **finishedRCC**: 已分配的 RCC 数量。
- **pendingRCC**: 待领取的 RCC 数量。
- **requests**: 解质押请求列表，每个请求包含解质押数量和解锁区块。

#### 4. 安全需求

- **访问控制**: 使用角色基础的访问控制确保只有授权用户可以执行敏感操作。
- **重入攻击保护**: 使用状态锁定模式防止重入攻击。
- **输入验证**: 所有用户输入必须经过严格验证，包括参数范围检查和数据完整性验证。

#### 5. 事件记录

- 每个关键操作（如质押、解除质押、领奖）都应触发事件，以便外部监听器跟踪和记录状态变化。

#### 6. 接口设计

- 提供标准的 Ethereum 智能合约接口，支持 ERC20 代币操作和自定义合约方法。
- 提供前端界面调用合约的接口说明和示例代码，确保前端可以正确交互并展示合约状态。
>>>>>>> 35fddcd4453c2aa66bfa5aa864d120bed44c548b
