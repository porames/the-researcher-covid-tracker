import Head from 'next/head'
import Map from '../components/map'
import NationalCurve from '../components/nationalGraph'
import TestingGraph from '../components/testingGraph'
import TestingTable from '../components/testingTable'
import NationalTable from '../components/nationalTable.js'
import Province from '../components/provincesGraph'
import React, { useEffect, useState } from 'react'
import { HotspotLegend } from '../components/mapLegends'
import moment from 'moment'
import 'moment/locale/th'
import { Link, Element, Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll'


class NationalCurveSection extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      updatedDate: undefined
    }
  }

  render() {
    return (
      <div className='container mb-4' style={{ maxWidth: 700 }}>
        <div className='text-center'>
          <h1>สถานการณ์โรค COVID-19 ในประเทศไทย</h1>
          {this.state.updatedDate &&
            <small style={{ opacity: 0.6 }}>อัพเดท {moment(this.state.updatedDate, 'DD/MM/YYYY').format('LL')}</small>
          }
        </div>
        <NationalCurve />
        <NationalTable updatedAt={(date) => this.setState({ updatedDate: date })} />
        <hr />
        <h3 className='mt-4'>สถิติการตรวจเชื้อ</h3>
        <TestingGraph />
        <TestingTable />
        <div className='mt-5 mb-4 text-center alert alert-black text-white'>
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
    <div className='dark-theme pt-5 pb-3'>
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
      <Element name='skipMap'>
        <div className='container mt-4 mb-4' style={{ maxWidth: 800 }}>
          <h2 className='text-center mt-5 mb-4'>สถานการณ์รายจังหวัด</h2>
          <Province />
          <div className='my-4 alert alert-black text-white'>
            จัดทำโดย <a href='https://facebook.com/researcher.th' target='_blank'>The Researcher</a><br />
          ศึกษาเพิ่มเติมเกี่ยวกับวิธีการประมวลผลข้อมูลและช่วยพัฒนาระบบได้ที่ <a href='https://github.com/porames/the-researcher-covid-bot' target='_blank'>GitHub</a>
          </div>
        </div>
      </Element>
    </div>
  )
}
