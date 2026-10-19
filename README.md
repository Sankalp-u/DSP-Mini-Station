# DSP Mini Station

An interactive web app for DSP and control-system analysis. Enter a signal or a transfer function and it plots the results in the browser.

## Features
- Time-domain signal visualization
- FFT spectrum analyzer
- Laplace and stability analysis
- Pole-zero map
- Bode plot
- Root locus
- Built-in signal assistant (signal classification and control-system hints)

## Tech stack
- Frontend: React, Vite, Tailwind CSS, Chart.js
- Backend: Node.js, Express
- DSP engines (FFT, Fourier, Laplace, Bode, pole-zero, root locus) in `signal-lab/`

## Project layout
- `client/` - React + Vite frontend
- `server/` - Express API (`POST /analyze`)
- `signal-lab/` - analysis engines used by the server

## Run locally

Backend:

```bash
cd server
npm install
node server.js
```

Frontend (in a second terminal):

```bash
cd client
npm install
npm run dev
```

## Author
Sankalp Singh Bais
