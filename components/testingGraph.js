import React, { useEffect } from 'react';
import { extent, max, bisector, min } from 'd3-array'
import _ from 'lodash'
import { Group } from '@visx/group'
import { Bar } from '@visx/shape'
import moment from 'moment'
import { localPoint } from '@visx/event'
import { scaleLinear, scaleBand, scaleTime } from '@visx/scale'
import { useTooltip, Tooltip, defaultStyles, } from '@visx/tooltip'
import { curveBasis } from '@visx/curve'
import { LinePath } from '@visx/shape'
import { ParentSize, withParentSize } from '@visx/responsive'
const data = require('../components/gis/data/testing-data.json')
import { AxisBottom } from '@visx/axis'
import { Label, Connector, CircleSubject, LineSubject, Annotation } from '@visx/annotation'


function movingAvg(ts) {
    var moving_aves = []
    var ys = []
    for (var i = 0; i < ts.length; i++) {
        ys.push(ts[i]['tests'])
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

function TestingCurve(props) {
    var timeSeries = data
    const width = props.width
    const height = props.height
    const x = d => new Date(d['date'])
    const y = d => d['tests']
    const avgs = movingAvg(timeSeries)
    avgs.map((avg, i) => {
        timeSeries[i]['movingAvg'] = avg
    })
    const xScale = scaleBand({
        range: [20, width - 20],
        domain: timeSeries.map(x),
        padding: 0.07
    })
    const dateScale = scaleTime({
        range: [20, width - 20],
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
                        <Annotation
                            x={xScale(x(timeSeries[300]))}
                            y={yScale(timeSeries[300]['tests']) - 30}
                            dx={-40}
                            dy={0}
                            width={100}
                            height={200}
                        >
                            <Connector stroke='#e0e0e0' type='line' />
                            <Label
                                className='text-center'
                                title='จำนวนการตรวจเชื้อ'
                                fontColor='#e0e0e0'
                                horizontalAnchor='end'
                                backgroundFill="transparent"
                                backgroundPadding={0}
                                titleFontWeight={600}
                                labelAnchor='middle'
                                width={108}
                                titleFontSize={12}
                            />
                        </Annotation>
                        <Annotation
                            x={xScale(x(timeSeries[130]))}
                            y={yScale(timeSeries[130]['movingAvg']) - 30}
                            dx={0}
                            dy={-40}
                            width={200}
                            height={200}
                        >
                            <Connector stroke='#e0e0e0' type='line' />
                            <Label
                                className='text-center'
                                title='ค่าเฉลี่ย 7 วัน'
                                fontColor='#e0e0e0'
                                horizontalAnchor='middle'
                                backgroundFill="transparent"
                                backgroundPadding={0}
                                titleFontWeight={600}
                                labelAnchor='middle'
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
                                    fill='#cfcfcf'
                                />

                            );
                        })}
                    </Group>

                    <LinePath
                        curve={curveBasis}
                        data={timeSeries}
                        x={d => xScale(x(d))}
                        y={d => yScale(d['movingAvg']) - 30}
                        stroke='#7a7a7a'
                        strokeWidth={2}
                    />

                    {tooltipData &&
                        <Bar
                            x={xScale(x(tooltipData))}
                            y={yScale(y(tooltipData)) - 30}
                            width={xScale.bandwidth()}
                            height={height - yScale(y(tooltipData))}
                            fill='#999999'
                        />
                    }

                    <Group>
                        <AxisBottom
                            top={height - 30}
                            scale={dateScale}
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

            {tooltipData &&
                <Tooltip
                    top={tooltipTop}
                    left={tooltipLeft}
                    style={{
                        ...defaultStyles,
                        minWidth: 160,
                        textAlign: 'start',
                        transform: 'translate(-50%, -50%)',
                        padding: 12,
                    }}
                >
                    <span>
                        <b>{moment(tooltipData['date']).format('DD MMM')}</b><br />
                    จำนวนการตรวจเชื้อ {Number(tooltipData['tests']).toLocaleString()} ราย
                </span>
                </Tooltip>
            }
        </div>
    )
}

const Container = () => (
    <ParentSize>
        {({ width, height }) => (
            <TestingCurve width={width} height={300} />
        )}
    </ParentSize>
)

export default Container