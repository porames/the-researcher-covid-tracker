import React, { useEffect } from 'react';
import { extent, max } from 'd3-array'
import _ from 'lodash'
import { Group } from '@visx/group'
import { GridRows, GridColumns } from '@visx/grid'
import moment from 'moment'
import 'moment/locale/th'
import { Text } from '@visx/text'
import { scaleLinear, scaleBand, scaleTime } from '@visx/scale'
import { curveBasis } from '@visx/curve'
import { LinePath, SplitLinePath } from '@visx/shape'
import { ParentSize } from '@visx/responsive'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { ManufacturerDataProps } from './types'
import { movingAvg } from './util'

function ManufacturerLine(props) {
    var timeSeries = props.manufacturer_timeseries
    const { moving_aves: avgs, timeSeries: timeSeriesWithEmptyDates } = movingAvg(timeSeries, props.id, 'rate')
    avgs.map((avg, i) => {
        timeSeriesWithEmptyDates[i]['vaccinatedAvg'] = avg
    })
    const x = d => new Date(d['date'])
    const y = d => d['vaccinatedAvg']
    return (
        <Group>
            <Text
                x={props.dateScale(x(timeSeriesWithEmptyDates[props.label_loc]))}
                y={props.yScale(y(timeSeriesWithEmptyDates[props.label_loc])) - 30}
                fill={props.color}
                dx={props.dx ? props.dx : 0}
                dy={props.dy ? props.dy : -10}
                width={150}
                lineHeight={18}
                textAnchor={props.textAnchor ? props.textAnchor : "middle"}
                fontFamily='Prompt'
                fontSize={12}
            >
                {props.name}
            </Text>
            <LinePath
                curve={curveBasis}
                data={timeSeriesWithEmptyDates}
                x={d => props.dateScale(x(d))}
                y={d => props.yScale(d['vaccinatedAvg']) - 30}
                stroke={props.color}
                strokeWidth={2}
            />
        </Group>
    )
}

function ManufacturerCurve(props) {
    var timeSeries = props.manufacturer_timeseries
    const width = props.width
    const height = props.height
    const { moving_aves: avgs } = movingAvg(timeSeries, "AstraZeneca_rate", 'rate')
    const x = d => new Date(d['date'])
    const yScale = scaleLinear({
        range: [height, 50],
        domain: [0, Math.max(...avgs)],
    })
    const dateScale = scaleTime({
        range: [0, width],
        domain: extent(timeSeries, x),
    })
    return (
        <div className='no-select' style={{ position: 'relative' }}>
            <svg width={width} height={height}>
                <Group>
                    <ManufacturerLine
                        manufacturer_timeseries={timeSeries}
                        dateScale={dateScale}
                        yScale={yScale}
                        name='AstraZeneca'
                        id='AstraZeneca_rate'
                        textAnchor="end"
                        color='#F29F05'
                        label_loc={102}
                        dx={-10}
                    />
                    <ManufacturerLine
                        manufacturer_timeseries={timeSeries}
                        dateScale={dateScale}
                        yScale={yScale}
                        name='Sinovac'
                        dy={-15}
                        id='Sinovac_rate'
                        color='#ff5722'
                        label_loc={85}
                    />
                    <ManufacturerLine
                        manufacturer_timeseries={timeSeries}
                        dateScale={dateScale}
                        yScale={yScale}
                        name='Sinopharm'
                        id='Sinopharm_rate'
                        color='green'
                        label_loc={120}
                        textAnchor="end"
                    />
                    <ManufacturerLine
                        manufacturer_timeseries={timeSeries}
                        dateScale={dateScale}
                        yScale={yScale}
                        name='Pfizer'
                        id='Pfizer_rate'
                        color='#00AFF0'
                        label_loc={150}
                    />
                    <Group>
                        <AxisLeft
                            scale={yScale}
                            tickLabelProps={() => ({
                                fill: '#bfbfbf',
                                fontSize: 11,
                                textAnchor: 'start',
                                opacity: 0.7
                            })}
                            tickFormat={d => (d > 0 ? `${d.toLocaleString()}` : '')}
                            numTicks={4}
                            top={-30}
                            //left={20}
                            tickLength={0}
                        />
                        <AxisBottom
                            top={height - 30}
                            scale={dateScale}
                            numTicks={4}
                            tickFormat={d => moment(String(d)).format('MMM')}
                            tickStroke='#bfbfbf'
                            stroke='#bfbfbf'
                            tickLabelProps={() => ({
                                fill: '#bfbfbf',
                                fontSize: 11,
                                textAnchor: 'middle'
                            })}
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
                            numTicks={4}
                        />
                    </Group>
                </Group>
            </svg>
        </div>
    )
}


const Manufacturer = (props) => (
    <div>
        <ParentSize>
            {({ width, height }) => (
                <ManufacturerCurve manufacturer_timeseries={props.manufacturer_timeseries} width={width} height={350} />
            )}
        </ParentSize>
    </div>
)

export default Manufacturer