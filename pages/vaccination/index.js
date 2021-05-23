import Map from '../../components/vaccine/map'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import Province from '../../components/vaccine/provincesTable'
import { Element, Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll'
import { National, Estimate } from '../../components/vaccine/nationalCurve'
import NationalTable from '../../components/vaccine/nationalTable'
import NationalBars from '../../components/vaccine/nationalBars'
import moment from 'moment'
import 'moment/locale/th'

const HeadSection = (props) => {
  const [estimation, setEstimation] = useState(undefined)
  const [updateDate, setUpdateDate] = useState(undefined)
  const [todayData, setTodayData] = useState(undefined)
  return (
    <div className='container text-center mb-4'>
      <h1>ความคืบหน้าการฉีดวัคซีน COVID-19 ในประเทศไทย</h1>
      <span className='text-muted small'>อัพเดทเมื่อ {updateDate && moment(updateDate).format('DD MMMM YYYY')}</span>

      <div className='row mt-4' >
        <div className='col-md-8'>
          <National setTodayData={setTodayData} setUpdateDate={setUpdateDate} />
          <NationalTable updateDate={updateDate} />
        </div>
        <div className='col-md-4 '>
          <NationalBars todayData={todayData} />
          <hr className='my-4' />
          <div className='text-left mb-4'>
            <h2 className='mb-3'>สถานะการเข้าถึงวัคซีน</h2>
            <p className='mb-0'>จำกัดเฉพาะกลุ่มเสี่ยง ได้แก่ ผู้สูงอายุ ผู้มีโรคประจำตัว บุคลากรทางการแพทย์ และผู้ที่อาศัยอยู่ในพื้นที่ความเสี่ยงสูง</p>
          </div>
        </div>
        <div className='col-12'>
          <hr />
        </div>
      </div>
      <div className='mx-auto' style={{ maxWidth: 700 }}>
        <div className='my-4'>
          <h2 className='mb-3'>เมื่อไรจะฉีดวัคซีนครบ ?</h2>
          <Estimate setEstimation={setEstimation} />
          <p className='mt-3'>ด้วยความเร็วการฉีดวัคซีนปัจจุบันที่ {estimation && parseInt(estimation['deltaAvg']).toLocaleString()} โดส/วัน คาดว่าประชากรส่วนใหญ่ในประเทศไทยจะได้รับวัคซีนใน{estimation && moment(estimation['date']).fromNow()}</p>
        </div>

      </div>
    </div>
  )
}

export default function Vaccine(props) {
  const [maxCoverage, setMaxCoverage] = useState(undefined)
  return (
    <div className='dark-theme pt-5 pb-5'>
      <Head>
        <title>รายงานการฉีดวัคซีน COVID-19 ประเทศไทย - The Researcher</title>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@600&family=Sarabun:wght@400;700&display=swap" rel="stylesheet" />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_gAnalytics}`}></script>
        <script dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-V6Q0C8MG7Q');`}} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/cover-vaccination.png" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:image" content="/cover-vaccination.png" />
      </Head>
      <HeadSection maxCoverage={maxCoverage} />
      <Map setMaxCoverage={setMaxCoverage} />
      <Element name='skipMap'>
        <div className='container mt-4 mb-4' style={{ maxWidth: 800 }}>
          <h2 className='text-center mt-5 mb-4'>การฉีดวัคซีนรายจังหวัดแยกตามอายุ</h2>
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