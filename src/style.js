module.exports = {
  style: {
    red: (string) => applyStyle(string, '\x1b[31m'),
    cyan: (string) => applyStyle(string, '\x1b[36m'),
    underline: (string) => applyStyle(string, '\x1b[4m'),
    dim: (string) => applyStyle(string, '\x1b[2m'),
  },
}

function applyStyle(string, styleTag) {
  const resetTag = '\x1b[0m'
  return `${styleTag}${string}${resetTag}`
}
