import React, { useEffect } from 'react'
import data from './gis/data/national-timeseries.json'
import { extent } from 'd3-array'
import { scaleLinear, scaleBand, scaleTime } from '@visx/scale'
import { curveBasis } from '@visx/curve'
import { LinePath } from '@visx/shape'
import { Group } from '@visx/group'
import { MarkerArrow } from '@visx/marker'
import moment from 'moment'
import { movingAvg } from './vaccine/util'
import 'moment/locale/th'

function TrendCurve(props) {
    var ts = props.data
    ts = ts.slice(ts.length - 30, ts.length)
    const width = 50
    const height = 20
    const { moving_aves: avgs } = movingAvg(ts, props.id, 'rate')
    var latestAvgs = avgs.slice(avgs.length - 14, avgs.length)
    ts = ts.slice(ts.length - 14, ts.length)
    latestAvgs.map((avg, i) => {
        ts[i]['movingAvg'] = avg
    })
    const x = d => new Date(d['date']);
    const y = d => d['movingAvg'];
    const xScale = scaleTime({
        range: [5, width - 5],
        domain: extent(ts, x)

    })
    const yScale = scaleLinear({
        range: [height - 2, 2],
        domain: extent(ts, y)
    })
    const delta = (latestAvgs[latestAvgs.length - 1] - latestAvgs[0]) * 100 / latestAvgs[0]
    return (
        <div className='d-flex justify-content-end'>
            <div>{delta > 0 ? '+' : ''}{parseInt(delta)}%</div>
            <div className='ml-1'>
                <svg width={width} height={height}>
                    <Group>
                        <MarkerArrow id={`marker-arrow-${props.id}`} fill={props.fill} refX={2} size={4} />
                        <LinePath
                            curve={curveBasis}
                            data={ts}
                            x={d => xScale(x(d))}
                            y={d => yScale(y(d))}
                            stroke={props.fill}
                            strokeWidth={2}
                            markerEnd={`url(#marker-arrow-${props.id})`}
                        />
                    </Group>
                </svg>
            </div>
        </div>
    )
}

function NationalTable(props) {
    const ts = data
    useEffect(() => {
        props.updatedAt(data[data.length - 1]['date'])
    }, [])

    return (
        <div className='table-responsive'>
            <table className="table table-theme-light mt-2 text-white">
                <thead>
                    <tr>
                        <th scope="col"></th>
                        <th className='text-end' scope="col">ตั้งแต่เริ่มระบาด</th>
                        <th className='text-end' scope="col">{moment(data[data.length - 1]['Date']).format('D MMM')}</th>
                        <th className='text-end' scope="col">แนวโน้ม 14 วัน</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className='text-danger'>
                        <th scope="row">ผู้ติดเชื้อ</th>
                        <td>{ts[ts.length - 1]['Confirmed'].toLocaleString()}</td>
                        <td>{ts[ts.length - 1]['NewConfirmed'].toLocaleString()}</td>
                        <td>
                            <TrendCurve data={ts} id='NewConfirmed' fill='#cf1111' />
                        </td>
                    </tr>

                    <tr className='text-sec'>
                        <th scope="row">รักษาตัวในโรงพยาบาล</th>
                        <td></td>
                        <td>{ts[ts.length - 1]['Hospitalized'].toLocaleString()}</td>
                        <td>
                            <TrendCurve data={ts} id='Hospitalized' fill='#e0e0e0' />
                        </td>
                    </tr>
                    <tr className='text-sec'>
                        <th scope="row">เสียชีวิต</th>
                        <td>{ts[ts.length - 1]['Deaths'].toLocaleString()}</td>
                        <td>{ts[ts.length - 1]['NewDeaths'].toLocaleString()}</td>
                        <td>
                            <TrendCurve data={ts} id='NewDeaths' fill='#e0e0e0' />
                        </td>
                    </tr>

                </tbody>
            </table>
        </div>
    )
}
export default NationalTable