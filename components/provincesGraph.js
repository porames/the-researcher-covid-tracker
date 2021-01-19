import React from 'react'
import build from './build_job.json'
import _ from 'lodash'
const images = build['images']
export default function Province(props) {
    const sortedImages = _.sortBy(images, 'total-14days').reverse()
    return (
        <div className='container'>
            <div className='row mt-4'>
                {
                    sortedImages.map((img, index) => {
                        if (img['total-14days'] > 5) {
                            return (
                                <div key={index} className='col-4 col-md-3 mb-4 px-1'>
                                    <span className='text-sec'>{img['province']}</span>

                                    <div className='province-graph mt-2' style={{ backgroundImage: `url(/graphs-build/${img.name})` }}>
                                        <div className='tick'>{img['max'] >= 10 ? img['max'] : 10} -</div>
                                        {index == 0 &&
                                            <div className='annotation' style={{ bottom: '45%', left: '20%' }}>
                                                <span>ค่าเฉลี่ย 7 วัน</span>
                                            </div>
                                        }
                                        {index == 0 &&
                                            <div className='annotation text-end' style={{ bottom: '45%', right: '0%' }}>
                                                <span>ข้อมูล 14 วัน<br />ล่าสุด</span>
                                            </div>
                                        }

                                    </div>
                                </div>
                            )
                        }
                    })
                }
            </div>
            <hr />
            <h4 className='mt-5'>จังหวัดที่ข้อมูลผู้ป่วยไม่เปลี่ยนแปลงในช่วง 14 วัน</h4>
            <div className='row mt-4'>
                {
                    sortedImages.map((img, index) => {
                        if (img['total-14days'] <= 5) {
                            return (
                                <div key={index} className='col-4 col-md-3 mb-4 px-1'>
                                    <span className='text-sec'>{img['province']}</span>
                                    <div className='province-graph mt-2' style={{ backgroundImage: `url(/graphs-build/${img.name})` }}>
                                        {img['max'] != 0 &&
                                            <div className='tick'>{img['max'] < 10 ? 10 : img['max']} -</div>
                                        }
                                        {img['max'] == 0 &&
                                            <div className='flat-line'>0 -</div>
                                        }

                                    </div>
                                </div>
                            )
                        }
                    })
                }
            </div>
        </div>
    )
}