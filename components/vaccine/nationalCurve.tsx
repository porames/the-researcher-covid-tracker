import React, { useEffect } from 'react';
import { extent, max, bisector, min } from 'd3-array'
import _, { times } from 'lodash'
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
import { PatternLines } from '@visx/pattern';
import { AxisBottom } from '@visx/axis'
import { movingAvg } from './util'

export function NationalCurve(props) {
    var timeSeries = props.vaccination_timeseries
    const width = props.width
    const height = props.height
    const x = d => new Date(d['date'])
    const y = d => d['total_doses']
    useEffect(() => {
        props.setUpdateDate(timeSeries[timeSeries.length - 1]['date'])
        props.setTodayData(timeSeries[timeSeries.length - 1])
    }, [timeSeries])
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
        domain: [0, Number(max(timeSeries, y))]
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

    const bisectDate = bisector((d: any) => new Date(d.date)).center;
    return (
        <div className='no-select' style={{ position: 'relative' }}>
            <svg width={width} height={height}>
                <Group>
                    <PatternLines
                        id="anomaly_pattern"
                        height={5}
                        width={5}
                        stroke={'#ffd600'}
                        strokeWidth={1}
                        orientation={['diagonal']}
                    />
                    <Group>
                        {timeSeries.map((d, i) => {
                            const barHeight = height - yScale(y(d) - d.second_dose)
                            const fullyVaxHeight = height - yScale(d.second_dose)
                            return (
                                <Group key={i}>
                                    <Bar
                                        x={xScale(x(d))}
                                        y={height - barHeight - fullyVaxHeight - 30}
                                        width={xScale.bandwidth()}
                                        height={barHeight}
                                        fill={timeSeries[i]['daily_vaccinations'] == 0 ? '#bdd5cd' : '#9dbbb2'}
                                    />
                                    <Bar
                                        x={xScale(x(d))}
                                        y={height - fullyVaxHeight - 30}
                                        width={xScale.bandwidth()}
                                        height={fullyVaxHeight}
                                        fill={timeSeries[i]['daily_vaccinations'] == 0 ? '#bdd5cd' : '#47816e'}
                                    />
                                    {(timeSeries[i]['data_anomaly'] || timeSeries[i]['daily_vaccinations'] == 0) &&
                                        <Bar
                                            fill="url('#anomaly_pattern')"
                                            x={xScale(x(d))}
                                            y={height - barHeight - fullyVaxHeight - 30}
                                            width={xScale.bandwidth()}
                                            height={barHeight + fullyVaxHeight}
                                        />
                                    }
                                </Group>
                            );
                        })}
                    </Group>
                    {tooltipData &&
                        <Bar
                            x={xScale(x(tooltipData))}
                            y={yScale(y(tooltipData)) - 30}
                            width={xScale.bandwidth()}
                            height={height - yScale(y(tooltipData))}
                            fill='#7ea297'
                            opacity='0.6'
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
                            maxWidth: 250
                        }}
                    >
                        <span>
                            <b>{moment(tooltipData['date']).format('DD MMM')}</b><br />
                            ฉีดวัคซีนสะสม {tooltipData['total_doses'].toLocaleString()} โดส<br />
                            ได้รับวัคซีนครบแล้ว {tooltipData['second_dose'].toLocaleString()} คน<br />
                            {tooltipData['daily_vaccinations'] == 0 &&
                                <div className='text-danger mt-1 credit'><b>*วันที่ไม่มีรายงานข้อมูล</b></div>
                            }
                            {tooltipData['data_anomaly'] &&
                                <div className='text-danger mt-1 credit'><b>*{tooltipData['data_anomaly']}</b></div>
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
                <NationalCurve vaccination_timeseries={props.vaccination_timeseries} setTodayData={props.setTodayData} setUpdateDate={props.setUpdateDate} width={width} height={300} />
            )}
        </ParentSize>
    </div>
)