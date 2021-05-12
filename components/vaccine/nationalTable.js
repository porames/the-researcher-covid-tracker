import React, { useEffect, useState } from 'react'
import data from '../gis/data/national-vaccination-timeseries.json'
import { extent } from 'd3-array'
import { scaleLinear, scaleBand, scaleTime } from '@visx/scale'
import { curveBasis } from '@visx/curve'
import { LinePath } from '@visx/shape'
import { Group } from '@visx/group'
import { MarkerArrow } from '@visx/marker'
import moment from 'moment'
import 'moment/locale/th'
function movingAvg(ts) {
    var moving_aves = []
    var ys = []
    for (var i = 0; i < ts.length; i++) {
        ys.push(ts[i]['daily_vaccinations'])
    }
    for (var i = 0; i < ys.length; i++) {
        if (i >= 7) {
            const cosum = ys.slice(i - 7, i)
            moving_aves.push(cosum.reduce((a, b) => a + b, 0) / 7)
        }
        else {
            moving_aves.push(0)
        }
    }
    return moving_aves
}

function TrendCurveVaccination(props) {
    var ts = data.slice(data.length - 14, data.length)
    console.log(ts)
    const width = 50
    const height = 20
    useEffect(()=>{
        const i = ts[0]['deltaAvg']
        const f = ts[ts.length-1]['deltaAvg']
        var delta = parseInt(((f-i)/i)*100)
        if(delta > 0){
            delta = `+${delta}%`
        }
        else{
            delta = `${delta}%`
        }
        props.setDelta(delta)
    })
    const x = d => new Date(d['date']);
    const y = d => d['deltaAvg'];
    const xScale = scaleTime({
        range: [5, width - 5],
        domain: extent(ts, x)

    })
    const yScale = scaleLinear({
        range: [height-2, 2],
        domain: extent(ts, y)
    })

    return (
        <svg width={width} height={height}>
            <Group>
                <MarkerArrow id="marker-arrow-vaccine" fill={'#60897e'} refX={2} size={4} />
                {[ts].map((lineData, i) => {
                    return (
                        <LinePath
                            key={i}
                            curve={curveBasis}
                            data={lineData}
                            x={d => xScale(x(d))}
                            y={d => yScale(y(d))}
                            stroke='#60897e'
                            strokeWidth={2}
                            markerEnd='url(#marker-arrow-vaccine)'
                        />
                    )
                })}
            </Group>
        </svg>
    )
}

function NationalTable(props) {
    const [delta, setDelta] = useState(undefined)
    return (
        <div className='table-responsive'>
            <table className="table table-theme-light mt-4 text-white">
                <thead>
                    <tr>
                        <th scope="col"></th>
                        <th className='text-end' scope="col">ทั้งประเทศ</th>
                        <th className='text-end' scope='col'>{moment(props.updateDate).format('DD MMM')}</th>
                        <th className='text-end' scope="col">อัตราเร็ว 14 วัน</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className='text-sec'>
                        <th className='text-left' scope="row">จำนวนผู้ได้รับวัคซีน</th>
                        <td>{data[data.length - 1]['vaccinated'].toLocaleString()}</td>
                        <td>{data[data.length - 1]['daily_vaccinations'].toLocaleString()}</td>
                        <td className='d-flex justify-content-end'>
                            <div style={{color: '#60897e'}}>{delta}</div>
                            <div className='ml-1'>
                                <TrendCurveVaccination setDelta={setDelta} />
                            </div>
                        </td>
                    </tr>


                </tbody>
            </table>
        </div>
    )
}
export default NationalTable