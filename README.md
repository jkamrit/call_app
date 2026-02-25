# 🚀 Real-Time 1-to-1 Video Calling Web App

A modern, low-latency **one-on-one video calling platform** built using:

- ⚛️ React (Frontend)
- 🌐 WebRTC (Peer-to-Peer Media Streaming)
- 🐍 Django (Backend)
- ⚡ Django Channels + Daphne (WebSocket Signaling)

---

## ✨ Overview

This application enables secure, real-time 1-to-1 video and audio communication directly in the browser using WebRTC.

It uses Django Channels with Daphne as the ASGI server to handle WebSocket-based signaling, while WebRTC establishes a direct peer-to-peer connection between users for ultra-low latency communication.

No third-party video APIs. Fully custom signaling architecture.

---

## 🧠 Architecture
React (Frontend UI)
↓
WebSocket Signaling (Django Channels + Daphne)
↓
WebRTC Peer Connection (P2P Media Stream)


---

## 🔥 Features

- 🎥 Real-time 1-to-1 video calling
- 🎙️ Audio + Video streaming
- 🔐 Encrypted peer-to-peer connection
- ⚡ Low latency communication
- 🧩 Modular full-stack architecture
- 🌍 Works in modern browsers
- 🔄 Auto reconnection handling

---

## 🛠 Tech Stack

| Layer        | Technology |
|-------------|------------|
| Frontend     | React.js |
| Backend      | Django |
| Realtime     | Django Channels |
| ASGI Server  | Daphne |
| Media Layer  | WebRTC |
| Transport    | WebSockets |


git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
