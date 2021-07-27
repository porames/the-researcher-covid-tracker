import React, { useEffect, useState } from 'react'
import data from '../gis/data/national-vaccination-timeseries.json'
import { extent } from 'd3-array'
import { scaleLinear, scaleBand, scaleTime } from '@visx/scale'
import { curveBasis } from '@visx/curve'
import { LinePath } from '@visx/shape'
import { Group } from '@visx/group'
import { MarkerArrow } from '@visx/marker'
import { NationalVaccinationDataProps } from './types'
import moment from 'moment'
import 'moment/locale/th'
import { movingAvg } from './util'


function TrendCurve(props) {
    var ts: NationalVaccinationDataProps[] = props.data
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
            <div style={{ color: props.fill }}>{delta > 0 ? '+' : ''}{Math.round(delta)}%</div>
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


function TrendCurveVaccination(props) {
    //var ts: NationalVaccinationDataProps[] = data.slice(data.length - 14, data.length)
    const { moving_aves: avgs, timeSeries: timeSeriesWithEmptyDates } = movingAvg(data, 'daily_vaccinations', 'rate')
    avgs.map((avg, i) => {
        timeSeriesWithEmptyDates[i]['deltaAvg'] = avg
    })
    var ts = timeSeriesWithEmptyDates.slice(timeSeriesWithEmptyDates.length - 14, timeSeriesWithEmptyDates.length)
    const width = 50
    const height = 20
    useEffect(() => {
        const i = ts[0].deltaAvg
        const f = ts[ts.length - 1].deltaAvg
        var delta = Math.floor(((f - i) / i) * 100)
        props.setDelta(delta)
    })
    const x = d => new Date(d.date);
    const y = d => d.deltaAvg;
    const xScale = scaleTime({
        range: [5, width - 5],
        domain: extent(ts, x)
    })
    const yScale = scaleLinear({
        range: [height - 2, 2],
        domain: extent(ts, y)
    })


    return (
        <svg width={width} height={height}>
            <Group>
                <MarkerArrow id="marker-arrow-vaccine" fill={'#60897e'} refX={2} size={4} />
                <LinePath
                    curve={curveBasis}
                    data={ts}
                    x={d => xScale(x(d))}
                    y={d => yScale(y(d))}
                    stroke='#60897e'
                    strokeWidth={2}
                    markerEnd='url(#marker-arrow-vaccine)'
                />
                )
            </Group>
        </svg>
    )
}

function NationalTable(props) {
    const [delta, setDelta] = useState<number>(undefined)
    return (
        <div className='table-responsive'>
            <table className="table table-theme-light mt-4 text-white">
                <thead>
                    <tr>
                        <th style={{ minWidth: 150 }} scope="col"></th>
                        <th className='text-end' scope="col">ตั้งแต่เริ่มฉีด</th>
                        <th className='text-end' scope='col'>{moment(props.updateDate).format('DD MMM')}</th>
                        <th style={{ minWidth: 140 }} className='text-end' scope="col">อัตราเร็ว 14 วัน</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className='text-sec'>
                        <td className='text-left' scope="row">จำนวนวัคซีนที่ฉีด</td>
                        <td>{data[data.length - 1]['total_doses'].toLocaleString()}</td>
                        <td>{data[data.length - 1]['daily_vaccinations'].toLocaleString()}</td>
                        <td >
                            <div className='d-flex justify-content-end'>
                                <TrendCurve setDelta={setDelta} data={data} id='daily_vaccinations' fill='#60897e' />
                            </div>
                        </td>
                    </tr>
                    <tr className='text-sec'>
                        <td className='text-left'>จำนวนวัคซีนคงเหลือ</td>
                        <td></td>
                        <td>{(data[data.length - 1]['total_supply'] - data[data.length - 1]['total_doses']).toLocaleString()}</td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
export default NationalTable