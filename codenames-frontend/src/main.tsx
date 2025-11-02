import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import './i18n/i18n.ts';
import { ToastProvider } from "./components/Toast/ToastContext.tsx";
import ToastContainer from "./components/Toast/ToastContainer.tsx";
import {SocketProvider} from "./providers/SocketProvider.tsx";
import {ModalProvider} from "./providers/ModalProvider.tsx";

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  //   <App />
  // </StrictMode>
    <ToastProvider>
        <SocketProvider>
            <ModalProvider>
                <App />
                <ToastContainer />
            </ModalProvider>
        </SocketProvider>
    </ToastProvider>
)
