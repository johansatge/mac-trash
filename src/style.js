module.exports = {
  style: {
    black: (string) => applyStyle(string, '\x1b[30m'),
    red: (string) => applyStyle(string, '\x1b[31m'),
    green: (string) => applyStyle(string, '\x1b[32m'),
    yellow: (string) => applyStyle(string, '\x1b[33m'),
    blue: (string) => applyStyle(string, '\x1b[34m'),
    magenta: (string) => applyStyle(string, '\x1b[35m'),
    cyan: (string) => applyStyle(string, '\x1b[36m'),
    white: (string) => applyStyle(string, '\x1b[37m'),
    underline: (string) => applyStyle(string, '\x1b[4m'),
  },
}

function applyStyle(string, styleTag) {
  const resetTag = '\x1b[0m'
  return `${styleTag}${string}${resetTag}`
}
