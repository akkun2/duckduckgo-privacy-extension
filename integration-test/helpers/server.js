const http = require('http')
const fs = require('fs')
const path = require('path')

function setupServer (redirects, port) {
    return new Promise((resolve, reject) => {
        const server = http.createServer(function (req, res) {
            const url = new URL(req.url, `http://${req.headers.host}`)
            fs.readFile(path.join(__dirname, '..', 'content-scripts', 'pages', url.pathname), (err, data) => {
                if (err) {
                    res.writeHead(404)
                    res.end(JSON.stringify(err))
                    return
                }
                res.writeHead(200)
                res.end(data)
            })
        })
        server.on('listening', () => {
            resolve({
                port: server.address().port,
                close: server.close.bind(server)
            })
        })
        server.listen(port)
    })
}

module.exports.setupServer = setupServer
