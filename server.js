const express = require('express')
const app = express()
const server = require('http').Server(app)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {console.log(`Listening in port: ${PORT}`)})