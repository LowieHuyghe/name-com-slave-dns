const request = require('./request');

/**
 * Get record-list
 * @param {string} username Username
 * @param {string} token Token
 * @param {string} domain Domain
 * @returns {[{ host: string, typeL string, answer: string, ttl: number }]}}
 */
async function getRecords (username, token, domain) {
  const result = await request(`https://api.name.com/v4/domains/${domain}/records`, { auth: `${username}:${token}`, method: 'GET' });
  return result.records;
}

module.exports = {
  getRecords,
};
