const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this block to pass the first stage
const server = net.createServer((connection) => {
  connection.on("data", (data) => {
    const parsedArgs = parseResp(data.toString());
    for (let i = 0; i < parsedArgs.length; i++) {
      if (parsedArgs[i].toLowerCase() === "ping") {
        connection.write("+PONG\r\n");
      } else if (parsedArgs[i].toLowerCase() === "echo") {
        const valueToEcho = parsedArgs[i + 1];
        connection.write(`$${valueToEcho.length}\r\n${valueToEcho}\r\n`);
      }
    }
  });
});

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
