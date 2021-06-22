import React, { useEffect } from 'react';
import { extent, max, bisector, min } from 'd3-array'
import _ from 'lodash'
import { Group } from '@visx/group'
import { Bar } from '@visx/shape'
import moment from 'moment'
import 'moment/locale/th'
import { localPoint } from '@visx/event'
import { scaleLinear, scaleBand, scaleTime } from '@visx/scale'
import { useTooltip, Tooltip, defaultStyles, TooltipWithBounds } from '@visx/tooltip'
import { curveBasis } from '@visx/curve'
import { LinePath } from '@visx/shape'
import { ParentSize, withParentSize } from '@visx/responsive'
import data from '../gis/data/national-vaccination-timeseries.json'
import { AxisBottom } from '@visx/axis'
import { movingAvg } from './util'

export function NationalCurve(props) {
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
        props.setTodayData(timeSeries[timeSeries.length - 1])
    }, [])


    const xScale = scaleBand({
        range: [0, width],
        domain: timeSeries.map(x),
        padding: 0.07
    })
    const dateScale = scaleTime({
        range: [0, width],
        domain: extent(timeSeries, x)
    })
    const yScale = scaleLinear({
        range: [height, 50],
        domain: [0, max(timeSeries, y)]
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

    const bisectDate = bisector(d => new Date(d.date)).center;
    return (
        <div className='no-select' style={{ position: 'relative' }}>
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
                                    fill={timeSeries[i]['missing_data'] ? '#bdd5cd' : '#9dbbb2'}
                                />

                            );
                        })}
                    </Group>
                    <LinePath
                        curve={curveBasis}
                        data={timeSeries}
                        x={d => xScale(x(d))}
                        y={d => yScale(d["vaccinatedAvg"]) - 30}
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
                            tickFormat={d => moment(String(d)).format('MMM')}
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
                            width={width}
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
                            {tooltipData['missing_data'] &&
                                <div className='text-danger mt-1 credit'><b>*วันที่ไม่มีรายงานข้อมูล</b></div>
                            }
                        </span>
                    </TooltipWithBounds>
                }
            </div>
        </div>
    )
}


export const National = (props) => (
    <div>
        <ParentSize>
            {({ width, height }) => (
                <NationalCurve setTodayData={props.setTodayData} setUpdateDate={props.setUpdateDate} width={width} height={300} />
            )}
        </ParentSize>
    </div>
)