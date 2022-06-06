const { IPFSWrapper } = require('intelligible-storage-ipfs');

class OffChainStorage {
  constructor(hostOptions) {
    /*this.ipfsService = create({
      //host: 'ipfs.infura.io:5001/api/v0',
      //host: 'scm.linkeddata.es:443/api/v0',
      url: 'http://127.0.0.1:5001/api/v0',
      //port: 5001,
      //protocol: 'http',
    });*/
    if (hostOptions === undefined) {
      //const projectId = '2A';
      //const projectSecret = '2A';
      //const auth =
      //'Basic ' +
      //Buffer.from(projectId + ':' + projectSecret).toString('base64');
      hostOptions = {
        host: '127.0.0.1', //'ipfs.infura.io',
        port: '5001',
        protocol: 'http',
        //headers: {
        //  authorization: auth,
        //},
      };
    }
    this.hostOptions = hostOptions;
    this.ipfs = new IPFSWrapper(hostOptions);
  }

  async publish(payload) {
    console.log('[IPFS] Publishing payload');
    if (typeof payload === 'object') payload = JSON.stringify(payload);
    //if (typeof payload === 'string') payload = JSON.parse(payload);

    const file = {
      path: '',
      content: payload,
    };
    const result = await this.ipfs.storeIPFSFile('nft', file);
    //const result = await this.ipfs.add(payload);
    console.log('[IPFS] Published ', result.cid.toString());
    return result.cid.toString();
  }

  async retrieve(cid) {
    console.log('[IPFS] Retrieving ', cid);
    const result = await this.ipfs.getIPFSFile(cid + '/nft');
    return result;
    /*for await (const file of this.ipfs.get(cid)) {
      if (!file.content) continue;
      const chunks = [];
      for await (const chunk of file.content) chunks.push(chunk);
      return uint8ArrayToString(uint8ArrayConcat(chunks));
    }*/
  }
}

module.exports = { OffChainStorage };
