import React, { useEffect, useState } from 'react';
import { extent, max, bisector, min } from 'd3-array'
import _ from 'lodash'
import { Group } from '@visx/group'
import { GridRows, GridColumns } from '@visx/grid'
import { Text } from '@visx/text'
import moment from 'moment'
import 'moment/locale/th'
import { localPoint } from '@visx/event'
import { scaleLinear, scaleBand, scaleTime } from '@visx/scale'
import { useTooltip, Tooltip, defaultStyles, TooltipWithBounds } from '@visx/tooltip'
import { curveBasis } from '@visx/curve'
import { LinePath, SplitLinePath } from '@visx/shape'
import { ParentSize, withParentSize } from '@visx/responsive'
import data from '../gis/data/national-vaccination-timeseries.json'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { movingAvg } from './util'

const population = 66186727
const adults = 50298135


function generateExtension(ts) {
    const delta = Math.floor(ts[ts.length - 1]['vaccinatedAvg'] - ts[ts.length - 2]['vaccinatedAvg'])
    const startDate = moment(ts[ts.length - 1]['date'])
    const initVaccinated = ts[ts.length - 1]['first_dose']
    var predictions = []
    var i = 0
    var predict = 0
    var p70date = ts.length
    var allAdults = ts.length
    var m50date = ts.length

    while (predict < population) {
        predict = parseInt(initVaccinated + (delta * i))
        if (predict < 0.7 * population) {
            p70date += 1
        }
        if (predict < adults) {
            allAdults += 1
        }
        if (predict < 50 * 1000 * 1000) {
            m50date += 1
        }
        predictions.push({
            vaccinatedAvg: predict,
            date: startDate.add(1, 'd').format('YYYY-MM-DD'),
            estimation: true,
            deltaAvg: delta
        })
        i += 1
    }
    return { prediction: predictions, p70date: p70date, allAdults: allAdults, m50date: m50date }
}

function plannedRollout(ts) {
    const startDate = moment(ts[ts.length - 1]['date'])
    const goalDate = moment('2021-10-15')
    const eta = goalDate.diff(startDate, 'days')
    const initVaccinated = ts[ts.length - 1]['first_dose']
    const requiredRate = ((50 * 1000 * 1000) - initVaccinated) / eta
    var planned = []
    var i = 0
    var predict = 0
    var p70date = 0
    var allAdults = 0
    var m50date = 0

    while (predict < population) {
        predict = parseInt(initVaccinated + (requiredRate * i))
        if (predict < 0.7 * population) {
            p70date += 1
        }
        if (predict < adults) {
            allAdults += 1
        }
        if (predict < 50 * 1000 * 1000) {
            m50date += 1
        }
        planned.push({
            vaccinatedAvg: predict,
            date: startDate.add(1, 'd').format('YYYY-MM-DD'),
            estimation: true,
            deltaAvg: requiredRate
        })
        i += 1
    }
    return { planned: planned, p70date: p70date, allAdults: allAdults, m50date: m50date }
}

const EstimateCurve = (props) => {
    const { width, height } = props
    const timeSeries = _.cloneDeep(data)
    const { moving_aves: avgs } = movingAvg(data, 'first_dose')
    avgs.map((avg, i) => {
        timeSeries[i]['vaccinatedAvg'] = avg
    })
    useEffect(() => {
        props.setLatestData(timeSeries[timeSeries.length - 1])
    }, [])
    const extension = generateExtension(timeSeries)
    const dividedData = [timeSeries, extension['prediction']]
    const merged = [...timeSeries, ...extension['prediction']]
    const planned = plannedRollout(data)
    useEffect(() => {
        props.setEstimation(merged[merged.length - 1])
    }, [])
    const x = d => new Date(d['date'])
    const y = d => d['vaccinatedAvg']
    const xScale = scaleBand({
        range: [20, width - 20],
        domain: merged.map(x),
        padding: 0.07
    })
    const dateScale = scaleTime({
        range: [20, width - 20],
        domain: extent(merged, x),
    })
    const yScale = scaleLinear({
        range: [height, 50],
        domain: [0, max(merged, y)],
    })
    return (
        <div style={{ position: 'relative' }}>
            <svg width={width} height={height}>
                <Group>
                    <LinePath
                        curve={curveBasis}
                        data={planned['planned']}
                        x={d => xScale(x(d))}
                        y={d => yScale(d['vaccinatedAvg']) - 30}
                        stroke="#ffffff"
                        strokeWidth={1.4}
                        strokeDasharray="3,4"
                    />
                    <circle
                        cx={xScale(x(planned['planned'][planned['m50date']]))}
                        cy={yScale(y(planned['planned'][planned['m50date']])) - 30}
                        r={4}
                        strokeWidth={2}
                        stroke='#ffffff'
                        fill='#242424'
                    />
                    <Text
                        x={xScale(x(planned['planned'][planned['m50date']]))}
                        y={yScale(y(planned['planned'][planned['m50date']])) - 30}
                        fill='#fff'
                        dx={10}
                        dy={10}
                        width={150}
                        lineHeight={18}
                        fontFamily="Sarabun"
                        fontWeight="bold"
                        fontSize={12}
                    >
                        {`                        
                        ต้องฉีดเข็มแรกให้ได้ ${Math.floor(planned['planned'][0]['deltaAvg']).toLocaleString()} คน/วัน เพื่อให้ทันเป้าหมาย
                        `}
                    </Text>
                </Group>
                <Group>
                    <LinePath
                        curve={curveBasis}
                        data={dividedData[0]}
                        x={d => dateScale(x(d))}
                        y={d => yScale(d['first_dose']) - 30}
                        stroke="#7ea297"
                        strokeWidth={2}
                    />
                    <LinePath
                        curve={curveBasis}
                        data={dividedData[1]}
                        x={d => dateScale(x(d))}
                        y={d => yScale(d['vaccinatedAvg']) - 30}
                        stroke="#7ea297"
                        strokeWidth={2}
                        strokeDasharray="3,4"
                    />
                    <circle
                        cx={xScale(x(merged[extension['m50date']]))}
                        cy={yScale(y(merged[extension['m50date']])) - 30}
                        r={4}
                        strokeWidth={2}
                        stroke='#7ea297'
                        fill='#242424'
                    />
                    <Text
                        x={xScale(x(merged[extension['m50date']]))}
                        y={yScale(y(merged[extension['m50date']])) - 30}
                        fill='#fff'
                        dx={10}
                        dy={10}
                        width={150}
                        lineHeight={18}
                        fontFamily="Sarabun"
                        fontWeight="bold"
                        fontSize={12}
                    >
                        {`                        
                        ปัจจุบันฉีดได้ ${Math.floor(dividedData[1][0]['deltaAvg']).toLocaleString()} คน/วัน
                        `}
                    </Text>
                    <circle
                        cx={xScale(x(merged[timeSeries.length]))}
                        cy={yScale(y(merged[timeSeries.length])) - 30}
                        r={4}
                        strokeWidth={2}
                        stroke='#242424'
                        fill='#7ea297'
                    />

                    <Text
                        x={xScale(x(merged[timeSeries.length]))}
                        y={yScale(y(merged[timeSeries.length])) - 30}
                        fill='#fff'
                        dx={10}
                        dy={10}
                        width={150}
                        lineHeight={18}
                        fontFamily="Sarabun"
                        fontWeight="bold"
                        fontSize={12}
                    >
                        {`                        
                        คนไทยได้รับวัคซีนแล้ว ${Math.floor(dividedData[0][dividedData[0].length - 1]['first_dose']).toLocaleString()} คน
                        `}
                    </Text>
                </Group>
                <Group>
                    <GridRows
                        scale={yScale}
                        width={width - 40}
                        top={-30}
                        left={20}
                        strokeDasharray="1,5"
                        stroke={"#fff"}
                        strokeOpacity={0.3}
                        pointerEvents="none"
                        numTicks={5}
                    />
                </Group>
                <Group>
                    <AxisLeft
                        scale={yScale}
                        tickLabelProps={() => ({
                            fill: '#bfbfbf',
                            fontSize: 11,
                            textAnchor: 'start',
                            opacity: 0.7
                        })}
                        tickFormat={(d: number) => `${d / 1000000} ล้าน`}
                        numTicks={5}
                        top={-35}
                        left={20}
                        tickLength={0}
                    />
                    <AxisBottom
                        top={height - 30}
                        scale={dateScale}
                        tickFormat={(d) => moment(String(d)).format('MMM YY')}
                        numTicks={6}
                        tickStroke='#bfbfbf'
                        stroke='#bfbfbf'
                        tickLabelProps={() => ({
                            fill: '#bfbfbf',
                            fontSize: 11,
                            textAnchor: 'middle'
                        })}
                    />
                </Group>
            </svg>
            <h5 className='font-weight-bold text-center mt-4'>ด้วยความเร็วการฉีดปัจจุบัน คนไทย 50 ล้านคนจะได้รับวัคซีนในอีก {extension['m50date'] - timeSeries.length} วัน</h5>
        </div>
    )
}

export default function Projection(props) {
    const [estimation, setEstimation] = useState(undefined)
    return (

        <ParentSize>
            {({ width, height }) => (
                <EstimateCurve setLatestData={props.setLatestData} setEstimation={setEstimation} width={width} height={500} />
            )}
        </ParentSize>

    )
}