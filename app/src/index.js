import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;
    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      console.log(networkId);
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );
      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.",error);
    }
  },

  setStatus: function(message,htmlID) {
    const status = document.getElementById(htmlID);
    status.innerHTML = message;
  },

  createStar: async function() {
    const { createStar } = this.meta.methods;
    const name = document.getElementById("starName").value;
    const id = document.getElementById("starId").value;
    await createStar(name, id).send({from: this.account});
    App.setStatus("New Star Owner is " + this.account + ".","startStatus");
  },

  lookUp: async function (){
    let { lookUptokenIdToStarInfo } = this.meta.methods;
    let { symbol } = this.meta.methods;
    let { name } = this.meta.methods;
    let id = document.getElementById("lookid").value;
    id = parseInt(id);
    let starName = await lookUptokenIdToStarInfo(id).call(); // call lookUptokenIdToStarInfo function within the contract
    let contract = await name().call();
    let sym = await symbol().call();
    if (starName.length == 0){ // if starName is zero then no name exist and therefor not owned
      App.setStatus("Star not owned.","status");
      App.setStatus("Star ID: ","starData");
      App.setStatus("Token Name: ","contract");
      App.setStatus("Token Symbol: ","symbol");
    }else{ // else its owned and displayed by passing tag ID to setStatus
      App.setStatus("Star owned.","status");
        App.setStatus("Star ID: "+id+" is named "+starName,"starData");
        App.setStatus("Token Name: "+contract,"contract");
        App.setStatus("Token Symbol: "+sym,"symbol");
    }
  }

};

window.App = App;

window.addEventListener("load", async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"),);
  }

  App.start();
});