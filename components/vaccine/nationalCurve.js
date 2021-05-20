import React, { useState, useRef, useEffect } from 'react';
import { extent, max, bisector, min } from 'd3-array'
import _ from 'lodash'
import { Group } from '@visx/group'
import { GridRows, GridColumns } from '@visx/grid'
import { Bar } from '@visx/shape'
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
import { Label, Connector, CircleSubject, LineSubject, Annotation } from '@visx/annotation'


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
function NationalCurve(props) {
    var timeSeries = data
    const width = props.width
    const height = props.height
    const x = d => new Date(d['date'])
    const y = d => d['total_doses']
    const avgs = movingAvg(timeSeries, 'total_doses')
    avgs.map((avg, i) => {
        timeSeries[i]['vaccinatedAvg'] = avg
    })
    const deltaAvgs = movingAvg(timeSeries, 'daily_vaccinations')
    deltaAvgs.map((avg, i) => {
        timeSeries[i]['deltaAvg'] = avg
    })
    useEffect(() => {
        props.setUpdateDate(timeSeries[timeSeries.length - 1]['date'])
    }, [])


    const xScale = scaleBand({
        range: [0, width],
        domain: timeSeries.map(x),
        padding: 0.07
    })
    const dateScale = scaleTime({
        range: [0, width],
        domain: extent(timeSeries, x),
        padding: 0.07
    })
    const yScale = scaleLinear({
        range: [height, 50],
        domain: [0, max(timeSeries, y)],
    })

    const {
        showTooltip,
        hideTooltip,
        tooltipOpen,
        tooltipData,
        tooltipLeft = 0,
        tooltipTop = 0,
    } = useTooltip({
        tooltipOpen: true,
        tooltipData: null,
    });
    const bisectDate = bisector(d => new Date(d['date'])).left;
    return (
        <div style={{ position: 'relative' }}>
            <svg width={width} height={height}>
                <Group>
                    <Group>
                        {timeSeries.map((d, i) => {
                            const barHeight = height - yScale(y(d))
                            return (
                                <Bar
                                    key={i}
                                    x={xScale(x(d))}
                                    y={height - barHeight - 30}
                                    width={xScale.bandwidth()}
                                    height={barHeight}
                                    fill='#9dbbb2'
                                />

                            );
                        })}
                    </Group>
                    <LinePath
                        curve={curveBasis}
                        data={timeSeries}
                        x={d => xScale(x(d))}
                        y={d => yScale(d['vaccinatedAvg']) - 30}
                        stroke='#427165'
                        strokeWidth={2}
                    />

                    {tooltipData &&
                        <Bar
                            x={xScale(x(tooltipData))}
                            y={yScale(y(tooltipData)) - 30}
                            width={xScale.bandwidth()}
                            height={height - yScale(y(tooltipData))}
                            fill='#7ea297'
                        />
                    }

                    <Group>
                        <AxisBottom
                            top={height - 30}
                            scale={dateScale}
                            numTicks={4}
                            tickFormat={d => moment(d).format('MMM')}
                            tickStroke='#bfbfbf'
                            stroke='#bfbfbf'
                            tickLabelProps={() => ({
                                fill: '#bfbfbf',
                                fontSize: 11,
                                textAnchor: 'middle'
                            })}
                        />
                        <Bar
                            onMouseMove={(e) => {
                                const x = localPoint(e)['x']
                                if (x) {
                                    const x0 = dateScale.invert(x)
                                    const index = bisectDate(timeSeries, x0, 1)
                                    const d = timeSeries[index]
                                    if (d) {
                                        const barHeight = (height - yScale(y(d)) ?? 0)
                                        showTooltip({
                                            tooltipData: d,
                                            tooltipLeft: x,
                                            tooltipTop: height - barHeight - 100
                                        })
                                    }
                                }
                            }}
                            onMouseLeave={() => hideTooltip()}
                            x={10}
                            y={0}
                            width={width - 20}
                            height={height - 30}
                            fill="transparent"
                        />
                    </Group>
                </Group>
            </svg>
            <div>
                {tooltipData &&
                    <TooltipWithBounds
                        top={tooltipTop}
                        left={tooltipLeft}
                        style={{
                            ...defaultStyles,
                            minWidth: 160,
                            textAlign: 'start',
                            padding: 12,
                        }}
                    >
                        <span>
                            <b>{moment(tooltipData['date']).format('DD MMM')}</b><br />
                    ฉีดวัคซีนสะสม {tooltipData['total_doses'].toLocaleString()} โดส
                </span>
                    </TooltipWithBounds>
                }
            </div>
        </div>
    )
}

function generateExtension(ts) {
    const delta = ts[ts.length - 1]['deltaAvg']
    const startDate = moment(ts[ts.length - 1]['date'])
    const initVaccinated = ts[ts.length - 1]['total_doses']
    var predictions = []
    var i = 0
    var predict = 0
    while (predict < 66186727) {
        predict = parseInt(initVaccinated + (delta * i))
        predictions.push({
            vaccinatedAvg: predict,
            date: startDate.add(1, 'd').format('YYYY-MM-DD'),
            estimation: true,
            deltaAvg: delta
        })
        i += 1
    }
    return predictions
}
const EstimateCurve = (props) => {
    const population = 66186727
    const { width, height } = props
    const timeSeries = data
    const extension = generateExtension(timeSeries)
    const dividedData = [timeSeries, extension]
    const merged = [...timeSeries, ...extension]
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

export const National = (props) => (
    <div>
        <ParentSize>
            {({ width, height }) => (
                <NationalCurve setUpdateDate={props.setUpdateDate} width={width} height={300} />
            )}
        </ParentSize>
    </div>
)

export const Estimate = (props) => (
    <div>
        <ParentSize>
            {({ width, height }) => (
                <EstimateCurve setEstimation={props.setEstimation} width={width} height={300} />
            )}
        </ParentSize>
    </div>
)
