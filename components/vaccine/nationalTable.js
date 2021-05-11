import React, { useEffect } from 'react'
import ts from '../gis/data/national-vaccination-timeseries.json'
import { extent } from 'd3-array'
import { scaleLinear, scaleBand, scaleTime } from '@visx/scale'
import { curveBasis } from '@visx/curve'
import { LinePath } from '@visx/shape'
import { Group } from '@visx/group'
import { MarkerArrow } from '@visx/marker'
import moment from 'moment'
import 'moment/locale/th'
function movingAvg(ts, hospitalization) {
    var moving_aves = []
    var ys = []
    if (!hospitalization) {
        for (var i = 0; i < ts.length; i++) {
            ys.push(ts[i]['NewConfirmed'])
        }
    }
    else {
        for (var i = 0; i < ts.length; i++) {
            ys.push(ts[i]['Hospitalized'])
        }
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

function TrendCurveInfectionRate(props) {
    var ts = props.data
    ts = ts.slice(ts.length - 30, ts.length)
    const width = 50
    const height = 20
    var avgs = movingAvg(ts)
    avgs = avgs.slice(avgs.length - 14, avgs.length)
    ts = ts.slice(ts.length - 14, ts.length)
    avgs.map((avg, i) => {
        ts[i]['movingAvg'] = avg
    })

    const x = d => new Date(d['Date']);
    const y = d => d['movingAvg'];
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
                <MarkerArrow id="marker-arrow" fill={'#cf1111'} refX={2} size={4} />
                {[ts].map((lineData, i) => {
                    return (
                        <LinePath
                            key={i}
                            curve={curveBasis}
                            data={lineData}
                            x={d => xScale(x(d))}
                            y={d => yScale(y(d))}
                            stroke='#cf1111'
                            strokeWidth={2}
                            markerEnd='url(#marker-arrow)'
                        />
                    )
                })}
            </Group>
        </svg>
    )
}

function TrendCurveHospitalization(props) {
    ts = ts.slice(ts.length - 30, ts.length)
    const width = 50
    const height = 20
    var avgs = movingAvg(ts, true)
    avgs = avgs.slice(avgs.length - 14, avgs.length)
    ts = ts.slice(ts.length - 14, ts.length)
    avgs.map((avg, i) => {
        ts[i]['movingAvg'] = avg
    })

    const x = d => new Date(d['Date']);
    const y = d => d['movingAvg'];
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
                <MarkerArrow id="marker-arrow-2" fill={'#e0e0e0'} refX={2} size={4} />
                {[ts].map((lineData, i) => {
                    return (
                        <LinePath
                            key={i}
                            curve={curveBasis}
                            data={lineData}
                            x={d => xScale(x(d))}
                            y={d => yScale(y(d))}
                            stroke='#e0e0e0'
                            strokeWidth={2}
                            markerEnd='url(#marker-arrow-2)'
                        />
                    )
                })}
            </Group>
        </svg>
    )
}

function NationalTable(props) {
   
    
    return (
        <div className='table-responsive'>
            <table className="table table-theme-light mt-4 text-white">
                <thead>
                    <tr>
                        <th scope="col"></th>
                        <th className='text-end' scope="col">ทั้งประเทศ</th>
                        <th>วันที่</th>
                        <th className='text-end' scope="col">แนวโน้ม 14 วัน</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className='text-sec'>
                        <th className='text-left' scope="row">จำนวนผู้ได้รับวัคซีน</th>
                        <td>{ts[ts.length - 1]['vaccinated'].toLocaleString()}</td>
                        <td>{ts[ts.length - 1]['daily_vaccinations'].toLocaleString()}</td>
                        <td className='d-flex justify-content-end'>

                        </td>
                    </tr>


                </tbody>
            </table>
        </div>
    )
}
export default NationalTable