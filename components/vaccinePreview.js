import React, { useEffect, useState } from 'react'
import NationalBars from './vaccine/nationalBars'
import { NationalCurve } from './vaccine/nationalCurve'
import { ParentSize, withParentSize } from '@visx/responsive'
const VaccinePreview = (props) => {
    const [updateDate, setUpdateDate] = useState(undefined)
    const [todayData, setTodayData] = useState(undefined)

    return (
        <div className='row mt-4' >
            <div className='col-md-8' style={{minHeight: 200}}>
                <ParentSize>
                    {({ width, height }) => {
                        if(width >0 && height >0)
                        return(
                        <NationalCurve setTodayData={setTodayData} setUpdateDate={setUpdateDate} width={width} height={height} />
                    )}}
                </ParentSize>
            </div>
            <div className='col-md-4 '>
                <NationalBars todayData={todayData} />
            </div>
            <div className='col-12'>
                <hr className='mt-5' />
            </div>
        </div>
    )
}

export default VaccinePreview