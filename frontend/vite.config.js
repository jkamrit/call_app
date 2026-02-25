import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Point to the mkcert-generated certs in the backend folder
// Run: mkcert localhost 127.0.0.1 <YOUR_LOCAL_IP>  (inside backend/)
const certDir = path.resolve(__dirname, '../backend')
const certFile = path.join(certDir, '192.168.0.133.pem')
const keyFile = path.join(certDir, '192.168.0.133-key.pem')
const hasCerts = fs.existsSync(certFile) && fs.existsSync(keyFile)

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '7bff-49-37-181-90.ngrok-free.app'
    ],
    host: true,              // expose to all network interfaces (0.0.0.0)
    https: hasCerts
      ? { cert: fs.readFileSync(certFile), key: fs.readFileSync(keyFile) }
      : false,              // falls back to HTTP if certs not generated yet
  },
})
