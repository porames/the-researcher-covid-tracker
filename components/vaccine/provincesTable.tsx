import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import moment from 'moment'
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';
import { ProvincelVaccination } from './types'
import { sum, mean } from 'd3'
import { calculate_coverage } from './util';
const InfoTooltip = (props) => {
    const {
        getArrowProps,
        getTooltipProps,
        setTooltipRef,
        setTriggerRef,
        visible,
    } = usePopperTooltip()
    return (
        <div className='ml-2'>
            <button className='p-0 btn btn-icon' type="button" ref={setTriggerRef}>
                <img style={{ opacity: 0.8 }} src='/info_white_24dp.svg' height={16} width={16} />
            </button>
            {visible && (
                <div
                    ref={setTooltipRef}
                    {...getTooltipProps({ className: 'tooltip-container p-2' })}
                >
                    <div {...getArrowProps({ className: 'tooltip-arrow' })} />
                    มีประชากรแฝงประมาณ {props.excessPop.toLocaleString()} คน
                </div>
            )}
        </div>
    );
};



export default function Province(props: { province_vaccination: ProvincelVaccination }) {
    const [showAll, setShowAll] = useState<boolean>(false)
    var data = calculate_coverage(props.province_vaccination)
    data = data['data']

    data = data.filter(province => province.id !== '0')
    data = _.sortBy(data, '1st_dose_coverage').reverse()

    return (
        <div>
            <div className='text-center text-muted mb-4 small'>ข้อมูลเมื่อเย็นวันที่ {moment(props.province_vaccination.update_date).format('LL')}</div>
            <div className='table-responsive'>
                <table className="table text-white w-100 table-theme-light" style={{ minWidth: 400, fontSize: '90%' }}>
                    <thead>
                        <tr>
                            <th scope="col">จังหวัด</th>
                            <th scope="col">ประชาชนทั่วไปได้รับวัคซีนแล้ว</th>
                            <th scope="col">ผู้สูงอายุได้รับวัคซีนแล้ว</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((province, index) => {
                            if (index < (showAll ? data.length : 10)) {
                                return (
                                    <tr key={index} className={index == 0 ? 'text-white' : 'text-sec'} style={{ backgroundColor: index == 0 ? "#333" : "inherit" }}>
                                        <td>
                                            <div className='d-flex align-items-center'>
                                                <b>{province['province']}</b>
                                            </div>
                                        </td>
                                        <td style={{ width: '30%' }}>
                                            <div className='d-flex align-items-center'>
                                                <span style={{ direction: 'rtl', width: 50 }}>{(province['1st_dose_coverage'] * 100).toFixed(1)}%</span>
                                                <div className='ml-2 doses-progress' style={{ maxWidth: 100 }}>
                                                    <div className='doses-bar' style={{ width: `${(province['1st_dose_coverage'] * 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ width: '30%' }}>
                                            <div className='d-flex align-items-center'>
                                                <span style={{ direction: 'rtl', width: 50 }}>{(province['over_60_1st_dose_coverage'] * 100).toFixed(1)}%</span>
                                                <div className='ml-2 doses-progress' style={{ maxWidth: 100 }}>
                                                    <div className='doses-bar' style={{ width: `${(province['over_60_1st_dose_coverage'] * 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            }
                        })}

                    </tbody>
                </table>
            </div>
            <button onClick={() => setShowAll(!showAll)} className='rounded table-toggle'>{showAll ? 'ย่อข้อมูล' : 'ดูทั้งหมด'}</button>
        </div>
    )
}