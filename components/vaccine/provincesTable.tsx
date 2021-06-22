import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import provincesData from '../gis/data/provincial-vaccination-data.json'
import moment from 'moment'
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';
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
export default function Province(props) {
    const [showAll, setShowAll] = useState<boolean>(false)

    return (
        <div>
            <div className='text-center text-muted mb-4 small'>ข้อมูลเมื่อ {moment(provincesData.update_at).format('LL')}</div>
            <div className='table-responsive'>
            <table className="table text-white w-100" style={{ minWidth: 400 }}>
                <thead>
                    <tr>
                        <th scope="col">จังหวัด</th>
                        <th scope="col">รวมทั้งจังหวัด</th>
                        <th scope="col">ผู้สูงอายุ</th>
                    </tr>
                </thead>
                <tbody>
                    {_.sortBy(provincesData.data, 'coverage').reverse().map((province, index) => {
                        if (index < (showAll ? provincesData.data.length : 10)) {
                            return (
                                <tr key={index} className='text-sec'>
                                    <td>
                                        <div className='d-flex align-items-center'>
                                            <b>{province.name}</b>
                                            {province['population'] > province.registered_population &&
                                                <InfoTooltip excessPop={province.population - province.registered_population} />
                                            }
                                        </div>
                                    </td>
                                    <td style={{ width: '30%' }}>
                                        <div className='d-flex align-items-center'>
                                            <span style={{ direction: 'rtl', width: 50 }}>{(province.total_doses * 100 / (province.population * 2)).toFixed(1)}%</span>
                                            <div className='ml-2 doses-progress' style={{ maxWidth: 100 }}>
                                                <div className='doses-bar' style={{ width: `${(province.total_doses * 100 / (province.population * 2))}%` }}></div>
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
            </div>
            <button onClick={() => setShowAll(!showAll)} className='rounded table-toggle'>{showAll ? 'ย่อข้อมูล' : 'ดูทั้งหมด'}</button>
        </div>
    )
}