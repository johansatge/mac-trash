module.exports = {
  style: {
    red: (string) => applyStyle(string, '\x1b[31m'),
    cyan: (string) => applyStyle(string, '\x1b[36m'),
    underline: (string) => applyStyle(string, '\x1b[4m'),
    // black: (string) => applyStyle(string, '\x1b[30m'),
    // green: (string) => applyStyle(string, '\x1b[32m'),
    // yellow: (string) => applyStyle(string, '\x1b[33m'),
    // blue: (string) => applyStyle(string, '\x1b[34m'),
    // magenta: (string) => applyStyle(string, '\x1b[35m'),
    // white: (string) => applyStyle(string, '\x1b[37m'),
  },
}

function applyStyle(string, styleTag) {
  const resetTag = '\x1b[0m'
  return `${styleTag}${string}${resetTag}`
}
