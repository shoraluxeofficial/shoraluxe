import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import { NotificationProvider } from './components/common/Notification/Notification.jsx'
import { TrackingProvider } from './components/common/TrackingNotification/TrackingNotification.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotificationProvider>
      <TrackingProvider>
        <App />
      </TrackingProvider>
    </NotificationProvider>
  </StrictMode>,
)
