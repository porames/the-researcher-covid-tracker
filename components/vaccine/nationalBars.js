import React, { useState, useEffect } from 'react'

const NationalBars = (props) => {
    const population = 66186727
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
                </div>
            )}
        </>
    )
}

export default NationalBars