import React, { useState, useEffect } from "react"
import _ from "lodash"
import moment from "moment"
import { usePopperTooltip } from "react-popper-tooltip";
import "react-popper-tooltip/dist/styles.css";
import { ProvinceVaccination } from "./types"
import { sum, mean } from "d3"


const TableHeader = (props) => (
    <th
        scope='col'
        className={`provice-table-header sort-table-th`}
        style={{ minWidth: 80 }}
        onClick={() => props.sortChange(props.colId)}
    >
        <span className={`${props.sortData.column === props.colId ? props.sortData.direction : ''}`}>
            {props.text}
        </span>
    </th>
)

const InfoTooltip = (props) => {
    const {
        getArrowProps,
        getTooltipProps,
        setTooltipRef,
        setTriggerRef,
        visible,
    } = usePopperTooltip()
    return (
        <div className="ml-2">
            <button className="p-0 btn btn-icon" type="button" ref={setTriggerRef}>
                <img style={{ opacity: 0.8 }} src="/info_white_24dp.svg" height={16} width={16} />
            </button>
            {visible && (
                <div
                    ref={setTooltipRef}
                    {...getTooltipProps({ className: "tooltip-container p-2" })}
                >
                    <div {...getArrowProps({ className: "tooltip-arrow" })} />
                    มีประชากรแฝงประมาณ {(Math.round(props.hidden_pop / 1000) * 1000).toLocaleString()} คน
                </div>
            )}
        </div>
    );
};



export default function Province(props: { province_vaccination: ProvinceVaccination }) {
    const [showAll, setShowAll] = useState<boolean>(false)
    const [isDescSort, setIsDescSort] = useState<boolean>(true)
    const [sortData, setSortData] = useState({
        column: '1st_dose_coverage',
        direction: 'down'
    })
    const [provincesData, setData] = useState(undefined)

    function sortChange(column) {
        if (column == sortData.column) {
            setIsDescSort(!isDescSort)
        }
        setSortData({
            column: column,
            direction: isDescSort ? 'down' : 'up'
        })
    }
    useEffect(() => {
        var data = props.province_vaccination.data
        data = data.filter(province => province.id !== "0")
        data = _.sortBy(data, sortData.column)
        if (sortData.direction == 'down') {
            data.reverse()
        }
        setData(data)
    }, [sortData])
    return (
        <div>
            <p className="text-center text-sec">ตัวเลขแสดงร้อยละจำนวนผู้ที่ได้รับวัคซีนอย่างน้อย 1 เข็มต่อกลุ่มประชากร</p>
            <div className='table-responsive-md'>
                <table className="table text-white w-100 table-theme-light" style={{ minWidth: 400, fontSize: "90%" }}>
                    <thead>
                        <tr>
                            <th scope="col">จังหวัด</th>
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='1st_dose_coverage'
                                text='ประชากรได้รับวัคซีนเข็มแรก'
                            />

                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='over_60_1st_dose_coverage'
                                text='ผู้สูงอายุได้รับวัคซีนเข็มแรก'
                            />
                        </tr>
                    </thead>
                    <tbody>
                        {provincesData && provincesData.map((province, index) => {
                            if (index < (showAll ? provincesData.length : 10)) {
                                return (
                                    <tr key={index} >
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <b>{province["province"]}</b>
                                                {province["population_data"]["hidden_pop"] > 1000 &&
                                                    <InfoTooltip hidden_pop={province["population_data"]["hidden_pop"]} />
                                                }
                                            </div>
                                        </td>
                                        <td style={{ width: "30%" }}>
                                            <div className="d-flex align-items-center justify-content-end">
                                                <span style={{ direction: "rtl", width: 50 }}>
                                                    {(province["1st_dose_coverage"] * 100) < 100 ? (province["1st_dose_coverage"] * 100).toFixed(1) : 100}%
                                                </span>
                                                <div className="ml-2 doses-progress" style={{ maxWidth: 100 }}>
                                                    <div className="doses-bar" style={{ width: `${(province["1st_dose_coverage"] * 100) < 100 ? (province["1st_dose_coverage"] * 100) : 100}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ width: "30%" }}>
                                            <div className="d-flex align-items-center justify-content-end">
                                                <span style={{ direction: "rtl", width: 50 }}>
                                                    {(province["over_60_1st_dose_coverage"] * 100) < 100 ? (province["over_60_1st_dose_coverage"] * 100).toFixed(1) : 100}%
                                                </span>
                                                <div className="ml-2 doses-progress" style={{ maxWidth: 100 }}>
                                                    <div className="doses-bar" style={{ width: `${(province["over_60_1st_dose_coverage"] * 100) < 100 ? (province["over_60_1st_dose_coverage"] * 100) : 100}%` }}></div>
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
            <button onClick={() => setShowAll(!showAll)} className="rounded table-toggle">{showAll ? "ย่อข้อมูล" : "ดูทั้งหมด"}</button>
        </div>
    )
}