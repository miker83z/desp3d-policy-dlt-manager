const Web3 = require('web3');
//const Web3 = require('./../../dist/web3.min.js');
const devContractArtifact = require('../assets/Contract.json');
const devTokenArtifact = require('../../assets/NFToken.json');
const devNetworkId = '5777';

class EthereumParser {
  constructor(
    provider,
    offChainStorage,
    contractAddress,
    networkId,
    contractArtifact,
    tokenArtifact
  ) {
    this.provider = provider;
    this.web3 = new Web3(provider);
    this.gas = 6000000;
    this.offChainStorage = offChainStorage;

    if (networkId === undefined) networkId = devNetworkId;
    if (contractArtifact === undefined) contractArtifact = devContractArtifact;
    if (tokenArtifact === undefined) tokenArtifact = devTokenArtifact;

    this.contract = new this.web3.eth.Contract(
      contractArtifact.abi,
      contractAddress
    );
    this.contract.setProvider(this.provider);

    this.token = new this.web3.eth.Contract(
      tokenArtifact.abi,
      tokenArtifact.networks[networkId].address
    );
    this.token.setProvider(this.provider);

    this.mediaContract = {};
  }

  async parseSmartContract() {
    // Get contract info
    const contractUri = await this.contract.methods._contentUri().call();
    this.mediaContract = JSON.parse(
      await this.offChainStorage.retrieve(contractUri)
    );

    //Get deontics token info
    const deontics = [];
    const deonticsTokensIds = await this.contract.methods
      .getDeonticExpressions()
      .call();
    for (const id of deonticsTokensIds) {
      const tokenUri = await this.token.methods.tokenURI(id).call();
      deontics.push(JSON.parse(await this.offChainStorage.retrieve(tokenUri)));
      console.log(`Token id:${id} retrieved`);
    }
    deontics.forEach((deontic) => {
      const tmpAct = JSON.parse(JSON.stringify(deontic.act));
      deontic.act = tmpAct.identifier;
      if (tmpAct.impliesAlso !== undefined) {
        for (let i = 0; i < tmpAct.impliesAlso.length; i++) {
          const tmpImpliesAlso = JSON.parse(
            JSON.stringify(tmpAct.impliesAlso[i])
          );
          tmpAct.impliesAlso[i] = tmpImpliesAlso.identifier;
          this.mediaContract.actions[tmpImpliesAlso.identifier] =
            tmpImpliesAlso;
        }
      }
      this.mediaContract.actions[tmpAct.identifier] = tmpAct;
      if (deontic.constraints !== undefined) {
        for (let i = 0; i < deontic.constraints.length; i++) {
          const tmpConstraint = JSON.parse(
            JSON.stringify(deontic.constraints[i])
          );
          // personal data
          if (tmpConstraint.hasLegalBasis !== undefined) {
            for (let j = 0; j < tmpConstraint.hasLegalBasis.length; j++) {
              const tmpLegalBasis = JSON.parse(
                JSON.stringify(tmpConstraint.hasLegalBasis[j])
              );
              tmpConstraint.hasLegalBasis[j] = tmpLegalBasis.identifier;
              this.mediaContract.facts[tmpLegalBasis.identifier] =
                tmpLegalBasis;
            }
          }
          if (tmpConstraint.hasPersonalDataHandling !== undefined) {
            for (
              let j = 0;
              j < tmpConstraint.hasPersonalDataHandling.length;
              j++
            ) {
              const tmpPDH = JSON.parse(
                JSON.stringify(tmpConstraint.hasPersonalDataHandling[j])
              );
              tmpConstraint.hasPersonalDataHandling[j] = tmpPDH.identifier;
              this.mediaContract.facts[tmpPDH.identifier] = tmpPDH;
            }
          }
          if (tmpConstraint.hasProcessing !== undefined) {
            for (let j = 0; j < tmpConstraint.hasProcessing.length; j++) {
              const tmpHP = JSON.parse(
                JSON.stringify(tmpConstraint.hasProcessing[j])
              );
              tmpConstraint.hasProcessing[j] = tmpHP.identifier;
              this.mediaContract.actions[tmpHP.identifier] = tmpHP;
            }
          }
          if (tmpConstraint.hasPurpose !== undefined) {
            for (let j = 0; j < tmpConstraint.hasPurpose.length; j++) {
              const tmpPro = JSON.parse(
                JSON.stringify(tmpConstraint.hasPurpose[j])
              );
              tmpConstraint.hasPurpose[j] = tmpPro.identifier;
              this.mediaContract.facts[tmpPro.identifier] = tmpPro;
            }
          }
          if (tmpConstraint.hasRecipient !== undefined) {
            for (let j = 0; j < tmpConstraint.hasRecipient.length; j++) {
              const tmpRec = JSON.parse(
                JSON.stringify(tmpConstraint.hasRecipient[j])
              );
              tmpConstraint.hasRecipient[j] = tmpRec.identifier;
              this.mediaContract.parties[tmpRec.identifier] = tmpRec;
            }
          }
          if (tmpConstraint.hasRight !== undefined) {
            for (let j = 0; j < tmpConstraint.hasRight.length; j++) {
              const tmpRig = JSON.parse(
                JSON.stringify(tmpConstraint.hasRight[j])
              );
              tmpConstraint.hasRight[j] = tmpRig.identifier;
              this.mediaContract.facts[tmpRig.identifier] = tmpRig;
            }
          }
          if (tmpConstraint.hasRisk !== undefined) {
            for (let j = 0; j < tmpConstraint.hasRisk.length; j++) {
              const tmprisk = JSON.parse(
                JSON.stringify(tmpConstraint.hasRisk[j])
              );
              tmpConstraint.hasRisk[j] = tmprisk.identifier;
              this.mediaContract.facts[tmprisk.identifier] = tmprisk;
            }
          }
          if (tmpConstraint.hasTechnicalOrganisationalMeasure !== undefined) {
            for (
              let j = 0;
              j < tmpConstraint.hasTechnicalOrganisationalMeasure.length;
              j++
            ) {
              const tmpTO = JSON.parse(
                JSON.stringify(
                  tmpConstraint.hasTechnicalOrganisationalMeasure[j]
                )
              );
              tmpConstraint.hasTechnicalOrganisationalMeasure[j] =
                tmpTO.identifier;
              this.mediaContract.facts[tmpTO.identifier] = tmpTO;
            }
          }
          ////
          deontic.constraints[i] = tmpConstraint.identifier;
          this.mediaContract.facts[tmpConstraint.identifier] = tmpConstraint;
        }
      }
      // personal data
      if (deontic.textClauses !== undefined) {
        for (let i = 0; i < deontic.textClauses.length; i++) {
          const tmpTextClause = JSON.parse(
            JSON.stringify(deontic.textClauses[i])
          );
          deontic.textClauses[i] = tmpTextClause.identifier;
          this.mediaContract.textClauses[tmpTextClause.identifier] =
            tmpTextClause;
        }
      }
      ////
      this.mediaContract.deontics[deontic.identifier] = deontic;
    });

    //Get objects token info
    const objects = [];
    const objectsTokensIds = await this.contract.methods.getObjects().call();
    for (const id of objectsTokensIds) {
      const tokenUri = await this.token.methods.tokenURI(id).call();
      objects.push(JSON.parse(await this.offChainStorage.retrieve(tokenUri)));
    }
    objects.forEach((object) => {
      this.mediaContract.objects[object.identifier] = object;
    });

    return this.mediaContract;
  }
}

module.exports = { EthereumParser };
