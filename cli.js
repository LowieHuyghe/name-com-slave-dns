#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { getRecords } = require('./src/namedotcom');
const { saveZone } = require('./src/zones');
const { saveDnsConf, reloadDns } = require('./src/dns');


(async () => {

  const configFile = process.env.CONFIG || path.join(__dirname, 'config.js');
  if (!fs.existsSync(configFile)) {
    throw new Error('No config found. Try the environment variable CONFIG or place config.js in the root of this project');
  }
  const config = require(configFile);

  const zoneDir = '/var/bind';
  const pidFile = '/var/run/named/named.pid';
  const dnsConfFile = '/etc/bind/named.conf';

  const {
    // Required
    domains,
    forwarders,
    username,
    token,
  } = config

  if (!domains || !domains.length || !forwarders || !forwarders.length || !username || !token) {
    throw new Error('Not all required config was set (domains, forwarders, username, token)');
  }

  // Set resolve-conf
  const resolvConf = `nameserver ${forwarders[0]}`;
  fs.writeFileSync('/etc/resolv.conf', resolvConf);

  let somethingChanged = false;

  // Update zones
  for (const domain of domains) {
    const records = await getRecords(username, token, domain);
    const updated = saveZone(domain, zoneDir, records);
    somethingChanged = somethingChanged || updated;
  }

  const updatedDnsConf = saveDnsConf(domains, zoneDir, pidFile, forwarders, dnsConfFile);
  somethingChanged = somethingChanged || updatedDnsConf;

  if (somethingChanged) {
    reloadDns(domains, zoneDir, pidFile, dnsConfFile);
  }

  console.log('Finished update');

})().catch((err) => {
  console.error(err);
  process.exit(1);
});
