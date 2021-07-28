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

function ManufacturerTable(props) {
    const [showAll, setShowAll] = useState<boolean>(false)
    const [isDescSort, setIsDescSort] = useState(true)
    const [sortData, setSortData] = useState({
        column: 'total-supply',
        direction: 'down'
    })
    var data = _.cloneDeep(dataset)['data']
    data = data.filter(province => province.id !== '0')
    data.map((province, index) => {
        data[index]['AstraZeneca-share'] = data[index]['AstraZeneca-supply'] * 100 / data[index]['total-supply']
        data[index]['Sinovac-share'] = data[index]['Sinovac-supply'] * 100 / data[index]['total-supply']
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
        data = _.sortBy(data, sortData.column)
        if (sortData.direction == 'down') {
            data.reverse()
        }
        setData(data)
    }, [sortData])

    return (
        <div>
            <div className='mt-3 table-responsive-md'>
                <table className="table table-theme-light text-white w-100 position-relative" style={{ fontSize: '90%' }}>
                    <thead>
                        <tr>
                            <th className='text-left' style={{ minWidth: 150 }} scope="col">จังหวัด</th>
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='total-supply'
                                text='จำนวนวัคซีนที่ได้รับ'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='AstraZeneca-supply'
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
                                colId='Sinovac-supply'
                                text='Sinovac'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='Sinovac-share'
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
                                            <b>{province.name}</b>
                                        </td>
                                        <td className='col-spacing'>
                                            {province['total-supply'].toLocaleString()}
                                        </td>
                                        <td>
                                            {province['AstraZeneca-supply'].toLocaleString()}
                                        </td>
                                        <td className='col-spacing'>
                                            <AzBadge percentage={province['AstraZeneca-share']} />
                                        </td>
                                        <td>
                                            {province['Sinovac-supply'].toLocaleString()}
                                        </td>
                                        <td>
                                            <SvBadge percentage={province['Sinovac-share']} />
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
        <div className='container' style={{ maxWidth: 700 }}>
            <div className='text-center'>
                <h2>จำนวนวัคซีนที่ฉีดแยกตามผู้ผลิต</h2>
                <p className='text-muted mb-3'>เส้นแสดงจำนวนค่าเฉลี่ย 7 วันของวัคซีนยี่ห้อต่าง ๆ ที่ฉีดทั่วประเทศ</p>
            </div>
            <ManufacturerCurve />
            <ManufacturerTable />
        </div>

    )

}