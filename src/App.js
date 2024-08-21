import logo from './logo.svg';
import './App.css';
import { ethers } from "ethers";
import Lock from "./artifacts/contracts/Lock.sol/Lock.json";

function App() {
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
    const lock = new ethers.Contract("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", Lock.abi, provider);
    const message = await lock.message();
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

    let lock = new ethers.Contract("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", Lock.abi, signer);

    let transaction = await lock.connect(signer).setMessage("world hello444!");
    let tx = await transaction.wait();
    debugger
    // let event = tx.events[0];  这种事件的获取方法已经过时了
    // let value = event.args[0];
    // let message = value.toString();
    // alert(message)

    // 订阅实时事件
    lock.on("SetMessage", (new_msg) => {
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
      <button onClick={connect}>connect wallet</button>
      <button onClick={readMessage}>readMessage</button>
      <button onClick={setMessage}>setMessage</button>
    </div>
  );
}

export default App;
