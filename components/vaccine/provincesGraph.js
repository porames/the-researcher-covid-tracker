import React from 'react'
import build from './build_job.json'
import _ from 'lodash'
const images = build['images']
export default function Province(props) {
    const sortedImages = _.sortBy(images,'coverage').reverse()
    return (
        <div className='container'>
            <div className='row mt-4'>
                {
                    sortedImages.map((img, index) => {
                            return (
                                <div key={index} className='col-4 col-md-3 mb-4 px-1'>
                                    <div className='d-flex align-items-center justify-content-between'>
                                <div className='text-sec'>
                                        <small>{img['province']}</small>
                                        </div>
                                    <div className='badge badge-dark'>{img['coverage']}%</div>
                                    </div>
                                    <div className='province-graph mt-2' style={{ backgroundImage: `url(/vaccine-graphs-build/${img.name})` }}>
                                        
                                        {index == 0 &&
                                            <div className='annotation' style={{ bottom: '14%', left: '10%' }}>
                                                <span>วัคซีนสะสม</span>
                                            </div>
                                        }
                                        {index == 0 &&
                                            <div className='annotation text-end' style={{ bottom: '35%', right: '5%' }}>
                                                <span>ข้อมูล 14 วัน<br />ล่าสุด</span>
                                            </div>
                                        }

                                    </div>
                                </div>
                            )
                        
                    })
                }
            </div>
        </div>
    )
}