import React, { useEffect } from 'react';
import { extent, max, bisector, min } from 'd3-array'
import _ from 'lodash'
import { Group } from '@visx/group'
import { Bar } from '@visx/shape'
import moment from 'moment'
import { localPoint } from '@visx/event'
import { scaleLinear, scaleBand, scaleTime } from '@visx/scale'
import { useTooltip, Tooltip, defaultStyles, TooltipWithBounds } from '@visx/tooltip'
import { curveStepAfter } from '@visx/curve'
import { LinePath } from '@visx/shape'
import { ParentSize, withParentSize } from '@visx/responsive'
import data from '../../components/gis/data/testing-data.json'
import { AxisBottom } from '@visx/axis'
import { movingAvg } from '../vaccine/util'



function TestingCurve(props) {
    var timeSeries = _.cloneDeep(data)
    const width = props.width
    const height = props.height
    const x = d => new Date(d['date'])
    const y = d => d['tests']

    const { moving_aves: avgs } = movingAvg(timeSeries, 'tests')
    avgs.map((avg, i) => {
        timeSeries[i]['movingAvg'] = avg
    })

    //console.log(timeSeries)
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
                            const barHeight_pos = height - yScale(d['positive'])
                            return (
                                <Group key={i}>
                                    <Bar
                                        x={xScale(x(d))}
                                        y={height - barHeight - 30}
                                        width={xScale.bandwidth()}
                                        height={barHeight}
                                        fill='#7a7a7a'
                                        opacity={0.67}
                                    />
                                    <Bar
                                        x={xScale(x(d))}
                                        y={height - barHeight_pos - 30}
                                        width={xScale.bandwidth()}
                                        height={barHeight_pos}
                                        fill='#dc3545'
                                    />
                                </Group>
                            );
                        })}
                    </Group>

                    {tooltipData &&
                        <Bar
                            opacity={0.6}
                            x={xScale(x(tooltipData))}
                            y={yScale(y(tooltipData)) - 30}
                            width={xScale.bandwidth()}
                            height={height - yScale(y(tooltipData))}
                            fill='#999999'
                        />
                    }
                    <LinePath
                        curve={curveStepAfter}
                        data={timeSeries.slice(7, timeSeries.length)}
                        x={d => xScale(x(d))}
                        y={d => yScale(d['movingAvg']) - 30}
                        stroke='#cfcfcf'
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
                                textAnchor: 'left'
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
                        padding: 12,
                    }}
                >
                    <span>
                        <b>{moment(tooltipData['date']).format('DD MMM')}</b><br />
                        จำนวนการตรวจเชื้อ: {Number(tooltipData['tests']).toLocaleString()} ราย<br />
                        <span className='text-danger'>Positive Rate: {(Number(tooltipData['positive']) * 100 / Number(tooltipData['tests'])).toFixed(1)}%</span>
                    </span>
                </TooltipWithBounds>
            }
        </div>
    )
}

const Container = () => {
    return (
        <div>
            <ParentSize>
                {({ width, height }) => (
                    <TestingCurve width={width} height={280} />
                )}
            </ParentSize>
            <p className='credit text-sec'>ที่มาข้อมูล: กรมวิทยาศาสตร์การแพทย์ กระทรวงสาธารณสุข ตัวเลขการตรวจรายวันหมายถึงจำนวนตัวอย่างที่ได้รับการตรวจ RT-PCR จากห้องปฏิบัติการของรัฐบาลและเอกชน ข้อมูลอัพเดทรายสัปดาห์</p>
        </div>
    )
}


export default Container