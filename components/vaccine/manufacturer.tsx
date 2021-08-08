import { useEffect, useState } from "react"
import ManufacturerCurve from './manufacturerCurve'
import _ from 'lodash'
import { usePopper } from 'react-popper';
import { sum } from 'd3'
const TableHeader = (props) => (
    <th
        scope='col'
        className={`provice-table-header sort-table-th`}
        style={{ whiteSpace: 'nowrap' }}
        onClick={() => props.sortChange(props.colId)}>
        <span className={`${props.sortData.column === props.colId ? props.sortData.direction : ''}`}>
            {props.text}
        </span>
    </th>
)



const ShareChart = (props) => {
    const manufacturers = ["AstraZeneca", "Sinovac", "Sinopharm", "Pfizer", "J&J"]
    const brand_colors = ['#F29F05', '#ff5722', 'green', '#00AFF0', '#D71500']
    const [isHover, setHover] = useState(false)
    const [referenceElement, setReferenceElement] = useState(null);
    const [popperElement, setPopperElement] = useState(null);
    const [arrowElement, setArrowElement] = useState(null);
    const { styles, attributes } = usePopper(referenceElement, popperElement, {
        placement: 'left',
        strategy: 'fixed',
        modifiers: [{
            name: 'arrow',
            options: {
                element: arrowElement
            }
        }],
    });
    return (
        <td onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}>
            <div >
                <div
                    className="manufacturers_bar d-flex w-100" style={{ height: 10 }} ref={setReferenceElement}
                >
                    {props.shares.map((mf, index) => {
                        return (
                            <div key={index} style={{ width: `${mf * 100}%`, backgroundColor: brand_colors[index] }} />
                        )
                    })}
                </div>
                {isHover &&
                    <div
                        className='bg-white container shadow rounded text-dark py-2 mr-3'
                        style={{ ...styles.popper, maxWidth: 180, minWidth: 150 }}
                        ref={setPopperElement} {...attributes.popper}>
                        {props.shares.map((mf, index) => {
                            return (
                                <div className='row' key={index}>
                                    <div className='col-4 text-left'>
                                        <b>{manufacturers[index]}</b>
                                    </div>
                                    <div className='col-8'>
                                        {(mf * 100).toFixed(1)}%
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                }
            </div>
        </td>
    )
}

function ManufacturerTable(props) {
    const [showAll, setShowAll] = useState<boolean>(false)
    const [isDescSort, setIsDescSort] = useState(true)
    const [sortData, setSortData] = useState({
        column: 'total_doses',
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
    var national_sum = {}
    national_sum['total_doses'] = sum(data, d => d['total_doses'])
    national_sum['AstraZeneca'] = sum(data, d => d['AstraZeneca'])
    national_sum['Sinovac'] = sum(data, d => d['Sinovac'])
    national_sum['Pfizer'] = sum(data, d => d['Pfizer'])
    national_sum['Sinopharm'] = sum(data, d => d['Sinopharm'])
    national_sum['Johnson & Johnson'] = sum(data, d => d['Johnson & Johnson'])

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
                            <th className='text-left' style={{ minWidth: 100 }} scope="col">จังหวัด</th>
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
                                colId='Sinovac'
                                text='Sinovac'
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
                                colId='Sinopharm'
                                text='Sinopharm'
                            />
                            <TableHeader
                                sortChange={sortChange}
                                sortData={sortData}
                                colId='JnJ'
                                text='J&J'
                            />
                            <th
                                scope='col' className='provice-table-header sort-table-th'
                                style={{ minWidth: 140 }}
                            >
                                สัดส่วน
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className='text-sec' style={{ backgroundColor: '#333' }}>
                            <td className='text-left'>
                                <b>ทั้งประเทศ</b>
                            </td>
                            <td>
                                {national_sum['total_doses'].toLocaleString()}
                            </td>
                            <td>
                                {national_sum['AstraZeneca'].toLocaleString()}
                            </td>

                            <td>
                                {national_sum['Sinovac'].toLocaleString()}
                            </td>
                            <td>
                                {national_sum['Pfizer'].toLocaleString()}
                            </td>
                            <td>
                                {national_sum['Sinopharm'].toLocaleString()}
                            </td>
                            <td>
                                {national_sum['Johnson & Johnson'].toLocaleString()}
                            </td>
                            <ShareChart
                                shares={[
                                    national_sum['AstraZeneca'] / national_sum['total_doses'],
                                    national_sum['Sinovac'] / national_sum['total_doses'],
                                    national_sum['Sinopharm'] / national_sum['total_doses'],
                                    national_sum['Pfizer'] / national_sum['total_doses'],
                                    national_sum['Johnson & Johnson'] / national_sum['total_doses']
                                ]}
                            />
                        </tr>

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

                                        <td>
                                            {province['Sinovac'].toLocaleString()}
                                        </td>
                                        <td>
                                            {province['Pfizer'].toLocaleString()}
                                        </td>
                                        <td>
                                            {province['Sinopharm'].toLocaleString()}
                                        </td>
                                        <td className='col-spacing'>
                                            {province['Johnson & Johnson'].toLocaleString()}
                                        </td>
                                        <ShareChart
                                            shares={[
                                                province['AstraZeneca-share'],
                                                province['Sinovac-share'],
                                                province['Sinopharm-share'],
                                                province['Pfizer-share'],
                                                province['JnJ-share']
                                            ]}
                                        />
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