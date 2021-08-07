import Head from 'next/head'
import Map from '../components/map_'
import InfectionCurve from '../components/infectionCurve'
import DeathsCurve from '../components/deathsCurve'
import HospitalizedCurve from '../components/hospitalizedCurve'
import VaccinePreview from '../components/vaccinePreview'
import NationalTable from '../components/nationalTable.js'
import Province from '../components/provincesGraph'
import TestingGraph from '../components/testing/testingGraph'
import TestingTable from '../components/testing/testingTable'
import React, { useEffect, useState } from 'react'
import moment from 'moment'
import 'moment/locale/th'
import Link from 'next/link'
import NavHead from '../components/navHead'
import Footer from '../components/footer'
import { getNationalStats, getDistrictData, getProvinceData, getVaccineStats, getTestingData, getProvinceGraphs } from '../components/getData'

const NationalCurveSection = (props) => {
  const [updatedDate, setUpdatedDate] = useState(undefined)
  return (
    <div className='container mb-4' style={{ maxWidth: 810 }}>
      <div className='text-center'>
        <h1>สถานการณ์โรค COVID-19 ในประเทศไทย</h1>
        {updatedDate &&
          <small style={{ opacity: 0.6 }}>อัพเดท {moment(updatedDate).format('LL')}</small>
        }
      </div>
      <hr className='my-4' />
      <div className='row'>
        <div className='col-12 mb-3'>
          <h4 className='mb-0'>ผู้ติดเชื้อใหม่รายวัน</h4>
          <InfectionCurve national_stats={props.national_stats} />
        </div>
        <div className='col-6'>
          <h6 className='mb-0'>รักษาตัวในโรงพยาบาล</h6>
          <HospitalizedCurve national_stats={props.national_stats} />
        </div>
        <div className='col-6'>
          <h6 className='mb-0'>ผู้เสียชีวิตรายวัน</h6>
          <DeathsCurve national_stats={props.national_stats} />
        </div>
      </div>
      <NationalTable national_stats={props.national_stats} updatedAt={setUpdatedDate} />
      <hr />
      <h3 className='mt-4'>เราตรวจเชื้อเพียงพอหรือยัง ?</h3>
      <p>มหาวิทยาลัย John Hopkins แนะนำว่าการตรวจเชื้อที่เพียงพอควรมีค่าร้อยละการเจอผลเป็นบวกต่อตัวอย่าง (Positive Rate) ไม่เกิน 5%</p>
      <TestingGraph testing_data={props.testing_data} />
      <TestingTable testing_data={props.testing_data} />
      <hr />
      <h3 className='mt-4'>ความคืบหน้าการฉีดวัคซีน</h3>
      <Link href='/vaccination'>
        <a className='d-flex align-items-center'>
          ติดตามการฉีดวัคซีน <img src='/chevron_right_white_24dp.svg' />
        </a>
      </Link>
      <VaccinePreview vaccination_timeseries={props.vaccination_timeseries} />
      <div className='my-4 text-center alert alert-black text-white'>
        เนื่องจากข้อมูลที่ได้รับรายงานยังมีความไม่สมบูรณ์ จึงอาจมีความคลาดเคลื่อนของตัวเลขจำนวนผู้ป่วยรายจังหวัด
        ท่านสามารถช่วยรายงานปัญหาหรือส่งข้อเสนอแนะได้ทาง <a href='https://github.com/porames/the-researcher-covid-bot'>Github</a>
      </div>
      <h2 className='text-center mt-5 mb-4'>แผนที่การระบาด</h2>
    </div>
  )
}


export async function getStaticProps() {
  return {
    props: {
      national_stats: await getNationalStats(),
      province_data: await getProvinceData(),
      province_graphs: await getProvinceGraphs(),
      district_data: await getDistrictData(),
      vaccination_timeseries: await getVaccineStats(),
      testing_data: await getTestingData()
    }
  }
}

export default function Home(props) {
  return (
    <>
      <NavHead />

      <div className='dark-theme py-5'>
        <Head>
          <title>รายงานสถานการณ์โรค COVID-19 ในประเทศไทย - The Researcher</title>
          <meta name="title" content="รายงานสถานการณ์โรค COVID-19 ในประเทศไทย - The Researcher" />
          <meta name="description" content="สถานการณ์โรค COVID-19 ในประเทศไทย แผนที่ตำแหน่งการระบาดและแนวโน้มสถานการณ์รายจังหวัด" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="รายงานสถานการณ์โรค COVID-19 ในประเทศไทย - The Researcher" />
          <meta property="og:description" content="สถานการณ์โรค COVID-19 ในประเทศไทย แผนที่ตำแหน่งการระบาดและแนวโน้มสถานการณ์รายจังหวัด" />
          <meta property="og:image" content="https://covid-19.researcherth.co/cover.png" />
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:title" content="รายงานสถานการณ์โรค COVID-19 ในประเทศไทย - The Researcher" />
          <meta property="twitter:description" content="สถานการณ์โรค COVID-19 ในประเทศไทย แผนที่ตำแหน่งการระบาดและแนวโน้มสถานการณ์รายจังหวัด" />
          <meta property="twitter:image" content="https://covid-19.researcherth.co/cover.png" />
        </Head>
        <NationalCurveSection
          national_stats={props.national_stats}
          vaccination_timeseries={props.vaccination_timeseries}
          testing_data={props.testing_data}
        />
        <Map build_data={props.province_graphs.job} province_data={props.province_data} district_data={props.district_data} />
        <div className='container mt-4 mb-4' style={{ maxWidth: 810 }}>
          <h2 className='text-center mt-5 mb-4'>สถานการณ์รายจังหวัด</h2>
          <Province province_graphs={props.province_graphs} />
        </div>
        <div className='container' style={{ maxWidth: 700 }}>
          <div className='row mt-5'>
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
                  <h5 className='mb-0 d-flex align-items-center mr-2'>
                    ติดตามความคืบหน้าการฉีดวัคซีน
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
