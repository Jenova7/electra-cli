# Electra CLI

NodeJS CLI tools for Electra daemon and blockchain.

[![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/electra-cli.svg?style=flat-square)](https://www.npmjs.com/package/electra-cli)
[![David](https://img.shields.io/david/Electra-project/electra-cli.svg?style=flat-square)](https://david-dm.org/Electra-project/electra-cli)
[![David](https://img.shields.io/david/dev/Electra-project/electra-cli.svg?style=flat-square)](https://david-dm.org/InspiredBeings/electra-cli)

[![NSP Status](https://nodesecurity.io/orgs/electra-project/projects/60adf17a-da9b-467c-96ef-84ae7e4280b6/badge)](https://nodesecurity.io/orgs/electra-project/projects/60adf17a-da9b-467c-96ef-84ae7e4280b6)
[![Known Vulnerabilities](https://snyk.io/test/github/Electra-project/electra-cli/badge.svg)](https://snyk.io/test/github/Electra-project/electra-cli)

## Contents

- [Installation and Update](#installation-and-update)
  - [Local](#local)
    - [Electra CLI Tools Installation](#electra-cli-tools-installation)
    - [Electra CLI Tools Update](#electra-cli-tools-update)
  - [Remote](#remote)
    - [Bootstrap Node Installation](#bootstrap-node-installation)
    - [Bootstrap Node Update](#bootstrap-node-update)
- [Usage](#usage)
  - [Electra CLI Tools Usage](#electra-cli-tools-usage)

## Installation and Update

### Local

The local installation is useful if you want to use **Electra CLI Tools**.

#### Electra CLI Tools Installation

**Prerequisites:**
- [Node v8+ (with npm)](https://nodejs.org)

```bash
npm i -g electra-cli
```

#### Electra CLI Tools Update

```bash
npm i -g electra-cli
```

### Remote

The remote installation is useful if you want to run a **Bootstrap Node** to help the network and [publish it](https://stats.uptimerobot.com/YykwxtXwq) to help fasten the Electra wallets network bootstrap.

It is recommanded to use a real hosted server (a VPS is enough) with at least 2GB of memory.

#### Bootstrap Node Installation

**Prerequisites:**
- APT-based OS (Debian, Ubuntu, etc).
- Full root access.

```bash
cd ~
sudo apt-get update
sudo apt-get install git -y
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
# or: curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
source ~/.bashrc
nvm install 10
git clone https://github.com/Electra-project/electra-cli.git
cd electra-cli
npm i
npm start
```

> **Note**<br>
> You may need to bind your internal IP port (5817) to your external IP one (same port) via your host online management website (Azure, AWS, etc).

#### Bootstrap Node Update

```bash
cd ~/electra-cli
git pull
npm i
npm start
```

## Usage

### Electra CLI Tools Usage

The usage part only concerns local installtions as a tool belt.

    electra <command>

Just type `electra` to show the manual and list the available commands.
