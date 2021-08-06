
import Map from '../../components/vaccine/map_'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import Province from '../../components/vaccine/provincesTable'
import { National } from '../../components/vaccine/nationalCurve'
import { Projection } from '../../components/vaccine/projectionCurve'
import NationalTable from '../../components/vaccine/nationalTable'
import NationalBars from '../../components/vaccine/nationalBars'
import Manufacturer from '../../components/vaccine/manufacturer'
import VaccinationRace from '../../components/vaccine/vaccinationRace'
import VaccinationRate from '../../components/vaccine/vaccinationRate'
import SupplyTable from '../../components/vaccine/supplyTable'
import Footer from '../../components/footer'
import NavHead from '../../components/navHead'
import * as Scroll from 'react-scroll'
import Link from 'next/link'
import { getVaccineStats, getProvinceVaccination, getVaccineManufacturer, getProvinceVaccinationByManufacturer, GetVacTimeline, GetProvinceVacAllocation } from '../../components/getData'
import { VaccinationTimeseries, ProvinceVaccination } from '../../components/vaccine/types'
import moment from 'moment'
import 'moment/locale/th'

const Element = Scroll.Element
const ScrollLink = Scroll.Link

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
    <meta property="og:title" content="รายงานการฉีดวัคซีน COVID-19 ประเทศไทย - The Researcher" />
    <meta property="og:image" content="https://covid-19.researcherth.co/cover-vaccination.png" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:title" content="รายงานการฉีดวัคซีน COVID-19 ประเทศไทย - The Researcher" />
    <meta property="twitter:image" content="https://covid-19.researcherth.co/cover-vaccination.png" />
  </Head>
)



const Overview = (props) => {
  const [updateDate, setUpdateDate] = useState<string>(undefined)
  const [todayData, setTodayData] = useState<VaccinationTimeseries>(undefined)
  return (
    <div className='container text-center mb-4'>
      <h1>ความคืบหน้าการฉีดวัคซีน COVID-19 ในประเทศไทย</h1>
      <span className='text-muted small'>อัพเดทเมื่อ {updateDate && moment(updateDate).format('LL')}</span>
      <div className='row mt-4' >
        <div className='col-md-8'>
          <National vaccination_timeseries={props.vaccination_timeseries} setTodayData={setTodayData} setUpdateDate={setUpdateDate} />
          <NationalTable
            vaccination_timeseries={props.vaccination_timeseries}
            updateDate={updateDate}
            vac_timeline={props.vac_timeline}
          />
        </div>
        <div className='col-md-4 '>
          <NationalBars todayData={todayData} />
        </div>
        <div className='col-12'>
          <hr />
        </div>
      </div>
      <div className='mt-3 mb-5 d-flex justify-content-center align-tiems-center flex-md-row flex-column'>
        <h6 className='mb-md-0 mb-3 mr-3 align-self-center'>
          ข้ามไปยัง:
        </h6>
        <div className='nav-links'>
          <ScrollLink to="map" smooth={true} duration={500} hash={true} offset={-50} >
            <button className='btn btn-dark'>แผนที่วัคซีน</button>
          </ScrollLink>
          <ScrollLink to="by-ages" smooth={true} duration={500} hash={true} offset={-50} >
            <button className='btn btn-dark'>กลุ่มเป้าหมาย</button>
          </ScrollLink>
          <ScrollLink to="manufacturer" smooth={true} duration={500} hash={true} offset={-50} >
            <button className='btn btn-dark'>การจัดสรรวัคซีนรายยี่ห้อ</button>
          </ScrollLink>
          <ScrollLink to="allocation" smooth={true} duration={500} hash={true} offset={-50} >
            <button className='btn btn-dark'>การกระจายวัคซีน</button>
          </ScrollLink>
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
    <Element name='vaccination-rates'>
      <div className='mx-auto text-center container' style={{ maxWidth: 700 }}>
        <div className='my-4'>
          <h2 className='mb-3'>เรากำลังฉีดวัคซีนฉีดได้เร็วแค่ไหน ?</h2>
          <VaccinationRate vaccination_timeseries={props.vaccination_timeseries} setTodayRate={setTodayRate} estimation={estimation} />
        </div>
        <div className='my-4'>
          <h2 className='mb-3'>เมื่อไรจะฉีดวัคซีนครบ ?</h2>
          <Projection vaccination_timeseries={props.vaccination_timeseries} setEstimation={setEstimation} />
          <p className='mt-3'>ด้วยความเร็วการฉีดวัคซีนเฉลี่ย 7 วัน คาดว่าประชากร 70% ในประเทศไทยจะได้รับวัคซีนในอีก {estimation && Math.ceil((estimation['m50_date'] / 30))} เดือน</p>
        </div>
      </div>
    </Element>
  )
}



export async function getStaticProps() {
  return {
    props: {
      vaccination_timeseries: await getVaccineStats(),
      province_vaccination: await getProvinceVaccination(),
      manufacturer_timeseries: await getVaccineManufacturer(),
      province_vaccine_manufacturer: await getProvinceVaccinationByManufacturer(),
      vac_timeline: await GetVacTimeline(),
      province_allocation: await GetProvinceVacAllocation()
    }
  }
}

type VaccinePageProps = {
  vaccination_timeseries: VaccinationTimeseries[],
  province_vaccination: ProvinceVaccination,
  manufacturer_timeseries: any,
  province_vaccine_manufacturer: any,
  vac_timeline: any,
  province_allocation: any
}

export default function Vaccine(props: VaccinePageProps) {
  return (
    <>
      <NavHead />
      <MetaHead />
      <div className='dark-theme py-5'>
        <Overview
          vac_timeline={props.vac_timeline}
          vaccination_timeseries={props.vaccination_timeseries} />
        <DetailGraphs vaccination_timeseries={props.vaccination_timeseries} />
        <div className="container my-5">
          <hr />
        </div>
        <Element name='map'>
          <Map province_vaccination={props.province_vaccination} />
        </Element>
        <div className="container my-5">
          <hr />
        </div>
        <Element name='by-ages'>
          <div className='container mt-4 mb-4' style={{ maxWidth: 800 }}>
            <h2 className='text-center mt-5'>ความคืบหน้าการฉีดวัคซีนตามช่วงอายุ</h2>
            <Province province_vaccination={props.province_vaccination} />
          </div>
        </Element>
        <div className="container my-5">
          <hr />
        </div>
        <Element name='manufacturer'>
          <Manufacturer
            manufacturer_timeseries={props.manufacturer_timeseries}
            province_vaccine_manufacturer={props.province_vaccine_manufacturer}
          />
        </Element>
        <div className="container my-5">
          <hr />
        </div>
        <Element name='allocation'>
          <VaccinationRace />
          <div className='container mt-5 mb-4'>
            <SupplyTable
              province_allocation={props.province_allocation}
              province_vaccine_manufacturer={props.province_vaccine_manufacturer}
              province_vaccination={props.province_vaccination}
            />
          </div>
        </Element>
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
                  <h5 className='mb-0 d-flex align-items-center mr-2'>
                    ติดตามสถานการณ์การระบาด COVID-19
                  </h5>
                </a>
              </Link>
              <span className="material-icons">chevron_right</span>
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