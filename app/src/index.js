import Web3 from "web3";
import splitterArtifact from "../../build/contracts/Splitter.json";

const App = {
  web3: null,
  splitter: null,
  aliceAcc:null,
  bobAcc:null,
  carolAcc:null,


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
    const balanceAlice = await web3.eth.getBalance(this.aliceAcc)
    let balanceElement = document.getElementsByClassName("balanceAlice")[0];
    balanceElement.innerHTML = balanceAlice;

    const balanceBob = await web3.eth.getBalance(this.bobAcc)
    balanceElement = document.getElementsByClassName("balanceBob")[0];
    balanceElement.innerHTML = balanceBob;

    const balanceCarol = await web3.eth.getBalance(this.carolAcc)
    balanceElement = document.getElementsByClassName("balanceCarol")[0];
    balanceElement.innerHTML = balanceCarol;
  },

  sendCoin: async function() {
   const amount = parseInt(document.getElementById("amount").value);

    this.setStatus("Initiating transaction... (please wait)");

    const { splitCoin } = this.splitter.methods;
    const { withdrawal } =  this.splitter.methods;
try{
    await splitCoin(this.bobAcc, this.carolAcc).send({ from: this.aliceAcc, value:amount });
    await withdrawal().send({ from: this.bobAcc }); 
    await withdrawal().send({ from: this.carolAcc }); 
    this.setStatus("Transaction complete!");
    this.refreshBalance();
    }catch(error) {
      console.error(error);
     this.setStatus("Transaction Error!");
    }
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
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
