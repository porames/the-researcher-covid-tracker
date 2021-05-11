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
                                    <span className='text-sec'>{img['province']}</span>

                                    <div className='province-graph mt-2' style={{ backgroundImage: `url(/vaccine-graphs-build/${img.name})` }}>
                                        
                                        {index == 0 &&
                                            <div className='annotation' style={{ bottom: '10%', left: '20%' }}>
                                                <span>วัคซีนสะสม</span>
                                            </div>
                                        }
                                        {index == 0 &&
                                            <div className='annotation text-end' style={{ bottom: '45%', right: '10%' }}>
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