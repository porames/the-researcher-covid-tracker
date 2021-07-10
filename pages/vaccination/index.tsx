
import Map from '../../components/vaccine/map_'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import Province from '../../components/vaccine/provincesTable'
import { National } from '../../components/vaccine/nationalCurve'
import { Projection } from '../../components/vaccine/projectionCurve'
import NationalTable from '../../components/vaccine/nationalTable'
import NationalBars from '../../components/vaccine/nationalBars'
import Manufacturer from '../../components/vaccine/manufacturerCurve'
import VaccinationRace from '../../components/vaccine/vaccinationRace'
import VaccinationRate from '../../components/vaccine/vaccinationRate'
import Footer from '../../components/footer'
import NavHead from '../../components/navHead'
import Link from 'next/link'
import moment from 'moment'
import 'moment/locale/th'

const MetaHead = () => (
  <Head>
    <title>รายงานการฉีดวัคซีน COVID-19 ประเทศไทย - The Researcher</title>
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
)

interface NationalDataProps {
  date: string;
  total_doses: number;
  first_dose: number;
  second_dose: number;
  sinovac_supply: number;
  astrazeneca_supply: number;
  total_supply: number;
  daily_vaccinations: number;
  missing_data?: boolean;
}

const Overview = () => {
  const [updateDate, setUpdateDate] = useState<string>(undefined)
  const [todayData, setTodayData] = useState<NationalDataProps>(undefined)
  return (
    <div className='container text-center mb-4'>
      <h1>ความคืบหน้าการฉีดวัคซีน COVID-19 ในประเทศไทย</h1>
      <span className='text-muted small'>อัพเดทเมื่อ {updateDate && moment(updateDate).add(1, "day").format('LL')}</span>
      <div className='row mt-4' >
        <div className='col-md-8'>
          <National setTodayData={setTodayData} setUpdateDate={setUpdateDate} />
          <NationalTable updateDate={updateDate} />
        </div>
        <div className='col-md-4 '>
          <NationalBars todayData={todayData} />
        </div>
        <div className='col-12'>
          <hr />
        </div>
      </div>
    </div>
  )
}

interface EstimationProps {
  m50_date: number;
  deltaAvg: number;
  required_rate: number;
}

const DetailGraphs = (props) => {
  const [estimation, setEstimation] = useState<EstimationProps>(undefined)
  const [todayRate, setTodayRate] = useState(undefined)
  return (
    <div className='mx-auto text-center container' style={{ maxWidth: 700 }}>
      <div className='my-4'>
        <h2 className='mb-3'>เรากำลังฉีดวัคซีนฉีดได้เร็วแค่ไหน ?</h2>
        <VaccinationRate setTodayRate={setTodayRate} estimation={estimation} />
      </div>
      <div className='my-4'>
        <h2 className='mb-3'>เมื่อไรจะฉีดวัคซีนครบ ?</h2>
        <Projection setEstimation={setEstimation} />
        <p className='mt-3'>ด้วยความเร็วการฉีดวัคซีนเฉลี่ย 7 วัน คาดว่าประชากร 70% ในประเทศไทยจะได้รับวัคซีนในอีก {estimation && Math.ceil((estimation['m50_date'] / 30))} เดือน</p>
      </div>
      <div className='my-4'>
        <h2 className='mb-1'>จำนวนวัคซีนที่ฉีดแยกตามผู้ผลิต</h2>
        <p className='text-muted mb-3'>เส้นแสดงจำนวนค่าเฉลี่ย 7 วันของวัคซีนยี่ห้อต่าง ๆ ที่ฉีดทั่วประเทศ</p>
        <Manufacturer />
      </div>
    </div>
  )
}

export default function Vaccine() {
  return (
    <>
      <NavHead />
      <MetaHead />
      <div className='dark-theme py-5'>
        <Overview />
        <DetailGraphs />
        <div className="container my-5">
          <hr />
        </div>
        <Map />
        <div className='container mt-4 mb-4' style={{ maxWidth: 800 }}>
          <h2 className='text-center mt-5'>การฉีดวัคซีนรายจังหวัดแยกตามอายุ</h2>
          <Province />
        </div>
        <VaccinationRace />
        <div className='container mt-4 mb-4' style={{ maxWidth: 800 }}>
          <div className='row mt-5'>
            <div className='col-12'>
              <hr />
            </div>
            <div className='col-md-6'>
              <Link href='/'>
                <a>
                  <div className='aspect-ratio-16-9' style={{ backgroundImage: 'url(/cases-map.png)' }}></div>
                </a>
              </Link>
            </div>
            <div className='col-md-6 d-flex align-items-center'>
              <Link href='/'>
                <a>
                  <h5 className='mb-0 d-flex align-items-center'>ติดตามสถานการณ์การระบาด COVID-19 <img src='chevron_right_white_24dp.svg' /></h5>
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