const { Alchemy, Network } = require("alchemy-sdk");

const getAlchemyInstance = (network) => {
  return new Alchemy({
    apiKey: network === 'ethereum' ? process.env.ALCHEMY_ETH_API_KEY : process.env.ALCHEMY_POLYGON_API_KEY,
    network: network === 'ethereum' ? Network.ETH_MAINNET : Network.MATIC_MAINNET,
  });
};

module.exports = { getAlchemyInstance };
