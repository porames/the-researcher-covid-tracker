import Head from 'next/head'
import Map from '../../components/map'
import NationalCurve from '../../components/nationalGraph'
import NationalTable from '../../components/nationalTable.js'
import Province from '../../components/provincesGraph'
const BarLegend = () => {
  const palette = ["#FFFA6C", '#FFB14D', '#FF682D', '#a2322c', '#460c39', '#29010e']
  return (
    <div className='px-sm-3 px-md-5 px-0 d-flex'>
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
  )
}
export default function Home() {
  return (
    <div className='dark-theme pt-5 pb-3'>
      <Head>
        <title>รายงานสถานการณ์โรค COVID-19 ในประเทศไทย - The Researcher</title>
        <link rel="preconnect" href="https://fonts.gstatic.com"/>
        <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <div className='container mb-4' style={{ maxWidth: 700 }}>
        <div className='text-center'>
          <h1>สถานการณ์โรค COVID-19 ในประเทศไทย</h1>
          <small style={{ opacity: 0.6 }}>อัพเดท 9 มกราคม 2563</small>
        </div>
        <NationalCurve />
        <NationalTable />
        <h2 className='text-center mt-5 mb-4'>ตำแหน่งที่มีการระบาด</h2>
        <BarLegend />
      </div>
      <Map />
      <div className='container mt-4 mb-4' style={{ maxWidth: 700 }}>
        <span className='text-muted'>ข้อมูลจาก: กรมควบคุมโรค กระทรวงสาธารณสุข</span>
      </div>
      <div className='container mt-4 mb-4' style={{ maxWidth: 800 }}>
        <h2 className='text-center mt-5 mb-4'>สถานการณ์รายจังหวัด</h2>
        <Province />
        <div className='my-4 alert alert-black text-white'>
          จัดทำโดย <a href='https://facebook.com/researcher.th' target='_blank'>The Researcher</a><br/>
          ศึกษาเพิ่มเติมเกี่ยวกับวิธีการประมวลผลข้อมูลและช่วยพัฒนาระบบได้ที่ <a href='https://github.com/porames' target='_blank'>GitHub</a>
        </div>
      </div>
    </div>
  )
}
