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
import data from '../gis/data/manufacturer-vaccination-data.json'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { ManufacturerDataProps } from './types'
import { movingAvg } from './util'

function SinopharmCurve(props) {
    var timeSeries = _.filter(data, { manufacturer: 'Sinopharm' })
    const { moving_aves: avgs, timeSeries: timeSeriesWithEmptyDates } = movingAvg(timeSeries, 'doses_administered', 'rate')
    avgs.map((avg, i) => {
        timeSeriesWithEmptyDates[i]['vaccinatedAvg'] = avg
    })
    const x = d => new Date(d['date'])
    const y = d => d['vaccinatedAvg']
    return (
        <Group>
            <Group>
                <LinePath
                    curve={curveBasis}
                    data={timeSeriesWithEmptyDates}
                    x={d => props.dateScale(x(d))}
                    y={d => props.yScale(d['vaccinatedAvg']) - 30}
                    stroke='green'
                    strokeWidth={2}
                />
            </Group>
            <Text
                x={props.dateScale(x(timeSeriesWithEmptyDates[30]))}
                y={props.yScale(y(timeSeriesWithEmptyDates[30])) - 30}
                fill='green'
                dx={-10}
                dy={-8}
                width={150}
                lineHeight={18}
                textAnchor='end'
                fontFamily='Prompt'
                fontSize={12}
            >
                Sinopharm
            </Text>
        </Group>
    )
}

function AstraZenecaCurve(props) {
    var timeSeries = _.filter(data, { manufacturer: 'AstraZeneca' })
    const width = props.width
    const height = props.height
    const { moving_aves: avgs, timeSeries: timeSeriesWithEmptyDates } = movingAvg(timeSeries, 'doses_administered', 'rate')
    avgs.map((avg, i) => {
        timeSeriesWithEmptyDates[i]['vaccinatedAvg'] = avg
    })
    const x = d => new Date(d['date'])
    const y = d => d['vaccinatedAvg']
    return (
        <Group>
            <Group>
                <Text
                    x={props.dateScale(x(timeSeriesWithEmptyDates[100]))}
                    y={props.yScale(y(timeSeriesWithEmptyDates[100])) - 30}
                    fill='#F29F05'
                    dx={-10}
                    dy={0}
                    width={150}
                    lineHeight={18}
                    textAnchor='end'
                    fontFamily='Prompt'
                    fontSize={12}
                >
                    AstraZeneca
                </Text>
                <LinePath
                    curve={curveBasis}
                    data={timeSeriesWithEmptyDates}
                    x={d => props.dateScale(x(d))}
                    y={d => props.yScale(d['vaccinatedAvg']) - 30}
                    stroke='#F29F05'
                    strokeWidth={2}
                />
            </Group>
        </Group>
    )
}

function SinovacCurve(props) {
    var timeSeries = _.filter(data, { manufacturer: 'Sinovac Life Sciences' })
    const width = props.width
    const height = props.height
    const { moving_aves: avgs, timeSeries: timeSeriesWithEmptyDates } = movingAvg(timeSeries, 'doses_administered', 'rate')
    avgs.map((avg, i) => {
        timeSeriesWithEmptyDates[i]['vaccinatedAvg'] = avg
    })
    const x = d => new Date(d['date'])
    const y = d => d['vaccinatedAvg']
    return (
        <Group>
            <Text
                x={props.dateScale(x(timeSeriesWithEmptyDates[85]))}
                y={props.yScale(y(timeSeriesWithEmptyDates[85])) - 30}
                fill='#ff5722'
                dx={0}
                dy={-15}
                width={150}
                lineHeight={18}
                textAnchor='middle'
                fontFamily='Prompt'
                fontSize={12}
            >
                Sinovac
            </Text>
            <LinePath
                curve={curveBasis}
                data={timeSeriesWithEmptyDates}
                x={d => props.dateScale(x(d))}
                y={d => props.yScale(d['vaccinatedAvg']) - 30}
                stroke='#ff5722'
                strokeWidth={2}
            />
        </Group>
    )
}

function ManufacturerCurve(props) {
    var timeSeries: ManufacturerDataProps[] = _.cloneDeep(data)
    const width = props.width
    const height = props.height
    const x = d => new Date(d['date'])
    const y = d => d['vaccinatedAvg']
    const yScale = scaleLinear({
        range: [height, 50],
        domain: [0, 250000],
    })
    const dateScale = scaleTime({
        range: [0, width],
        domain: extent(timeSeries, x),
    })
    return (
        <div className='no-select' style={{ position: 'relative' }}>
            <svg width={width} height={height}>
                <Group>
                    <AstraZenecaCurve dateScale={dateScale} yScale={yScale} width={width} height={height} />
                    <SinovacCurve dateScale={dateScale} yScale={yScale} width={width} height={height} />
                    <SinopharmCurve dateScale={dateScale} yScale={yScale} width={width} height={height} />
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
                <ManufacturerCurve width={width} height={300} />
            )}
        </ParentSize>
    </div>
)

export default Manufacturer