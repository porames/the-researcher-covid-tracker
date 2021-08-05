import { useEffect, useState } from "react"
import ManufacturerCurve from './manufacturerCurve'
import dataset from '../gis/data/provincial-vaccination-data_2.json'
import _ from 'lodash'
import chroma from 'chroma-js'

const TableHeader = (props) => (
    <th
        scope='col'
        className={`provice-table-header sort-table-th ${props.spacing && 'col-spacing'}`}
        style={{ whiteSpace: 'nowrap' }}
        onClick={() => props.sortChange(props.colId)}>
        <span className={`${props.sortData.column === props.colId ? props.sortData.direction : ''}`}>
            {props.text}
        </span>
    </th>
)

const AzBadge = (props) => {
    const scale = chroma.scale(['#FFFFFF', '#F29F05'])
    return (
        <div
            style={{
                backgroundColor: scale(props.percentage / 100).hex(),
                color: 'black'
            }}
            className='ml-2 badge' >
            {Math.round(props.percentage).toLocaleString()}%
        </div>
    )
}

const SvBadge = (props) => {
    const scale = chroma.scale(['#FFFFFF', '#ff5722'])
    return (
        <div
            style={{
                backgroundColor: scale(props.percentage / 100).hex(),
                color: 'black'
            }}
            className='ml-2 badge' >
            {Math.round(props.percentage).toLocaleString()}%
        </div>
    )
}
const ShareBadge = (props) => {
    const scale = chroma.scale(['#FFFFFF', props.fill])
    return (
        <div
            style={{
                backgroundColor: scale(props.percentage / 100).hex(),
                color: 'black'
            }}
            className='ml-2 badge' >
            {Math.round(props.percentage).toLocaleString()}%
        </div>
    )
}


function ManufacturerTable(props) {
    const [showAll, setShowAll] = useState<boolean>(false)
    const [isDescSort, setIsDescSort] = useState(true)
    const [sortData, setSortData] = useState({
        column: 'all_dose.total_doses',
        direction: 'down'
    })
    var data = props.province_vaccine_manufacturer["data"]
    //data = data.filter(province => province.id !== '0')
    data.map((province, index) => {
        data[index]["JnJ"] = province["Johnson & Johnson"]
        data[index]["Sinovac-share"] = province["Sinovac"] / province["total_doses"]
        data[index]["AstraZeneca-share"] = province["AstraZeneca"] / province["total_doses"]
        data[index]["Pfizer-share"] = province["Pfizer"] / province["total_doses"]
        data[index]["Sinopharm-share"] = province["Sinopharm"] / province["total_doses"]
        data[index]["JnJ-share"] = province["JnJ"] / province["total_doses"]
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
        data = _.orderBy(data, sortData.column)
        if (sortData.direction == 'down') {
            data.reverse()
        }
        setData(data)
    }, [sortData])

    return (
        <div>
            <div className='mt-3 table-responsive'>
                <table className="table table-theme-light text-white w-100 position-relative" style={{ fontSize: '90%' }}>
                    <thead>
                        <tr>
                            <th className='text-left' style={{ minWidth: 150 }} scope="col">จังหวัด</th>
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='total_doses'
                                text='จำนวนวัคซีนที่ฉีด'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='AstraZeneca'
                                text='AstraZeneca'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='AstraZeneca-share'
                                text='ร้อยละ'
                                spacing={true}
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='Sinovac'
                                text='Sinovac'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='Sinovac-share'
                                text='ร้อยละ'
                                spacing={true}
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='Pfizer'
                                text='Pfizer'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='Pfizer-share'
                                text='ร้อยละ'
                                spacing={true}
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='Sinopharm'
                                text='Sinopharm'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='Sinopharm-share'
                                text='ร้อยละ'
                                spacing={true}
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='JnJ'
                                text='J&J'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='JnJ-share'
                                text='ร้อยละ'
                            />
                        </tr>
                    </thead>
                    <tbody>
                        {provincesData && provincesData.map((province, index) => {
                            if (index < (showAll ? provincesData.length : 10) && province.id !== '0') {
                                return (
                                    <tr key={index} className='text-sec'>
                                        <td className='text-left'>
                                            <b>{province.province}</b>
                                        </td>
                                        <td className='col-spacing'>
                                            {province['total_doses'].toLocaleString()}
                                        </td>
                                        <td>
                                            {province['AstraZeneca'].toLocaleString()}
                                        </td>
                                        <td className='col-spacing'>
                                            <ShareBadge fill="#F29F05" percentage={province['AstraZeneca'] * 100 / province['total_doses']} />
                                        </td>
                                        <td>
                                            {province['Sinovac'].toLocaleString()}
                                        </td>
                                        <td className='col-spacing'>
                                            <ShareBadge fill="ff5722" percentage={province['Sinovac'] * 100 / province['total_doses']} />
                                        </td>

                                        <td>
                                            {province['Pfizer'].toLocaleString()}
                                        </td>
                                        <td className='col-spacing'>
                                            <ShareBadge fill="#0070BF" percentage={province['Pfizer'] * 100 / province['total_doses']} />
                                        </td>
                                        <td>
                                            {province['Sinopharm'].toLocaleString()}
                                        </td>
                                        <td className='col-spacing'>
                                            <ShareBadge fill="green" percentage={province['Sinopharm'] * 100 / province['total_doses']} />
                                        </td>

                                        <td>
                                            {province['Johnson & Johnson'].toLocaleString()}
                                        </td>
                                        <td>
                                            <ShareBadge fill="#D71500" percentage={province['Johnson & Johnson'] * 100 / province['total_doses']} />
                                        </td>

                                    </tr>
                                )
                            }
                        })
                        }
                    </tbody>
                </table>
            </div>
            <button onClick={() => setShowAll(!showAll)} className='rounded table-toggle'>{showAll ? 'ย่อข้อมูล' : 'ดูทั้งหมด'}</button>
        </div>
    )
}

export default function Manufacturer(props) {
    return (
        <div>
            <div className='container' style={{ maxWidth: 700 }}>
                <div className='text-center'>
                    <h2>จำนวนวัคซีนที่ฉีดแยกตามผู้ผลิต</h2>
                    <p className='text-muted mb-3'>เส้นแสดงจำนวนค่าเฉลี่ย 7 วันของวัคซีนยี่ห้อต่าง ๆ ที่ฉีดทั่วประเทศ</p>
                </div>
                <ManufacturerCurve manufacturer_timeseries={props.manufacturer_timeseries} />
            </div>
            <div className="container">
                <ManufacturerTable province_vaccine_manufacturer={props.province_vaccine_manufacturer} />
            </div>
        </div>
    )

}