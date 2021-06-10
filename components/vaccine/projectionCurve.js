import React, { useEffect } from 'react';
import { extent, max, bisector, min } from 'd3-array'
import _ from 'lodash'
import { Group } from '@visx/group'
import { GridRows, GridColumns } from '@visx/grid'
import moment from 'moment'
import 'moment/locale/th'
import { scaleLinear, scaleBand, scaleTime } from '@visx/scale'
import { curveBasis } from '@visx/curve'
import { LinePath, SplitLinePath } from '@visx/shape'
import { ParentSize, withParentSize } from '@visx/responsive'
import data from '../gis/data/national-vaccination-timeseries.json'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { Text } from '@visx/text'

const population = 66186727 * 2 //doses roequired to cover all population (children included)

function generateExtension(ts) {
    const delta = ts[ts.length - 1]['deltaAvg'] //latest 7-day average vaccination rate
    const startDate = moment(ts[ts.length - 1]['date'])
    const initVaccinated = ts[ts.length - 1]['total_doses']
    var predictions = []
    var i = 0
    var predict = 0
    var m50_date = 0
    while (predict < population) {
        predict = parseInt(initVaccinated + (delta * i))
        if (predict < 50 * 1000 * 1000 * 2) {
            m50_date += 1
        }
        predictions.push({
            vaccinatedAvg: predict,
            date: startDate.add(1, 'd').format('YYYY-MM-DD'),
            estimation: true,
            deltaAvg: delta
        })
        i += 1
    }
    return { predictions: predictions, m50_date: m50_date }
}


function plannedRollout(ts) {
    const startDate = moment(ts[ts.length - 1]['date'])
    const goalDate = moment('2021-12-31')
    const eta = goalDate.diff(startDate, 'days')
    const initVaccinated = ts[ts.length - 1]['total_doses']
    const requiredRate = ((50 * 1000 * 1000 * 2) - initVaccinated) / eta
    var planned = []
    var i = 0
    var predict = 0
    var m50_date = 0

    while (predict < population) {
        predict = parseInt(initVaccinated + (requiredRate * i))
        if (predict < 50 * 1000 * 1000 * 2) {
            m50_date += 1
        }
        planned.push({
            vaccinatedAvg: predict,
            date: startDate.add(1, 'd').format('YYYY-MM-DD'),
            estimation: true,
            deltaAvg: requiredRate
        })
        i += 1
    }
    return { planned: planned, m50_date: m50_date, required_rate: requiredRate }
}

const EstimateCurve = (props) => {

    const { width, height } = props
    const timeSeries = data
    const generatedData = generateExtension(timeSeries)
    const extension = generatedData['predictions']
    const goal = plannedRollout(timeSeries)

    const dividedData = [timeSeries, extension]
    const merged = [...timeSeries, ...extension]
    useEffect(() => {
        props.setEstimation({
            m50_date: generatedData['m50_date'],
            deltaAvg: extension[extension.length-1]['deltaAvg']
        })
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
                        data={goal['planned']}
                        x={d => xScale(x(d))}
                        y={d => yScale(d['vaccinatedAvg']) - 30}
                        stroke="#ffffff"
                        strokeWidth={1.4}
                        strokeDasharray="3,4"
                    />
                    <Group>
                        <circle
                            cx={xScale(x(goal['planned'][goal['m50_date']]))}
                            cy={yScale(y(goal['planned'][goal['m50_date']])) - 30}
                            r={4}
                            strokeWidth={2}
                            stroke='#ffffff'
                            fill='#242424'
                        />
                        <Text
                            x={xScale(x(goal['planned'][goal['m50_date']]))}
                            y={yScale(y(goal['planned'][goal['m50_date']])) - 30}
                            fill='#fff'
                            dx={10}
                            dy={10}
                            width={150}
                            lineHeight={18}
                            fontFamily='Prompt'
                            fontSize={12}

                        >
                            {`${parseInt(goal['required_rate']).toLocaleString()} โดส/วัน เพื่อให้ครบ 50 ล้านคน ในสิ้นปี`}
                        </Text>
                    </Group>
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
                        numTicks={4}
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
                        numTicks={4}
                        top={-35}
                        left={20}
                        tickLength={0}
                    />
                    <AxisBottom
                        numTicks={4}
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

export const Projection = (props) => (
    <div>
        <ParentSize>
            {({ width, height }) => (
                <EstimateCurve setEstimation={props.setEstimation} width={width} height={width > 768 ? 350 : 300} />
            )}
        </ParentSize>
    </div>
)
