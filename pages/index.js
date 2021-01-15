import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  if (typeof window !== 'undefined') {
    router.push('/covid-19')
  }
  return(
    <div>redirect</div>
  )
}
