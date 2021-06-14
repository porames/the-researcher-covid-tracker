const Footer = () => (
    <div id='footer'>
        <div className='alert my-4 alert-black text-white'>
            จัดทำโดย <a href='https://facebook.com/researcher.th' target='_blank'>The Researcher</a><br />
            ศึกษาเพิ่มเติมเกี่ยวกับวิธีการประมวลผลข้อมูลและช่วยพัฒนาระบบได้ที่ <a href='https://github.com/porames/the-researcher-covid-bot' target='_blank'>GitHub</a><br />
            ข้อมูลส่วนหนึ่งรวบรวมและประมวลผลโดยคุณ <a href='https://github.com/djay/covidthailand' target='_blank'>Dylan Jay</a>
        </div>
        <a href='https://vallaris.space' target='_blank'>
            <div className='d-flex flex-md-row flex-column pt-4 justify-content-center align-items-center'>
                <img src='/vallaris_logo.svg' alt='vallaris logo' height={30} />
                <div className='ml-md-3 mt-md-0 mt-2 text-center'><b>แผนที่และข้อมูลภูมิสารสนเทศสนับสนุนโดย Vallaris Maps</b></div>
            </div>
        </a>
    </div>
)
export default Footer