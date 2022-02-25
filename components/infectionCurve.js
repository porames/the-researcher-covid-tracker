import React, { useState, useRef, useCallback, useMemo } from 'react';
import { extent, max, bisector, min } from 'd3-array'
import _ from 'lodash'
import moment from 'moment'
import { Group } from '@visx/group'
import { Bar } from '@visx/shape'
import { localPoint } from '@visx/event'
import { scaleLinear, scaleBand, scaleTime } from '@visx/scale'
import { useTooltip, Tooltip, defaultStyles, TooltipWithBounds } from '@visx/tooltip'
import { curveBasis } from '@visx/curve'
import { LinePath } from '@visx/shape'
import { ParentSize, withParentSize } from '@visx/responsive'
import { AxisBottom } from '@visx/axis'
import { Label, Connector, Annotation } from '@visx/annotation'
import { movingAvg } from './vaccine/util'

function NationalCurve(props) {
    console.log('rerendered')
    const timeSeries = props.national_stats
    const width = props.width
    const height = props.height
    const x = useCallback(d => new Date(d['date']), [])
    const y = useCallback(d => d['new_cases'], [])
    const calculatedTimeSeries = useMemo(
      () => {
        const { moving_aves: avgs, timeSeries: innerTimeSeries } = movingAvg([...timeSeries], 'new_cases', 'rate')
        avgs.forEach((avg, i) => {
          innerTimeSeries[i]['movingAvg'] = avg
        })
        return innerTimeSeries
      },
      [timeSeries]
    )
    const xScale = useMemo(() => scaleBand({
        range: [0, width],
        domain: calculatedTimeSeries.map(x),
        padding: 0.07
    }), [width, calculatedTimeSeries, x])
    const dateScale = useMemo(() => scaleTime({
        range: [0, width],
        domain: extent(calculatedTimeSeries, x),
        padding: 0.07
    }), [width, calculatedTimeSeries, x])
    const yScale = useMemo(() => scaleLinear({
        range: [height, 50],
        domain: [0, max(calculatedTimeSeries, y)],
    }), [height, calculatedTimeSeries, y])
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
        <div className='no-select' style={{ position: 'relative' }}>
            <svg width={width} height={height}>
                <Group>
                    <Group>
                        <Annotation
                            x={xScale(x(calculatedTimeSeries[132]))}
                            y={yScale(calculatedTimeSeries[132]['new_cases']) - 30}
                            dx={-40}
                            dy={0}
                            width={100}
                            height={200}
                        >
                            <Connector stroke='#e0e0e0' type='line' />
                            <Label
                                className='text-center'
                                title='ผู้ป่วยใหม่รายวัน'
                                fontColor='#e0e0e0'
                                horizontalAnchor='end'
                                backgroundFill="transparent"
                                backgroundPadding={0}
                                titleFontWeight={600}
                                labelAnchor='middle'
                                width={90}
                                titleFontSize={12}
                            />
                        </Annotation>
                        <Annotation
                            x={xScale(x(calculatedTimeSeries[30]))}
                            y={yScale(calculatedTimeSeries[30]['movingAvg']) - 30}
                            dx={0}
                            dy={-40}
                            width={200}
                            height={200}
                        >
                            <Connector stroke='#e0e0e0' type='line' />
                            <Label
                                title='ค่าเฉลี่ย 7 วัน'
                                fontColor='#e0e0e0'
                                backgroundFill="transparent"
                                backgroundPadding={0}
                                titleFontWeight={600}
                                titleFontSize={12}
                            />
                        </Annotation>
                    </Group>

                    <Group>
                        {useMemo(() => calculatedTimeSeries.map((d, i) => {
                            const pcrHeight = height - yScale(y(d))
                            const atkHeight = height - yScale(d["new_atk_cases"])
                            return (
                                <Group key={i}>

                                    <Bar
                                        x={xScale(x(d))}
                                        y={height - pcrHeight - 30}
                                        width={xScale.bandwidth()}
                                        height={pcrHeight}
                                        fill='#fa9ba4'
                                    />
                                    <Bar
                                        x={xScale(x(d))}
                                        y={height - atkHeight - pcrHeight - 30}
                                        width={xScale.bandwidth()}
                                        height={atkHeight}
                                        opacity={0.6}
                                        fill='red'
                                    />
                                </Group>

                            );
                        }), [calculatedTimeSeries, xScale, x, yScale, y, height])}
                    </Group>

                    {tooltipData &&
                        <Bar
                            x={xScale(x(tooltipData))}
                            y={yScale(y(tooltipData)) - 30}
                            width={xScale.bandwidth()}
                            height={height - yScale(y(tooltipData))}
                            fill='#ff5e6f'
                        />
                    }
                    <LinePath
                        curve={curveBasis}
                        data={calculatedTimeSeries}
                        x={d => xScale(x(d))}
                        y={d => yScale(d['movingAvg']) - 30}
                        stroke='#cf1111'
                        strokeWidth={2}
                    />
                    <Group>
                        <AxisBottom
                            top={height - 30}
                            scale={dateScale}
                            tickFormat={d => moment(d).format('MMM')}
                            numTicks={width < 500 ? 6 : 12}
                            tickStroke='#bfbfbf'
                            stroke='#bfbfbf'
                            tickLabelProps={() => ({
                                fill: '#bfbfbf',
                                fontSize: 11,
                                textAnchor: 'start'
                            })}
                        />
                        <Bar
                            onMouseMove={(e) => {
                                const x = localPoint(e)['x']
                                if (x) {
                                    const x0 = dateScale.invert(x)
                                    const index = bisectDate(calculatedTimeSeries, x0, 1)
                                    const d = calculatedTimeSeries[index]
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
                            width={width}
                            height={height - 30}
                            fill="transparent"
                        />
                    </Group>
                </Group>
            </svg>

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
                        ผู้ติดยืนยัน {tooltipData['new_cases'].toLocaleString()} ราย<br />
                        รายงานติดเชื้อจาก ATK {tooltipData['new_atk_cases'] ? tooltipData['new_atk_cases'].toLocaleString() : 0} ราย
                    </span>
                </TooltipWithBounds>
            }
        </div>
    )
}

const Container = (props) => 
    <ParentSize>
        {useCallback(({ width, height }) => (
            <NationalCurve national_stats={props.national_stats} width={width} height={300} />
        ), [])}
    </ParentSize>

export default Container