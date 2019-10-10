const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

/**
 * Generate dns.conf
 * @param {[string]} domains
 * @param {string} zoneDir
 * @param {string} pidFile
 * @param {[string]} forwarders
 * @returns {string}
 */
function generateDnsConf (domains, zoneDir, pidFile, forwarders) {
  return `
options {
  directory "${zoneDir}";
  pid-file "${pidFile}";
  forwarders { ${forwarders.join('; ')}; };
};
${domains.map((domain) => {
  return `
zone "${domain}" IN {
  type master;
  file "${domain}.zone";
};
`
}).join('\n')}
`
}

/**
 * Save record-list
 * @param {[string]} domains
 * @param {string} zoneDir
 * @param {string} pidFile
 * @param {[string]} forwarders
 * @param {string} dnsConfFile
 * @returns {boolean}
 */
function saveDnsConf (domains, zoneDir, pidFile, forwarders, dnsConfFile) {
  const zone = generateDnsConf(domains, zoneDir, pidFile, forwarders);
  const oldZone = fs.existsSync(dnsConfFile) ? fs.readFileSync(dnsConfFile).toString() : undefined;
  const updateZone = !oldZone || zone != oldZone;

  if (updateZone) {
    childProcess.execSync(`mkdir -p ${path.dirname(dnsConfFile)}`);
    fs.writeFileSync(dnsConfFile, zone);

    console.log('Saved Dns Conf');
  }

  return updateZone;
}

/**
 * Reload dns
 * @param {[string]} domainFiles
 * @param {string} zoneDir
 * @param {string} pidFile
 * @param {string} dnsConfFile
 */
function reloadDns (domains, zoneDir, pidFile, dnsConfFile) {
  childProcess.execSync(`named-checkconf ${dnsConfFile}`);
  for (const domain of domains) {
    const domainFile = path.join(zoneDir, `${domain}.zone`);
    try {
      // named-checkzone does not write it's error-output to stderr
      childProcess.execSync(`named-checkzone ${domain} ${domainFile}`);
    } catch (e) {
      childProcess.execSync(`named-checkzone ${domain} ${domainFile}`, { stdio: 'inherit' });
      throw e;
    }
  }

  if (fs.existsSync(pidFile)) {
    childProcess.execSync(`kill $( cat ${pidFile} )`);
  }
  childProcess.execSync(`mkdir -p ${path.dirname(pidFile)}`);
  childProcess.execSync(`named`);

  console.log('Reloaded Dns');
}

module.exports = {
  saveDnsConf,
  reloadDns,
};
