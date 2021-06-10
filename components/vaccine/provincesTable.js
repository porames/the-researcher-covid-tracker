import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import provincesData from '../gis/data/provincial-vaccination-data-dashboard.json'
import moment from 'moment'
export default function Province(props) {
    const [showAll, setShowAll] = useState(false)
    
    return (
        <div className="table-responsive">
            <div className='text-center text-muted mb-4 small'>ข้อมูลเมื่อ {moment(provincesData['update_at']).format('LL')}</div>
            <table className="table text-white w-100" style={{ minWidth: 400 }}>
                <thead>
                    <tr>
                        <th scope="col">จังหวัด</th>
                        <th scope="col">รวมทั้งจังหวัด</th>
                        <th scope="col">ผู้สูงอายุ</th>
                    </tr>
                </thead>
                <tbody>
                    {_.sortBy(provincesData['data'],'coverage').reverse().map((province, index) => {
                        if (index < (showAll ? provincesData['data'].length : 10)) {
                            return (
                                <tr key={index} className='text-sec'>
                                    <td><b>{province['name']}</b></td>
                                    <td style={{ width: '30%' }}>
                                        <div className='d-flex align-items-center'>
                                            <span style={{ direction: 'rtl', width: 50 }}>{(province['total_doses'] * 100 / (province['population'] * 2)).toFixed(1)}%</span>
                                            <div className='ml-2 doses-progress' style={{ maxWidth: 100 }}>
                                                <div className='doses-bar' style={{ width: `${(province['total_doses'] * 100 / (province['population'] * 2))}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ width: '30%' }}>
                                        <div className='d-flex align-items-center'>
                                            <span style={{ direction: 'rtl', width: 50 }}>{(province['>60-total-doses'] * 100 / (province['>60-population'] * 2)).toFixed(1)}%</span>
                                            <div className='ml-2 doses-progress' style={{ maxWidth: 100 }}>
                                                <div className='doses-bar' style={{ width: `${(province['>60-total-doses'] * 100 / (province['>60-population'] * 2))}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )
                        }
                    })}

                </tbody>
            </table>
            <button onClick={() => setShowAll(!showAll)} className='rounded table-toggle'>{showAll ? 'ย่อข้อมูล' : 'ดูทั้งหมด'}</button>
        </div>
    )
}