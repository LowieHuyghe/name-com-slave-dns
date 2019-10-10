const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

/**
 * Get record-list
 * @param {string} domain Domain
 * @param {[{ host: string, typeL string, answer: string, ttl: number, priority: number | undefined }]} records Records
 * @returns {string}
 */
function generateZone (domain, records) {
  const nonNsRecords = records.filter((record) => record.type !== 'NS');
  const serial = domain.split('').map((char) => char.charCodeAt(0)).join('').slice(0, 9);
  const minTTL = Math.min(...records.map(record => record.ttl || 300));

  return `
$ORIGIN ${domain}.
$TTL ${minTTL}

@ IN SOA ns1.${domain}. webmaster.${domain}. (
                ${serial}       ; serial
                28800           ; refresh
                7200            ; retry
                86400           ; expire
                ${minTTL}       ; min TTL
                )

@ IN NS ns1.${domain}.
ns1 IN A 127.0.0.1

${nonNsRecords.map((record) => {
  const host = record.host ? `${record.host} ` : '@ ';
  const ttl = record.ttl ? `${record.ttl} ` : '';
  const type = record.type ? `${record.type} ` : '';
  const priority = record.priority ? `${record.priority} ` : '';

  let answer = '';
  if (record.answer) {
    if (/[A-Za-z]\.[A-Za-z]+$/.test(record.answer)) {
      answer = `${record.answer}.`
    } else {
      answer = record.answer
    }
    answer = `${answer} `
  }

  return `${host}${ttl}IN ${type}${priority}${answer}`
}).join('\n')}
`
}

/**
 * Save record-list
 * @param {string} domain Domain
 * @param {string} zoneDir
 * @param {[{ host: string, typeL string, answer: string, ttl: number, priority: number | undefined }]} records Records
 * @returns {boolean}
 */
function saveZone (domain, zoneDir, records) {
  const zone = generateZone(domain, records);
  const domainFile = path.join(zoneDir, `${domain}.zone`);
  const oldZone = fs.existsSync(domainFile) ? fs.readFileSync(domainFile).toString() : undefined;
  const updateZone = !oldZone || zone != oldZone;

  if (updateZone) {
    childProcess.execSync(`mkdir -p ${path.dirname(domainFile)}`);
    fs.writeFileSync(domainFile, zone);

    console.log(`Saved Zone ${domain}`);
  }

  return updateZone;
}

module.exports = {
  saveZone,
};
