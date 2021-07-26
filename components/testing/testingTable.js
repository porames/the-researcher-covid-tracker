import React, { useEffect, useState } from 'react'
import data from '../gis/data/testing-data.json'
import { extent } from 'd3-array'
import { scaleLinear, scaleBand, scaleTime } from '@visx/scale'
import { curveBasis } from '@visx/curve'
import { LinePath } from '@visx/shape'
import { Group } from '@visx/group'
import { MarkerArrow } from '@visx/marker'
import moment from 'moment'
import 'moment/locale/th'
import _ from 'lodash'
import { movingAvg } from '../vaccine/util'

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



function TestingTable(props) {
    const ts = _.cloneDeep(data)
    const [latestWeek, setLatestWeek] = useState()
    const [latestWeek_pos, setLatestWeek_pos] = useState()
    const [lastUpdate, setLastUpdate] = useState()
    useEffect(() => {
        var currentPeriod = 0
        var prevPeriod = 0
        for (var i = ts.length - 1; i >= ts.length - 8; i--) {
            currentPeriod += ts[i]['tests']
        }
        for (var i = (ts.length - 1) - 7; i >= (ts.length - 8) - 7; i--) {
            prevPeriod += ts[i]['tests']
        }
        const thisWeek = ts.slice(ts.length - 7, ts.length).reduce((a, b) => a + b['tests'], 0)
        const thisWeek_pos = ts.slice(ts.length - 7, ts.length).reduce((a, b) => a + b['positive'], 0)
        setLatestWeek(thisWeek)
        setLatestWeek_pos(thisWeek_pos)
        setLastUpdate(ts[ts.length - 1]['date'])
    }, [])

    return (
        <div className='table-responsive'>
            <table className="table table-theme-light text-white">
                <thead>
                    <tr>
                        <th scope="col"></th>
                        <th className='text-end' scope="col">
                            สัปดาห์ล่าสุด<br />
                            {moment(lastUpdate).subtract(7, 'd').format('D MMM')} - {moment(lastUpdate).format('D MMM')}
                        </th>
                        <th className='text-end' scope="col">แนวโน้ม 14 วัน</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className='text-sec'>
                        <th scope="row">การตรวจเชื้อ</th>
                        <td>{Number(latestWeek).toLocaleString()}</td>
                        <td>
                            <TrendCurve data={ts} id='tests' fill='#e0e0e0' />
                        </td>
                    </tr>
                    <tr className='text-danger'>
                        <th scope="row">Positive Rate</th>
                        <td>{(latestWeek_pos * 100 / latestWeek).toFixed(1)}%</td>
                        <td>
                        </td>
                    </tr>

                </tbody>
            </table>
        </div>
    )
}
export default TestingTable