import React, { useState, useEffect } from 'react'
import { VaccinationTimeseries } from './types'

interface NationalBarsProps {
    todayData: VaccinationTimeseries,
    hideSupply?: boolean
}

const NationalBars = ({
    todayData,
    hideSupply = true
}: React.PropsWithChildren<NationalBarsProps>) => {
    const population = 66186727
    const [remainingSupply, setRemainingSupply] = useState<number>(0)


    return (
        <>
            {todayData && (
                <div className='d-flex flex-column align-items-start'>
                    <div className='w-100 text-left'>
                        <b>ได้รับวัคซีนกระตุ้น (เข็ม 3)</b>
                        <h1 className='mt-1 vaccine-theme'>
                            {(todayData['third_dose'] * 100 / population).toFixed(1)}%
                        </h1>
                        <div className='doses-progress'>
                            <div className='doses-bar' style={{ width: `${(todayData.third_dose * 100 / population)}%` }}></div>
                        </div>
                        <div className='w-100 text-left mt-1'>
                            <span className='small text-muted'>คิดเป็น {(todayData.third_dose.toLocaleString())} คน</span>
                        </div>
                    </div>
                    <hr className='w-100' />
                    <div className='mb-4 w-100 text-left'>
                        <b>ได้รับวัคซีนอย่างน้อย 2 เข็ม</b>
                        <h1 className='mt-1 vaccine-theme'>
                            {(todayData['second_dose'] * 100 / population).toFixed(1)}%
                        </h1>
                        <div className='doses-progress'>
                            <div className='doses-bar' style={{ width: `${(todayData.second_dose * 100 / population)}%` }}></div>
                        </div>
                        <div className='w-100 text-left mt-1'>
                            <span className='small text-muted'>คิดเป็น {(todayData.second_dose.toLocaleString())} คน</span>
                        </div>
                    </div>
                    <div className='w-100 text-left'>
                        <b>ได้รับวัคซีนอย่างน้อย 1 เข็ม</b>
                        <h1 className='mt-1 vaccine-theme'>
                            {(todayData.first_dose * 100 / population).toFixed(1)}%
                        </h1>
                        <div className='doses-progress'>
                            <div className='doses-bar' style={{ width: `${(todayData.first_dose * 100 / population)}%` }}></div>
                        </div>
                        <div className='w-100 text-left mt-1'>
                            <span className='small text-muted'>คิดเป็น {(todayData.first_dose.toLocaleString())} คน</span>
                        </div>
                    </div>
                    {!hideSupply &&
                        <>
                            <hr className='w-100 mt-4' />
                            <div className='w-100 text-left'>
                                <b>วัคซีนคงเหลือจากที่ได้รับจัดสรร</b>
                                <h1 className='mt-1 vaccine-theme'>
                                    {remainingSupply.toFixed(1)}%
                                </h1>
                                <div className='doses-progress'>
                                    <div className='doses-bar' style={{ width: `${remainingSupply}%` }}></div>
                                </div>
                            </div>
                            <div className='w-100 text-left mt-1'>
                                <span className='small text-muted'>คงเหลือ  โดส</span>
                            </div>
                        </>
                    }
                </div>
            )}
        </>
    )
}

export default NationalBars