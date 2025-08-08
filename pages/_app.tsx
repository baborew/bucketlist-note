import '../styles/globals.css';
import type { AppProps } from 'next/app';
import AuthGate from '../components/AuthGate';
export default function MyApp({ Component, pageProps }: AppProps) {
  return (<AuthGate><Component {...pageProps} /></AuthGate>);
}
