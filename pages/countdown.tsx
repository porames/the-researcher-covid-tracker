import CountdownCurve from '../components/vaccine/countdownCurve'
import moment from 'moment'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import NavHead from '../components/navHead'
import Footer from '../components/footer'
type LatestDataProps = {
    date: string;
    first_dose: number;
    second_dose: number;
    [key: string]: any;
}

export default function Countdown() {
    const [latestData, setLatestData] = useState<LatestDataProps>()
    return (
        <>
            <Head>
                <title>นับถอยหลังเปิดประเทศ 120 วัน - The Researcher</title>
                <link rel="preconnect" href="https://fonts.gstatic.com" />
                <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@600&family=Sarabun:wght@400;500;700&display=swap" rel="stylesheet" />
                <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_gAnalytics}`}></script>
                <script dangerouslySetInnerHTML={{
                    __html: `window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-V6Q0C8MG7Q');`}} />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://covid-19.researcherth.co/cover-vaccination.png" />
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:image" content="https://covid-19.researcherth.co/cover-vaccination.png" />
            </Head>
            <NavHead />
            <div className='dark-theme py-5'>
                <div className='container' style={{ maxWidth: 810 }}>
                    <div className='text-center mb-4'>
                        <h1>เปิดประเทศ 120 วัน ถึงไหนแล้ว?</h1>
                        <h3>
                            เป้าหมาย: ฉีดวัคซีนเข็มแรกให้คนไทย 50 ล้านคน<br />
                            เหลือเวลาอีก <span className='badge badge-light'>{moment("2021-10-15").diff(moment(), 'days')}</span> วัน
                            {latestData &&
                                <span>
                                    ต้องฉีดวัคซีนให้อีก  <span className='badge badge-light'>{(50 * 1000 * 1000 - latestData['first_dose']).toLocaleString()}</span> คน
                                </span>
                            }
                        </h3>
                    </div>
                    <CountdownCurve setLatestData={setLatestData} />
                    <hr className='mt-5' />
                    <div className='py-4'>
                        <h5 className='text-center'>แชร์เว็บไซต์นี้</h5>
                        <div className='mt-3 mb-2 d-flex justify-content-center'>
                            <a className='px-3' target='_blank' href='https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fcovid-19.researcherth.co%2Fcountdown'>
                                <img width={32} height={32} src='/facebook_white_24dp.svg' />
                            </a>
                            <a className='px-3' target='_blank' href='https://twitter.com/intent/tweet?text=https://covid-19.researcherth.co/countdown'>
                                <img width={32} height={32} src='/twitter_logo-white.svg' />
                            </a>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-12'>
                            <hr />
                        </div>
                        <div className='col-md-6'>
                            <Link href='/vaccination'>
                                <a>
                                    <div className='aspect-ratio-16-9' style={{ backgroundImage: 'url(/vax-coverage-map.png)' }}></div>
                                </a>
                            </Link>
                        </div>
                        <div className='col-md-6 d-flex align-items-center'>
                            <Link href='/vaccination'>
                                <a>
                                    <h5 className='mb-0 d-flex align-items-center'>ติดตามความคืบหน้าการฉีดวัคซีน <img src='chevron_right_white_24dp.svg' /></h5>
                                </a>
                            </Link>
                        </div>
                        <div className='col-12'>
                            <hr />
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        </>
    )
}