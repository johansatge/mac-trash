[![Version](https://img.shields.io/npm/v/mac-trash.svg)](https://github.com/johansatge/mac-trash/releases)
[![Downloads](https://img.shields.io/npm/dm/mac-trash.svg)](https://www.pkgstats.com/pkg:mac-trash)
[![Last commit](https://badgen.net/github/last-commit/johansatge/mac-trash)](https://github.com/johansatge/mac-trash/commits/master)
[![Install size](https://badgen.net/packagephobia/install/mac-trash)](https://packagephobia.com/result?p=mac-trash)

![Icon](icon.png)

> Zero-dependency macOS CLI tool to move files to the Trash

---

* [Demo](#demo)
* [Installation](#installation)
* [Usage](#usage)
  * [Options](#options)
* [Changelog](#changelog)
* [License](#license)

## Demo

@todo GIF & icon

## Installation

_This module needs Node `>=10`._

Install with [npm](https://www.npmjs.com/):

```bash
$ npm install mac-trash --global --production
```

## Usage

```bash
$ trash somefile.txt /some/other/file.txt
```

### Options

Show debug information:

```bash
$ trash --verbose /some/file.txt
```

Show contextual help:

```bash
$ trash --help
```

Show version:

```bash
$ trash --version
```

## Changelog

This project uses [semver](http://semver.org/).

| Version | Date | Notes |
| --- | --- | --- |
| `1.0.0` | 2020-11-11 | Initial version |

## License

This project is released under the [MIT License](license.md).
