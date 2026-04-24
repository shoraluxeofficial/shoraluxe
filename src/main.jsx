import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './styles/index.css'
import App from './App.jsx'
import { ShopProvider } from './context/ShopContext.jsx'
import { NotificationProvider } from './components/common/Notification/Notification.jsx'
import { TrackingProvider } from './components/common/TrackingNotification/TrackingNotification.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '996608521333-74f88g99gehddhp19c73c8sq5suuvr76.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <ShopProvider>
          <NotificationProvider>
            <TrackingProvider>
              <App />
            </TrackingProvider>
          </NotificationProvider>
        </ShopProvider>
      </GoogleOAuthProvider>
    </HelmetProvider>
  </StrictMode>,
)
