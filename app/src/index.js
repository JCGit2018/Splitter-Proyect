import Web3 from "web3";
import splitterArtifact from "../../build/contracts/Splitter.json";

const App = {
  web3: null,
  splitter: null,
  aliceAcc:null,
  bobAcc:null,
  carolAcc:null,
  contract:null,
  paused:false,
  
  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = splitterArtifact.networks[networkId];
      this.splitter = new web3.eth.Contract(
        splitterArtifact.abi,
        deployedNetwork.address,
      );

      this.contract= deployedNetwork.address; //contract address
      console.log('Contract Address: '+ this.contract);  
      // get accounts 
 
      const accounts = await web3.eth.getAccounts();
      this.aliceAcc = accounts[0];
      this.bobAcc = accounts[1];
      this.carolAcc = accounts[2];

      this.refreshBalance();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  refreshBalance: async function() {
    const { web3 } = this;
    let balanceElement;

    const balanceContract = await web3.eth.getBalance(this.contract);
    balanceElement = document.getElementsByClassName("balanceContract")[0];
    balanceElement.innerHTML = balanceContract;

    const balanceAlice = await web3.eth.getBalance(this.aliceAcc)
    balanceElement = document.getElementsByClassName("balanceAlice")[0];
    balanceElement.innerHTML = balanceAlice;

    const balanceBob = await web3.eth.getBalance(this.bobAcc)
    balanceElement = document.getElementsByClassName("balanceBob")[0];
    balanceElement.innerHTML = balanceBob;

    const balanceCarol = await web3.eth.getBalance(this.carolAcc)
    balanceElement = document.getElementsByClassName("balanceCarol")[0];
    balanceElement.innerHTML = balanceCarol;
  },

  sendCoin: async function() {
    const { web3 } = this;
    const amount = parseInt(document.getElementById("amount").value);

    this.setStatus("Initiating transaction... (please wait)");

    const { splitCoin } = this.splitter.methods;
try{
    await splitCoin(this.bobAcc, this.carolAcc).send({ from: this.aliceAcc, value:amount});
  
    this.setStatus("Please click on the withdraw button!");
    this.refreshBalance();
    }catch(error) {
      console.error(error);
     this.setStatus("Transaction Error!");
    }
  },

  withdrawCoin: async function() {
    const { web3 } = this;
    const amount1 = parseInt(document.getElementById("amount").value);
    this.setStatus("Withdrawing... (please wait)");

    const { withdrawal } =  this.splitter.methods;
try{
    await withdrawal().send({ from: this.bobAcc }); 
    await withdrawal().send({ from: this.carolAcc });
  
    //sender should withdraw the remainder if the amount is not even
    if (amount1%2 > 0) await withdrawal().send({ from: this.aliceAcc });
    document.getElementById("amount").value=0;
    this.setStatus("Transaction complete!");
    this.refreshBalance();
    }catch(error) {
      console.error(error);
      this.setStatus("Transaction Error!");
    }
  },

    pauseResume: async function() {
    

    console.log(this.paused);

    const { resume } =  this.splitter.methods;
    const { contractPaused } =  this.splitter.methods;
    
try{
    if (!this.paused) {
      await contractPaused().send({ from: this.aliceAcc });
      this.paused = true;
      this.setStatusContract("Status:Contract Paused");
    }else {
      await resume().send({ from: this.aliceAcc });
      this.paused = false;
      this.setStatusContract("Status:Contract Active");
    };
    
    }catch(error) {
      console.error(error);
      await resume().send({ from: this.aliceAcc });
     this.setStatus("Error in Contract!. Resuming");
    }
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  setStatusContract: function(message) {
    const statusContract = document.getElementById("statusContract");
    statusContract.innerHTML = message;
  },

};

window.App = App;

window.addEventListener("load", function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
    );
  }

  App.start();
});
