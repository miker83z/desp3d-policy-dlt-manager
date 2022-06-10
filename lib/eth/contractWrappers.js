const Web3 = require('web3');

const web3ProviderURLDefault = 'http://127.0.0.1:8545';
const dltNetworkIdDefault = '5777';
const contractArtifactDefault = require('../assets/Contract.json');
const tokenArtifactDefault = require('../assets/NFToken.json');

class PolicyContractWrapper {
  constructor(web3Provider, dltNetworkId, contractArtifact, address) {
    this.web3Provider =
      web3Provider === undefined ? web3ProviderURLDefault : web3Provider;
    this.dltNetworkId =
      dltNetworkId === undefined ? dltNetworkIdDefault : dltNetworkId;
    this.contractArtifact =
      contractArtifact === undefined
        ? contractArtifactDefault
        : contractArtifact;
    this.address =
      address === undefined
        ? this.contractArtifact.networks[this.dltNetworkId].address
        : address;

    this.web3 = new Web3(this.web3Provider);
    this.policyContract = new this.web3.eth.Contract(
      this.contractArtifact.abi,
      this.address
    );
    this.policyContract.setProvider(this.web3Provider);
  }

  payTo(beneficiary, amount, from) {
    return this.policyContract.methods
      .payTo(beneficiary, amount)
      .send({ from });
  }

  getParties() {
    return this.policyContract.methods.getParties().call();
  }
  getDeonticExpressions() {
    return this.policyContract.methods.getDeonticExpressions().call();
  }
  getContractRelations() {
    return this.policyContract.methods.getContractRelations().call();
  }
  getIncomePercentagesBy() {
    return this.policyContract.methods.getIncomePercentagesBy().call();
  }
  getContentUri() {
    return this.policyContract.methods._contentUri().call();
  }
}

class PolicyNFTWrapper {
  constructor(web3Provider, dltNetworkId, tokenArtifact, address) {
    this.web3Provider =
      web3Provider === undefined ? web3ProviderURLDefault : web3Provider;
    this.dltNetworkId =
      dltNetworkId === undefined ? dltNetworkIdDefault : dltNetworkId;
    this.tokenArtifact =
      tokenArtifact === undefined ? tokenArtifactDefault : tokenArtifact;
    this.address =
      address === undefined
        ? this.tokenArtifact.networks[this.dltNetworkId].address
        : address;

    this.web3 = new Web3(this.web3Provider);
    this.nft = new this.web3.eth.Contract(this.tokenArtifact.abi, this.address);
    this.nft.setProvider(this.web3Provider);
  }

  tokenURI(tokenId) {
    return this.nft.methods.tokenURI(tokenId).call();
  }
  ownerOf(tokenId) {
    return this.nft.methods.ownerOf(tokenId).call();
  }
}

module.exports = {
  PolicyContractWrapper,
  PolicyNFTWrapper,
};
