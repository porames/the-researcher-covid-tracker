import React, { useEffect, useState } from 'react';
import { extent, max, bisector, min } from 'd3-array'
import _ from 'lodash'
import { Group } from '@visx/group'
import { GridRows, GridColumns } from '@visx/grid'

import { Circle } from '@visx/shape'
import moment from 'moment'
import 'moment/locale/th'
import { localPoint } from '@visx/event'
import { scaleLinear, scaleBand, scaleTime } from '@visx/scale'
import { useTooltip, Tooltip, defaultStyles, TooltipWithBounds } from '@visx/tooltip'
import { curveBasis } from '@visx/curve'
import { LinePath, SplitLinePath } from '@visx/shape'
import { ParentSize, withParentSize } from '@visx/responsive'
import data from '../../components/gis/data/national-vaccination-timeseries.json'
import { AxisBottom, AxisLeft } from '@visx/axis'

const population = 66186727 * 2
const adults = 50298135 * 2

function movingAvg(ts, id) {
    var moving_aves = []
    var ys = []
    for (var i = 0; i < ts.length; i++) {
        ys.push(ts[i][id])
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

function generateExtension(ts) {
    const delta = ts[ts.length - 1]['deltaAvg']
    const startDate = moment(ts[ts.length - 1]['date'])
    const initVaccinated = ts[ts.length - 1]['total_doses']
    var predictions = []
    var i = 0
    var predict = 0
    var p70date = ts.length
    var allAdults = ts.length

    while (predict < population) {
        predict = parseInt(initVaccinated + (delta * i))
        if (predict < 0.7 * population) {
            p70date += 1
        }
        if (predict < adults) {
            allAdults += 1
        }
        predictions.push({
            vaccinatedAvg: predict,
            date: startDate.add(1, 'd').format('YYYY-MM-DD'),
            estimation: true,
            deltaAvg: delta
        })
        i += 1
    }
    return { prediction: predictions, p70date: p70date, allAdults: allAdults }
}

function plannedRollout(ts) {
    const startDate = moment(ts[ts.length - 1]['date'])
    const goalDate = moment('2021-12-31')
    const eta = goalDate.diff(startDate, 'days')
    const initVaccinated = ts[ts.length - 1]['total_doses']
    const requiredRate = ((population * 0.7) - initVaccinated) / eta
    console.log(requiredRate)
    var planned = []
    var i = 0
    var predict = 0
    var p70date = 0
    var allAdults = 0
    
    while (predict < population) {
        predict = parseInt(initVaccinated + (requiredRate * i))
        if (predict < 0.7 * population) {
            p70date += 1
        }
        if (predict < adults) {
            allAdults += 1
        }
        planned.push({
            vaccinatedAvg: predict,
            date: startDate.add(1, 'd').format('YYYY-MM-DD'),
            estimation: true,
            deltaAvg: requiredRate
        })
        i += 1
    }
    return { planned: planned, p70date: p70date, allAdults: allAdults }
}

const EstimateCurve = (props) => {
    const { width, height } = props
    const timeSeries = data
    const avgs = movingAvg(timeSeries, 'total_doses')
    avgs.map((avg, i) => {
        timeSeries[i]['vaccinatedAvg'] = avg
    })
    const deltaAvgs = movingAvg(timeSeries, 'daily_vaccinations')
    deltaAvgs.map((avg, i) => {
        timeSeries[i]['deltaAvg'] = avg
    })
    const extension = generateExtension(timeSeries)
    const dividedData = [timeSeries, extension['prediction']]
    const merged = [...timeSeries, ...extension['prediction']]

    const planned = plannedRollout(data)
    console.log('estimated p70: ',merged[extension['p70date']])
    console.log('estimated allAdults: ',merged[extension['allAdults']])
    console.log('planned p70: ',planned['planned'][planned['p70date']])
    console.log('planned allAdults: ',planned['planned'][planned['allAdults']])
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
        padding: 0.07
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
                        cx={xScale(x(planned['planned'][planned['p70date']]))}
                        cy={yScale(y(planned['planned'][planned['p70date']])) - 30}
                        r={4}
                        strokeWidth={2}
                        stroke='#ffffff'
                        fill='#242424'
                    />
                    <circle
                        cx={xScale(x(planned['planned'][planned['allAdults']]))}
                        cy={yScale(y(planned['planned'][planned['allAdults']])) - 30}
                        r={4}
                        strokeWidth={2}
                        stroke='#ffffff'
                        fill='#242424'
                    />


                </Group>
                <Group>
                    <SplitLinePath
                        segments={dividedData}
                        x={d => xScale(x(d))}
                        y={d => yScale(d['vaccinatedAvg']) - 30}
                        curve={curveBasis}
                        styles={[
                            { stroke: '#7ea297', strokeWidth: 2 },
                            { stroke: "#7ea297", strokeWidth: 1.4, strokeDasharray: "3,4" },
                        ]}
                    >
                        {({ segment, styles, index }) =>
                            <LinePath
                                data={segment}
                                x={(d) => d.x || 0}
                                y={(d) => d.y || 0}
                                {...styles}
                            />

                        }
                    </SplitLinePath>
                    <circle
                        cx={xScale(x(merged[extension['p70date']]))}
                        cy={yScale(y(merged[extension['p70date']])) - 30}
                        r={4}
                        strokeWidth={2}
                        stroke='#7ea297'
                        fill='#242424'
                    />
                    <circle
                        cx={xScale(x(merged[extension['allAdults']]))}
                        cy={yScale(y(merged[extension['allAdults']])) - 30}
                        r={4}
                        strokeWidth={2}
                        stroke='#7ea297'
                        fill='#242424'
                    />
                    <circle
                        cx={xScale(x(merged[timeSeries.length]))}
                        cy={yScale(y(merged[timeSeries.length])) - 30}
                        r={4}
                        strokeWidth={2}
                        stroke='#242424'
                        fill='#7ea297'
                    />
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
                            textAnchor: 'left',
                            opacity: 0.7
                        })}
                        tickFormat={d => (`${parseInt(d * 100 / population)}%`)}
                        numTicks={5}
                        top={-35}
                        left={20}
                        tickLength={0}
                    />
                    <AxisBottom
                        numTicks={6}
                        top={height - 30}
                        scale={dateScale}
                        tickFormat={d => moment(d).format('YYYY')}
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
        </div>
    )
}

export default function Projection() {
    const [estimation, setEstimation] = useState(undefined)
    return (
        <div className='dark-theme py-5'>
            <div className='container'>
                <ParentSize>
                    {({ width, height }) => (
                        <EstimateCurve setEstimation={setEstimation} width={width} height={600} />
                    )}
                </ParentSize>
            </div>
        </div>
    )
}