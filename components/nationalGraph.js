import React, { useState, useRef } from 'react';
import { extent, max, bisector, min } from 'd3-array'
import _ from 'lodash'
import { Group } from '@visx/group'
import { Bar } from '@visx/shape'
import moment from 'moment'
import { localPoint } from '@visx/event'
import { scaleLinear, scaleBand, scaleTime } from '@visx/scale'
import { useTooltip, Tooltip, defaultStyles, TooltipWithBounds } from '@visx/tooltip'
import { curveBasis } from '@visx/curve'
import { LinePath } from '@visx/shape'
import { ParentSize, withParentSize } from '@visx/responsive'
import data from './gis/data/national-timeseries.json'
import { AxisBottom } from '@visx/axis'
import { Brush } from '@visx/brush'
import BaseBrush, { BaseBrushState, UpdateBrush } from '@visx/brush/lib/BaseBrush'
import { Label, Connector, CircleSubject, LineSubject, Annotation } from '@visx/annotation'


function movingAvg(ts) {
    var moving_aves = []
    var ys = []
    for (var i = 0; i < ts.length; i++) {
        ys.push(ts[i]['NewConfirmed'])
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
    var timeSeries = data['Data']
    const width = props.width
    const height = props.height
    const x = d => new Date(d['Date'])
    const y = d => d['NewConfirmed']
    const avgs = movingAvg(timeSeries)
    avgs.map((avg, i) => {
        timeSeries[i]['movingAvg'] = avg
    })

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
    const bisectDate = bisector(d => new Date(d['Date'])).left;
    return (
        <div className='no-select' style={{ position: 'relative' }}>
            <svg width={width} height={height}>
                <Group>

                    <Group>
                        <Annotation
                            x={xScale(x(timeSeries[290]))}
                            y={yScale(timeSeries[290]['NewConfirmed']) - 30}
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
                            x={xScale(x(timeSeries[169]))}
                            y={yScale(timeSeries[169]['movingAvg']) - 30}
                            dx={0}
                            dy={-40}
                            width={200}
                            height={200}
                        >
                            <Connector stroke='#e0e0e0' type='line' />
                            <Label
                                title='ค่าเฉลี่ย 7 วัน'
                                fontColor='#e0e0e0'
                                horizontalAnchor='start'
                                backgroundFill="transparent"
                                backgroundPadding={0}
                                titleFontWeight={600}
                                labelAnchor='start'
                                titleFontSize={12}
                            />
                        </Annotation>
                    </Group>

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
                                    fill='#fa9ba4'
                                />

                            );
                        })}
                    </Group>

                    <LinePath
                        curve={curveBasis}
                        data={timeSeries}
                        x={d => xScale(x(d))}
                        y={d => yScale(d['movingAvg']) - 30}
                        stroke='#cf1111'
                        strokeWidth={2}
                    />

                    {tooltipData &&
                        <Bar
                            x={xScale(x(tooltipData))}
                            y={yScale(y(tooltipData)) - 30}
                            width={xScale.bandwidth()}
                            height={height - yScale(y(tooltipData))}
                            fill='#ff5e6f'
                        />
                    }

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
                        <b>{moment(tooltipData['Date']).format('DD MMM')}</b><br />
                    ผู้ติดเชื้อใหม่ {tooltipData['NewConfirmed'].toLocaleString()} ราย
                </span>
                </TooltipWithBounds>
            }
        </div>
    )
}

const Container = () => (
    <ParentSize>
        {({ width, height }) => (
            <NationalCurve width={width} height={300} />
        )}
    </ParentSize>
)

export default Container