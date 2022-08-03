import '../styles/globals.css'
import Navigation from '../components/Navigation'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from "../lib/authContext"
import "react-datepicker/dist/react-datepicker.css";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Navigation/>
      <Toaster />
      <Component {...pageProps} />
    </AuthProvider>
  )
}

export default MyApp
