# Name.com Slave DNS

Slave DNS Script for Name.com


## Installation

Setup the config-file:
```bash
cat << EOF > PATH/TO/MY/CONFIG.js
module.exports = {
  domains: ['example.com'],
  forwarders: ['1.1.1.1', '1.0.0.1'],
  username: 'MyUsername',
  token: process.env.TOKEN,
};
EOF
```

## Usage

### With Docker

The config-file should be located in the data-directory.
```yaml
version: "3"
services:
  name-com-slave-dns:
    image: lowieh/name-com-slave-dns:latest
    volumes:
    - ./data:/data
    ports:
      - "53:53/tcp"
      - "53:53/udp"
    environment:
      - TOKEN=mytoken1234567890
```

### With CMD

```bash
npm install -g git+https://git@github.com/LowieHuyghe/name-com-slave-dns.git@1.0.0

CONFIG=config.js TOKEN=mytoken1234567890 name-com-slave-dns
```
