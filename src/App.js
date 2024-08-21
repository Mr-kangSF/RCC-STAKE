import logo from './logo.svg';
import './App.css';
import { ethers } from "ethers";
import Lock from "./artifacts/contracts/Lock.sol/Lock.json";
import RCCStake from "./artifacts/contracts/RCCStake.sol/RCCStake.json";


function App() {
  // const connectOnce = async () => {
  //   let signer = null;
  //   let provider;
  //   let address;
  //   if (window.ethereum == null) {
  //     console.log("MetaMask not installed; using read-only defaults")
  //     provider = ethers.getDefaultProvider()
  //   } else {
  //     provider = new ethers.BrowserProvider(window.ethereum)
  //     signer = await provider.getSigner()
  //     address = signer.getAddress();
  //   }

  //   debugger;
  //   // let provider = new ethers.providers.Web3Provider(window.ethereum)
  //   // await provider.send("eth_requestAccounts", []);

  //   let network = await provider.getNetwork();
  //   return { chainId: network.chainId, address: address, provider, signer };
  // }
  // const trying = async () => {
  //   const { chainId, address, provider, signer } = await connectOnce();
  //   // 当前应用配置的chainId
  //   // const supported = configuration().chainId.toString();
  //   // 判断钱包网络的chainId是否与应用配置的一致
  //   if (chainId == 0x7A69) {
  //     return { success: true, provider, signer };
  //   }

  //   return { success: false };
  // }
  // const connect = async () => {
  //   // 尝试连接到当前应用定义的网络
  //   let { success } = await trying();
  //   if (success)
  //     return;
  //   // 再次尝试连接
  //   await trying();
  // }

  const connect = async () => {
    let signer = null;
    let provider;
    let address;
    if (window.ethereum == null) {
      console.log("MetaMask not installed; using read-only defaults")
      provider = ethers.getDefaultProvider()
    } else {
      provider = new ethers.BrowserProvider(window.ethereum)
      signer = await provider.getSigner()
      address = signer.getAddress();
    }

    // 获取当前网络信息
    const currentNetwork = await provider.getNetwork();
    console.log("Connected to network:", currentNetwork.name);

    // 检查当前网络是否是hardhat测试网络
    if (currentNetwork.chainId !== "31337") {
      // 如果不是，尝试切换到hardhat测试网络
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7A69' }] // 这里需要传递十六进制的网络ID
        });
        console.log("Switched to Selenium network successfully.");
      } catch (error) {
        console.error("Failed to switch network:", error);
      }
    }

  }

  // 合约的读操作
  const readMessage = async () => {
    let provider;
    if (window.ethereum == null) {
      console.log("MetaMask not installed; using read-only defaults")
      provider = ethers.getDefaultProvider()
    } else {
      provider = new ethers.BrowserProvider(window.ethereum)
    }

    // await provider.send("eth_requestAccounts", []);
    // const lock = new ethers.Contract("0x5FbDB2315678afecb367f032d93F642f64180aa3", Lock.abi, provider);
    // const message = await rccStake.message();
    const rccStake = new ethers.Contract("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", RCCStake.abi, provider);
    const message = await rccStake.endBlock();

    alert(message)
  }

  // 合约的写操作
  const setMessage = async () => {
    let signer = null;
    let provider;
    if (window.ethereum == null) {
      console.log("MetaMask not installed; using read-only defaults")
      provider = ethers.getDefaultProvider()
    } else {
      provider = new ethers.BrowserProvider(window.ethereum)
      signer = await provider.getSigner()
    }

    // await provider.send("eth_requestAccounts", []);
    // const signer = provider.getSigner()

    // let lock = new ethers.Contract("0x5FbDB2315678afecb367f032d93F642f64180aa3", Lock.abi, signer);
    // let transaction = await lock.connect(signer).setMessage("world hello444!");
    let rccStake = new ethers.Contract("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", RCCStake.abi, signer);

    await rccStake.connect(signer).setEndBlock(100);


    // let tx = await transaction.wait();
    debugger
    // let event = tx.events[0];  这种事件的获取方法已经过时了
    // let value = event.args[0];
    // let message = value.toString();
    // alert(message)

    // 订阅实时事件
    rccStake.on("SetEndBlock", (new_msg) => {
      console.log(new_msg);
      alert(new_msg)
    });

    // 查询历史事件
    // provider.getLogs({
    //   address: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
    //   topics: [
    //     ethers.utils.id("SetMessage"),
    //     // 可以添加更多topics来过滤事件
    //   ],
    //   fromBlock: 0, // 起始区块号
    //   toBlock: 'latest' // 结束区块号，可以是数字或者 'latest'
    // }).then(logs => {
    //   logs.forEach(log => {
    //     console.log(log);
    //     alert(log)
    //   });
    // });


  }

  return (
    <div className="App">
      <button onClick={connect}>连接钱包</button>
      <button onClick={readMessage}>读取结束区块</button>
      <button onClick={setMessage}>设置结束区块</button>
    </div>
  );
}

export default App;
