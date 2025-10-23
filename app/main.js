const net = require("net");
const { parseResp } = require("./parser/resp-parser");

const NULL_BULK_STRING = "$-1\r\n";

const map = new Map();
const expirationMap = new Map();

// Uncomment this block to pass the first stage
const server = net.createServer((connection) => {
  connection.on("data", (data) => {
    const parsedArgs = parseResp(data.toString());
    console.log(parsedArgs);
    const [command] = parsedArgs;
    let output;
    switch (command.toLowerCase()) {
      case "ping":
        output = handlePing();
        break;
      case "echo":
        output = handleEcho(parsedArgs);
        break;
      case "set":
        output = handleSet(parsedArgs);
        break;
      case "get":
        output = handleGet(parsedArgs);
        break;
      case "rpush":
        output = handleRPush(parsedArgs);
        break;
      default:
        output = NULL_BULK_STRING;
    }

    connection.write(output);
  });
});

function handlePing() {
  return "+PONG\r\n";
}

function handleEcho(data) {
  const [_, value] = data;
  if (!value) {
    throw new Error("Missing args");
  }
  return `$${value.length}\r\n${value}\r\n`;
}

function handleSet(data) {
  const [_, key, value, option, ttl] = data;
  if (!key || !value) {
    throw new Error("Missing args");
  }
  console.log("option", option, "ttl", ttl);
  if (option && ttl) {
    const expTime =
      option.toLowerCase() === "px" ? Number(ttl) : Number(ttl) * 1000;
    expirationMap.set(key, Date.now() + expTime);
  }
  map.set(key, value);
  return "+OK\r\n";
}

function handleGet(data) {
  const [_, key] = data;
  if (!key) {
    throw new Error("Missing args");
  }
  const expirationTime = expirationMap.get(key);
  const storedValue = map.get(key);

  if ((expirationTime && expirationTime < Date.now()) || !storedValue) {
    return NULL_BULK_STRING;
  }

  return `$${storedValue.length}\r\n${storedValue}\r\n`;
}

function handleRPush(data) {
  const [_, key, ...values] = data;
  if (!key || !values) {
    throw new Error("Missing args");
  }

  const list = map.get(key) || [];

  list.push(...values);
  map.set(key, list);

  return `:${list.length}\r\n`;
}

server.listen(6379, "127.0.0.1");
