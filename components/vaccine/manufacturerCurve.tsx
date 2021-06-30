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

function SinopharmCurve(props) {
    var timeSeries = _.filter(data, { manufacturer: 'Sinopharm' })
    const width = props.width
    const height = props.height
    const avgs = movingAvg(timeSeries, 'doses_administered')

    avgs.map((avg, i) => {
        timeSeries[i]['vaccinatedAvg'] = avg
    })
    console.log(timeSeries)
    const x = d => new Date(d['date'])
    const y = d => d['vaccinatedAvg']
    const xScale = scaleBand({
        range: [0, width],
        domain: timeSeries.map(x),
        padding: 0.07
    })
    const yScale = scaleLinear({
        range: [height, 50],
        domain: [0, max(data, y)],
    })
    return (
        <Group>
            <Group>
                <LinePath
                    curve={curveBasis}
                    data={timeSeries}
                    x={d => xScale(x(d))}
                    y={d => yScale(d['vaccinatedAvg']) - 30}
                    stroke='green'
                    strokeWidth={2}
                />
            </Group>
            <LinePath
                curve={curveBasis}
                data={timeSeries}
                x={d => xScale(x(d))}
                y={d => yScale(d['vaccinatedAvg']) - 30}
                stroke='green'
                strokeWidth={2}
            />
        </Group>
    )
}

function AstraZenecaCurve(props) {
    var timeSeries = _.filter(data, { manufacturer: 'AstraZeneca' })
    const width = props.width
    const height = props.height
    const avgs = movingAvg(timeSeries, 'doses_administered')
    avgs.map((avg, i) => {
        timeSeries[i]['vaccinatedAvg'] = avg
    })
    const x = d => new Date(d['date'])
    const y = d => d['vaccinatedAvg']
    const xScale = scaleBand({
        range: [0, width],
        domain: timeSeries.map(x),
        padding: 0.07
    })
    const yScale = scaleLinear({
        range: [height, 50],
        domain: [0, max(data, y)],
    })
    return (
        <Group>
            <Group>
                <Text
                    x={xScale(x(timeSeries[88]))}
                    y={yScale(y(timeSeries[88])) - 30}
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
                    data={timeSeries}
                    x={d => xScale(x(d))}
                    y={d => yScale(d['vaccinatedAvg']) - 30}
                    stroke='#F29F05'
                    strokeWidth={2}
                />
            </Group>
            <LinePath
                curve={curveBasis}
                data={timeSeries}
                x={d => xScale(x(d))}
                y={d => yScale(d['vaccinatedAvg']) - 30}
                stroke='#F29F05'
                strokeWidth={2}
            />
        </Group>
    )
}

function SinovacCurve(props) {
    var timeSeries = _.filter(data, { manufacturer: 'Sinovac Life Sciences' })
    const width = props.width
    const height = props.height
    const avgs = movingAvg(timeSeries, 'doses_administered')
    avgs.map((avg, i) => {
        timeSeries[i]['vaccinatedAvg'] = avg
    })
    const x = d => new Date(d['date'])
    const y = d => d['vaccinatedAvg']
    const xScale = scaleBand({
        range: [0, width],
        domain: timeSeries.map(x),
        padding: 0.07
    })
    const yScale = scaleLinear({
        range: [height, 50],
        domain: [0, max(data, y)],
    })
    return (
        <Group>
            <Text
                x={xScale(x(timeSeries[85]))}
                y={yScale(y(timeSeries[85])) - 30}
                fill='#ff5722'
                dx={0}
                dy={-20}
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
                data={timeSeries}
                x={d => xScale(x(d))}
                y={d => yScale(d['vaccinatedAvg']) - 30}
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
        domain: [0, max(data, y)],
    })
    const dateScale = scaleTime({
        range: [0, width],
        domain: extent(timeSeries, x),
    })
    return (
        <div className='no-select' style={{ position: 'relative' }}>
            <svg width={width} height={height}>
                <Group>
                    <AstraZenecaCurve width={width} height={height} />
                    <SinovacCurve width={width} height={height} />
                    {/*<SinopharmCurve width={width} height={height} />*/}
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