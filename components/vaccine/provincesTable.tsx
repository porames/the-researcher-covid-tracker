import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import provincesData from '../gis/data/provincial-vaccination-data_2.json'
import moment from 'moment'
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';
import { sum, mean } from 'd3'
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

interface ProvinceProps {
    "name": string;
    "id": string;
    "population": number;
    "registered_population": number;
    "total_doses": number;
    "total-1st-dose": number;
    "total-2nd-dose": number;
    "first_doses_coverage"?: number;
    "second_doses_coverage"?: number
}

export default function Province() {
    const [showAll, setShowAll] = useState<boolean>(false)
    var data: ProvinceProps[] = _.cloneDeep(provincesData)['data']
    data.map((province, index) => {
        data[index]['first_doses_coverage'] = province['total-1st-dose'] / province['population']
        data[index]['second_doses_coverage'] = province['total-2nd-dose'] / province['population']
    })
    const population = sum(data, (d) => d["registered_population"])
    const first_doses_sum = sum(data, (d) => d["total-1st-dose"])
    const second_doses_sum = sum(data, (d) => d["total-2nd-dose"])
    data = _.sortBy(data, 'first_doses_coverage').reverse()
    data.unshift({
        "name": "ค่าเฉลี่ยทั้งประเทศ",
        "id": "0",
        "population": population,
        "registered_population": population,
        "total_doses": first_doses_sum + second_doses_sum,
        "total-1st-dose": first_doses_sum,
        "total-2nd-dose": second_doses_sum,
        "first_doses_coverage": first_doses_sum / population,
        "second_doses_coverage": second_doses_sum / population
    })

    return (
        <div>
            <div className='text-center text-muted mb-4 small'>ข้อมูลเมื่อเย็นวันที่ {moment(provincesData.update_at).format('LL')}</div>
            <div className='table-responsive'>
                <table className="table text-white w-100" style={{ minWidth: 400 }}>
                    <thead>
                        <tr>
                            <th scope="col">จังหวัด</th>
                            <th scope="col">ได้รับวัคซีนอย่างน้อย 1 โดส</th>
                            <th scope="col">ได้รับวัคซีนครบแล้ว</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((province, index) => {
                            if (index < (showAll ? data.length : 10)) {
                                return (
                                    <tr key={index} className={index == 0 ? 'text-white' : 'text-sec'} style={{ backgroundColor: index == 0 ? "#333" : "inherit" }}>
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
                                                <span style={{ direction: 'rtl', width: 50 }}>{(province['first_doses_coverage'] * 100).toFixed(1)}%</span>
                                                <div className='ml-2 doses-progress' style={{ maxWidth: 100 }}>
                                                    <div className='doses-bar' style={{ width: `${(province['first_doses_coverage'] * 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ width: '30%' }}>
                                            <div className='d-flex align-items-center'>
                                                <span style={{ direction: 'rtl', width: 50 }}>{(province['second_doses_coverage'] * 100).toFixed(1)}%</span>
                                                <div className='ml-2 doses-progress' style={{ maxWidth: 100 }}>
                                                    <div className='doses-bar' style={{ width: `${(province['second_doses_coverage'] * 100)}%` }}></div>
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