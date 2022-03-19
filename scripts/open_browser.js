const open = require('open');
const waitPort = require("wait-port")

async function main() {
    await Promise.all([
        waitPort({
            host: "localhost",
            port: 3000,
            timeout: 120000
        }),
        waitPort({
            host: "localhost",
            port: 4000,
            timeout: 120000
        })
    ])
    await open('http://localhost:4000'); // Firebase panel
    await open('http://localhost:3000'); // Frontend
}

main()