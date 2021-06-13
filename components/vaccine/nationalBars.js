import React, { useState, useEffect } from 'react'

const NationalBars = (props) => {
    const population = 66186727
    const remainingSupply = (100-(props.todayData['total_doses'] * 100 / props.todayData['total_supply'])).toFixed(1)

    return (
        <>
            {props.todayData && (
                <div className='d-flex flex-column align-items-start'>
                    <div className='mb-4 w-100 text-left'>
                        <b>ได้รับวัคซีนครบแล้ว</b>
                        <h1 className='mt-1 vaccine-theme'>
                            {(props.todayData['second_dose'] * 100 / population).toFixed(1)}%
                        </h1>
                        <div className='doses-progress'>
                            <div className='doses-bar' style={{ width: `${(props.todayData['second_dose'] * 100 / population)}%` }}></div>
                        </div>
                    </div>
                    <div className='w-100 text-left'>
                        <b>ได้รับวัคซีนอย่างน้อย 1 โดส</b>
                        <h1 className='mt-1 vaccine-theme'>
                            {(props.todayData['first_dose'] * 100 / population).toFixed(1)}%
                        </h1>
                        <div className='doses-progress'>
                            <div className='doses-bar' style={{ width: `${(props.todayData['first_dose'] * 100 / population)}%` }}></div>
                        </div>
                    </div>
                    <hr className='w-100 mt-4' />
                    <div className='w-100 text-left'>
                        <b>วัคซีนคงเหลือจากที่ได้รับจัดสรร</b>
                        <h1 className='mt-1 vaccine-theme'>
                            {remainingSupply}%
                        </h1>
                        <div className='doses-progress'>
                            <div className='doses-bar' style={{ width: `${remainingSupply}%` }}></div>
                        </div>
                    </div>
                    <div className='w-100 text-left mt-1'>
                        <span className='small text-muted'>คงเหลือ {(props.todayData['total_supply']-props.todayData['total_doses']).toLocaleString()}​/{props.todayData['total_supply'].toLocaleString()} โดส</span>
                    </div>
                </div>
            )}
        </>
    )
}

export default NationalBars