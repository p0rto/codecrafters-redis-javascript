const net = require("net");

const map = new Map();

// Uncomment this block to pass the first stage
const server = net.createServer((connection) => {
  connection.on("data", (data) => {
    const parsedArgs = parseResp(data.toString());
    console.log(parsedArgs);
    let output;
    switch (parsedArgs[0].toLowerCase()) {
      case "ping":
        output = handlePing();
        break;
      case "echo":
        output = handleEcho(parsedArgs);
        break;
      case "set":
        output = handleSet(parsedArgs);
        console.log("output", output);
        break;
      case "get":
        output = handleGet(parsedArgs);
        break;
      default:
        return null;
    }

    connection.write(output);
  });
});

function handlePing() {
  return "+PONG\r\n";
}

function handleEcho(data) {
  if (data.length < 2) {
    throw new Error("Missing args");
  }
  return `$${data[1].length}\r\n${data[1]}\r\n`;
}

function handleSet(data) {
  if (data.length < 3) {
    throw new Error("Missing args");
  }

  map.set(data[1], data[2]);
  return "+OK\r\n";
}

function handleGet(data) {
  if (data.length < 2) {
    throw new Error("Missing args");
  }
  const val = map.get(data[1]);

  return val ? `$${val.length}\r\n${val}\r\n` : "$-1\r\n";
}

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

server.listen(6379, "127.0.0.1");
