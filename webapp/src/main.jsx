import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthProvider'
import { DeviceProvider } from './device/DeviceProvider'
import './index.css'

// DeviceProvider sits above <App>, which owns <Routes>, so navigating between
// routes never remounts the hook holding the live BLE / serial connection.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <DeviceProvider>
          <App />
        </DeviceProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
