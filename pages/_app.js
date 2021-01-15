import '../styles/css/app.css'
import '../styles/css/theme.css'
import ReactGA from 'react-ga';

function MyApp({ Component, pageProps }) {
  
  ReactGA.initialize(process.env.NEXT_PUBLIC_gAnalytics)
  if (typeof (window) !== 'undefined') {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }

  return <Component {...pageProps} />
}

export default MyApp
