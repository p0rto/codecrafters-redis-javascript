function parseResp(data) {
  const lines = data.split("\r\n").filter(Boolean);

  let i = 1;
  const values = [];

  while (i < lines.length) {
    if (!lines[i].startsWith("$")) {
      values.push(lines[i]);
    }
    i++;
  }
  return values;
}

module.exports = { parseResp };
