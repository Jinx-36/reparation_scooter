// import winston from 'winston'
// import path from 'path'

// const logPath = path.join(process.cwd(), 'logs')

// const logger = winston.createLogger({
//   level: 'debug',
//   format: winston.format.json(),
//   transports: [
//     new winston.transports.File({ 
//       filename: path.join(logPath, 'api-errors.log'),
//       level: 'error'
//     }),
//     new winston.transports.File({
//       filename: path.join(logPath, 'api-combined.log')
//     })
//   ]
// })

// if (process.env.NODE_ENV !== 'production') {
//   logger.add(new winston.transports.Console({
//     format: winston.format.simple()
//   }))
// }

// export default logger

import fs from 'fs'
import path from 'path'

const logPath = path.join(process.cwd(), 'api-debug.log')

export function logRequest(req) {
  const entry = {
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body
  }
  
  fs.appendFileSync(logPath, JSON.stringify(entry) + '\n')
  console.debug('[DEBUG]', entry) // Visible dans le terminal
}

export function logError(error) {
  const entry = {
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack
  }
  
  fs.appendFileSync(logPath, JSON.stringify(entry) + '\n')
  console.error('[ERROR]', entry)
}