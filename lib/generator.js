const Web3 = require('web3');
//const Web3 = require('./../dist/web3.min.js');

const generateSmartContractSpecification = (contractObj) => {
  const mediaSC = {};

  // Identifier
  mediaSC.identifier = contractObj.identifier;

  // Parties
  mediaSC.parties = {};
  Object.keys(contractObj.parties).forEach((p) => {
    mediaSC.parties[p] = '';
  });

  //Deontic Expression
  mediaSC.deontics = {};
  Object.keys(contractObj.deontics).forEach((deonticId) => {
    const tmpDeontic = JSON.parse(
      JSON.stringify(contractObj.deontics[deonticId])
    );
    // Fill the deontic with actions
    tmpDeontic.act = JSON.parse(
      JSON.stringify(contractObj.actions[tmpDeontic.act])
    );
    if (tmpDeontic.act.impliesAlso !== undefined) {
      for (let i = 0; i < tmpDeontic.act.impliesAlso.length; i++) {
        tmpDeontic.act.impliesAlso[i] = JSON.parse(
          JSON.stringify(contractObj.actions[tmpDeontic.act.impliesAlso[i]])
        );
      }
    }
    // Fill the deontic with constraints
    if (tmpDeontic.constraints !== undefined) {
      for (let i = 0; i < tmpDeontic.constraints.length; i++) {
        tmpDeontic.constraints[i] = JSON.parse(
          JSON.stringify(contractObj.facts[tmpDeontic.constraints[i]])
        );
        // personal data
        const factObj = tmpDeontic.constraints[i];
        if (factObj.hasLegalBasis !== undefined) {
          for (let j = 0; j < factObj.hasLegalBasis.length; j++) {
            factObj.hasLegalBasis[j] = JSON.parse(
              JSON.stringify(contractObj.facts[factObj.hasLegalBasis[j]])
            );
          }
        }
        if (factObj.hasPersonalDataHandling !== undefined) {
          for (let j = 0; j < factObj.hasPersonalDataHandling.length; j++) {
            factObj.hasPersonalDataHandling[j] = JSON.parse(
              JSON.stringify(
                contractObj.facts[factObj.hasPersonalDataHandling[j]]
              )
            );
          }
        }
        if (factObj.hasProcessing !== undefined) {
          for (let j = 0; j < factObj.hasProcessing.length; j++) {
            factObj.hasProcessing[j] = JSON.parse(
              JSON.stringify(contractObj.actions[factObj.hasProcessing[j]])
            );
          }
        }
        if (factObj.hasPurpose !== undefined) {
          for (let j = 0; j < factObj.hasPurpose.length; j++) {
            factObj.hasPurpose[j] = JSON.parse(
              JSON.stringify(contractObj.facts[factObj.hasPurpose[j]])
            );
          }
        }
        if (factObj.hasRecipient !== undefined) {
          for (let j = 0; j < factObj.hasRecipient.length; j++) {
            factObj.hasRecipient[j] = JSON.parse(
              JSON.stringify(contractObj.parties[factObj.hasRecipient[j]])
            );
          }
        }
        if (factObj.hasRight !== undefined) {
          for (let j = 0; j < factObj.hasRight.length; j++) {
            factObj.hasRight[j] = JSON.parse(
              JSON.stringify(contractObj.facts[factObj.hasRight[j]])
            );
          }
        }
        if (factObj.hasRisk !== undefined) {
          for (let j = 0; j < factObj.hasRisk.length; j++) {
            factObj.hasRisk[j] = JSON.parse(
              JSON.stringify(contractObj.facts[factObj.hasRisk[j]])
            );
          }
        }
        if (factObj.hasTechnicalOrganisationalMeasure !== undefined) {
          for (
            let j = 0;
            j < factObj.hasTechnicalOrganisationalMeasure.length;
            j++
          ) {
            factObj.hasTechnicalOrganisationalMeasure[j] = JSON.parse(
              JSON.stringify(
                contractObj.facts[factObj.hasTechnicalOrganisationalMeasure[j]]
              )
            );
          }
        }
      }
    }
    // Fill the deontic with textClauses
    if (tmpDeontic.textClauses !== undefined) {
      for (let i = 0; i < tmpDeontic.textClauses.length; i++) {
        tmpDeontic.textClauses[i] = JSON.parse(
          JSON.stringify(contractObj.textClauses[tmpDeontic.textClauses[i]])
        );
      }
    }
    // Save it
    mediaSC.deontics[deonticId] = {
      uri: JSON.stringify(tmpDeontic),
      receiver: contractObj.deontics[deonticId].actedBySubject,
    };
  });

  //Objects
  if (contractObj.objects !== undefined) {
    mediaSC.objects = {};
    Object.keys(contractObj.objects).forEach((objectId) => {
      mediaSC.objects[objectId] = {
        uri: JSON.stringify(contractObj.objects[objectId]),
        receiver:
          contractObj.objects[objectId].rightsOwners !== undefined
            ? contractObj.objects[objectId].rightsOwners[0]
            : undefined,
      };
    });
  }

  //Contracts relations
  if (contractObj.contractRelations !== undefined) {
    //TODO
  }

  // Income percentage
  mediaSC.incomePercentage = {};
  Object.keys(contractObj.actions).forEach((actId) => {
    const act = contractObj.actions[actId];
    if (act.type === 'Payment') {
      const actor = act.actedBy;
      const beneficiary = act.beneficiaries[0];

      /*if (act.amount !== undefined) {
        if (payTo[actor] === undefined) payTo[actor] = {};
        payTo[actor][beneficiary] = act.amount;
      } else*/
      if (act.incomePercentage !== undefined) {
        if (mediaSC.incomePercentage[actor] === undefined)
          mediaSC.incomePercentage[actor] = {};
        mediaSC.incomePercentage[actor][beneficiary] = act.incomePercentage;
      }
    }
  });

  // Content URI
  mediaSC.contentURI = JSON.stringify(contractObj);
  // Content hash
  mediaSC.hash = Web3.utils.sha3(mediaSC.contentURI);

  return mediaSC;
};

module.exports = { generateSmartContractSpecification };
