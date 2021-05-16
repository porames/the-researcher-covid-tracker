import Map from '../../components/vaccine/map'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import Province from '../../components/vaccine/provincesGraph'
import { Element, Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll'
import { National, Estimate } from '../../components/vaccine/nationalCurve'
import NationalTable from '../../components/vaccine/nationalTable'
import moment from 'moment'
import 'moment/locale/th'
const BarLegend = (props) => {
  const palette = ['#bdd5cd', '#9dbbb2', '#7ea297', '#60897e', '#427165']
  return (
    <div className='px-sm-3 px-md-5 px-0 d-flex flex-column' >
      <div className='w-100 d-flex flex-row'>
        <div className='d-flex bar-legend' style={{ flex: 4 }}>
          {palette.map((color, i) => {
            return (
              <div key={i} className='bar'>
                <div className='level' style={{ backgroundColor: color }}></div>
              </div>
            )
          })}

        </div>
        <div className='d-flex bar-legend' style={{ flex: 1, justifyContent: 'center' }} >
          <div className='pl-3 pl-sm-5' style={{ width: '100%', paddingBottom: 5 }}>
            <div className='level' style={{ backgroundColor: '#fafafa' }} />
          </div>
        </div>
      </div>
      <div className='w-100 d-flex flex-row'>
        <div className='d-flex bar-label' style={{ flex: 4 }}>
          {[`${parseInt(props.maxCoverage * 20)}%`, `${parseInt(props.maxCoverage * 40)}%`, `${parseInt(props.maxCoverage * 60)}%`, `${parseInt(props.maxCoverage * 80)}%`, `${parseInt(props.maxCoverage * 100)}%`].map((label, i) => {
            return (
              <div key={i} className='label'>
                <small>{label}</small>
              </div>
            )
          })}

        </div>
        <div className='d-flex bar-label' style={{ flex: 1, justifyContent: 'center' }} >
          <div className='pl-3 pl-sm-5' style={{ width: '100%', paddingBottom: 5 }}>
            <div className='text-center'>
              <small>ข้อมูลไม่พอ</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const HeadSection = (props) => {
  const [estimation, setEstimation] = useState(undefined)
  const [updateDate, setUpdateDate] = useState(undefined)
  return (
    <div className='container text-center mb-4' style={{ maxWidth: 700 }}>
      <h1>ความคืบหน้าการฉีดวัคซีน COVID-19 ในประเทศไทย</h1>
      <span className='text-muted small'>อัพเดทเมื่อ {updateDate && moment(updateDate).format('DD MMMM YYYY')}</span>
      <National setUpdateDate={setUpdateDate} />
      <NationalTable updateDate={updateDate} />
      <div className='alert alert-black mt-4 mb-5 py-4'>
        <h2 className='mb-3'>สถานะการเข้าถึงวัคซีน</h2>
        <p className='mb-0'>จำกัดเฉพาะกลุ่มเสี่ยง ได้แก่ ผู้สูงอายุ ผู้มีโรคประจำตัว บุคลากรทางการแพทย์ และผู้ที่อาศัยอยู่ในพื้นที่ความเสี่ยงสูง</p>
      </div>
      <div className='my-4'>
        <h2 className='mb-3'>เมื่อไรจะฉีดวัคซีนครบ ?</h2>
        <Estimate setEstimation={setEstimation} />
        <p className='mt-3'>ด้วยความเร็วการฉีดวัคซีนปัจจุบันที่ {estimation && parseInt(estimation['deltaAvg']).toLocaleString()} โดส/วัน คาดว่าประชากรส่วนใหญ่ในประเทศไทยจะได้รับวัคซีนใน{estimation && moment(estimation['date']).fromNow()}</p>
      </div>
      <h2 className='text-center mt-5 mb-4'>แผนที่ความครอบคลุมวัคซีน</h2>
      <div className='text-center mb-3 text-sec'><b>จำนวนโดสครอบคลุมประชากร</b></div>
      <BarLegend maxCoverage={props.maxCoverage} />
    </div>
  )
}

export default function Vaccine(props) {
  const [maxCoverage, setMaxCoverage] = useState(undefined)
  return (
    <div className='dark-theme pt-5 pb-5'>
      <Head>
        <title>รายงานสถานการณ์วัคซีน COVID-19 ในประเทศไทย - The Researcher</title>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@600&family=Sarabun:wght@400;700&display=swap" rel="stylesheet" />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_gAnalytics}`}></script>
        <script dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-V6Q0C8MG7Q');`}} />
        <meta name="title" content="รายงานสถานการณ์วัคซีน COVID-19 ในประเทศไทย - The Researcher" />
        <meta name="description" content="สถานการณ์วัคซีน COVID-19 ในประเทศไทย" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="รายงานสถานการณ์โรค COVID-19 ในประเทศไทย - The Researcher" />
        <meta property="og:description" content="สถานการณ์โรค COVID-19 ในประเทศไทย แผนที่ตำแหน่งการระบาดและแนวโน้มสถานการณ์รายจังหวัด" />
        <meta property="og:image" content="/cover.png" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="รายงานสถานการณ์โรค COVID-19 ในประเทศไทย - The Researcher" />
        <meta property="twitter:description" content="สถานการณ์โรค COVID-19 ในประเทศไทย แผนที่ตำแหน่งการระบาดและแนวโน้มสถานการณ์รายจังหวัด" />
        <meta property="twitter:image" content="/cover.png" />
      </Head>
      <HeadSection maxCoverage={maxCoverage} />
      <Map setMaxCoverage={setMaxCoverage} />
      <Element name='skipMap'>
        <div className='container mt-4 mb-4' style={{ maxWidth: 800 }}>
          <h2 className='text-center mt-5 mb-3'>ความคืบหน้ารายจังหวัด</h2>
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