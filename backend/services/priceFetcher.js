// backend/services/priceFetcher.js
require('dotenv').config();
const axios = require("axios");

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const idCache = {};

// Resolve CoinGecko token ID from address
async function resolveCoinGeckoId(address, network) {
  const key = `${address.toLowerCase()}|${network}`;
  if (idCache[key]) return idCache[key];

  const baseUrl =
    network === "ethereum"
      ? "https://api.coingecko.com/api/v3/coins/ethereum/contract"
      : "https://api.coingecko.com/api/v3/coins/polygon-pos/contract";

  try {
    const { data } = await axios.get(`${baseUrl}/${address.toLowerCase()}`, {
      headers: {
        'x-cg-api-key': COINGECKO_API_KEY,
      },
    });

    const id = data.id;
    idCache[key] = id;
    return id;
  } catch (error) {
    console.error(`❌ Failed to resolve CoinGecko ID for ${address} on ${network}:`, error.response?.status, error.message);
    return null;
  }
}

// Fetch USD price from CoinGecko's historical data
async function getUSDPriceFromCoinGecko(coinGeckoId, timestamp, retry = 0) {
  const dateStr = new Date(timestamp * 1000).toISOString().split("T")[0].split("-").reverse().join("-");
  const url = `https://api.coingecko.com/api/v3/coins/${coinGeckoId}/history?date=${dateStr}`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        'x-cg-api-key': COINGECKO_API_KEY,
      },
    });

    return data.market_data?.current_price?.usd ?? null;
  } catch (err) {
    if (err.response?.status === 429 && retry < 3) {
      console.warn(`⏳ Rate limited. Retrying... (${retry + 1}/3)`);
      await new Promise((res) => setTimeout(res, 3000));
      return getUSDPriceFromCoinGecko(coinGeckoId, timestamp, retry + 1);
    }

    console.error(`❌ CoinGecko price fetch error for ${coinGeckoId} on ${dateStr}:`, err.response?.status, err.message);
    return null;
  }
}

// Main function to get price at a timestamp
async function getPriceAtTimestamp(tokenAddress, network, timestamp) {
  try {
    const coinGeckoId = await resolveCoinGeckoId(tokenAddress, network);
    if (!coinGeckoId) {
      return { price: null, source: "unresolved-token" };
    }

    const price = await getUSDPriceFromCoinGecko(coinGeckoId, timestamp);
    return {
      price,
      source: "coingecko",
    };
  } catch (err) {
    console.error("❌ getPriceAtTimestamp error:", err.message);
    return {
      price: null,
      source: "error",
    };
  }
}

module.exports = {
  getPriceAtTimestamp,
};
