import React from 'react'
import images from './built_images.json'
import _ from 'lodash'
export default function Province(props) {
    const sortedImages = _.sortBy(images, 'total-14days').reverse()
    return (
        <div>
            <div className='row mt-4'>
                {
                    sortedImages.map((img, index) => {
                        if (img['total-14days'] > 5) {
                            return (
                                <div className='col-4 col-md-3 mb-4'>
                                    <span className='text-sec'>{img['province']}</span>
                                    <div className='province-graph mt-2' style={{ backgroundImage: `url(/graphs-build/${img.name})` }}>
                                        <div className='tick'>{img['max']} -</div>
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
                                <div className='col-4 col-md-3 mb-4'>
                                    <span className='text-sec'>{img['province']}</span>
                                    <div className='province-graph mt-2' style={{ backgroundImage: `url(/graphs-build/${img.name})` }}>
                                        <div className='tick'>{img['max']} -</div>
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