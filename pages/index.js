import Head from 'next/head'
import Map from '../components/map_'
import NationalCurve from '../components/nationalGraph'
import VaccinePreview from '../components/vaccinePreview'
import NationalTable from '../components/nationalTable.js'
import Province from '../components/provincesGraph'
import React, { useEffect, useState } from 'react'
import moment from 'moment'
import 'moment/locale/th'
import Link from 'next/link'
import NavHead from '../components/navHead'
import Footer from '../components/footer'
class NationalCurveSection extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      updatedDate: undefined
    }
  }

  render() {
    return (
      <div className='container mb-4' style={{ maxWidth: 810 }}>
        <div className='text-center'>
          <h1>สถานการณ์โรค COVID-19 ในประเทศไทย</h1>
          {this.state.updatedDate &&
            <small style={{ opacity: 0.6 }}>อัพเดท {moment(this.state.updatedDate, 'DD/MM/YYYY').format('LL')}</small>
          }
        </div>
        <NationalCurve />
        <NationalTable updatedAt={(date) => this.setState({ updatedDate: date })} />
        <hr />
        <h3 className='mt-4'>ความคืบหน้าการฉีดวัคซีน</h3>
        <Link href='/vaccination'>
          <a className='d-flex align-items-center'>
            ติดตามการฉีดวัคซีน <img src='/chevron_right_white_24dp.svg' />
          </a>
        </Link>
        <VaccinePreview />
        <div className='my-4 text-center alert alert-black text-white'>
          เนื่องจากข้อมูลที่ได้รับรายงานยังมีความไม่สมบูรณ์ จึงอาจมีความคลาดเคลื่อนของตัวเลขจำนวนผู้ป่วยรายจังหวัด
          ท่านสามารถช่วยรายงานปัญหาหรือส่งข้อเสนอแนะได้ทาง <a href='https://github.com/porames/the-researcher-covid-bot'>Github</a>
        </div>
        <h2 className='text-center mt-5 mb-4'>แผนที่การระบาด</h2>
      </div>
    )
  }
}

export default function Home() {

  return (
    <>
      <NavHead />

      <div className='dark-theme py-5'>
        <Head>
          <title>รายงานสถานการณ์โรค COVID-19 ในประเทศไทย - The Researcher</title>
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@600&family=Sarabun:wght@400;700&display=swap" rel="stylesheet" />
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_gAnalytics}`}></script>
          <script dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-V6Q0C8MG7Q');`}} />
          <meta name="title" content="รายงานสถานการณ์โรค COVID-19 ในประเทศไทย - The Researcher" />
          <meta name="description" content="สถานการณ์โรค COVID-19 ในประเทศไทย แผนที่ตำแหน่งการระบาดและแนวโน้มสถานการณ์รายจังหวัด" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="รายงานสถานการณ์โรค COVID-19 ในประเทศไทย - The Researcher" />
          <meta property="og:description" content="สถานการณ์โรค COVID-19 ในประเทศไทย แผนที่ตำแหน่งการระบาดและแนวโน้มสถานการณ์รายจังหวัด" />
          <meta property="og:image" content="/cover.png" />
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:title" content="รายงานสถานการณ์โรค COVID-19 ในประเทศไทย - The Researcher" />
          <meta property="twitter:description" content="สถานการณ์โรค COVID-19 ในประเทศไทย แผนที่ตำแหน่งการระบาดและแนวโน้มสถานการณ์รายจังหวัด" />
          <meta property="twitter:image" content="/cover.png" />
        </Head>
        <NationalCurveSection />

        <Map />

        <div className='container mt-4 mb-4' style={{ maxWidth: 700 }}>
          <h2 className='text-center mt-5 mb-4'>สถานการณ์รายจังหวัด</h2>
          <Province />
          <div className='row mt-5'>
              <div className='col-12'>
                <hr/>
              </div>
              <div className='col-md-6'>
                <Link href='/vaccination'>
                  <a>
                  <div className='aspect-ratio-16-9' style={{ backgroundImage: 'url(/vaccination-map.png)'}}></div>
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
                <hr/>
              </div>
            </div>
          <Footer/>
        </div>

      </div>
    </>
  )
}
