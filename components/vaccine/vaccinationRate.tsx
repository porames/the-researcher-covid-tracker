import React, { useEffect, useState } from 'react';
import { extent, max, bisector } from 'd3-array'
import _ from 'lodash'
import { Group } from '@visx/group'
import { GridRows, GridColumns } from '@visx/grid'
import { Bar, Line } from '@visx/shape'
import moment from 'moment'
import 'moment/locale/th'
import { localPoint } from '@visx/event'
import { scaleLinear, scaleBand, scaleTime } from '@visx/scale'
import { useTooltip, Tooltip, defaultStyles, TooltipWithBounds } from '@visx/tooltip'
import { curveStepAfter } from '@visx/curve'
import { LinePath, SplitLinePath } from '@visx/shape'
import { ParentSize, withParentSize } from '@visx/responsive'
import { Text } from '@visx/text'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { filter, timeDays } from 'd3';

function movingAvg(ts, id) {
    var moving_aves: number[] = []
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

function Curve(props) {
    const { width, height } = props
    const data = props.vaccination_timeseries
    var vaxRate = data.filter((items) => {
        return new Date(items.date) >= new Date('2021-04-01');
    })
    const x = d => new Date(d['date'])
    const y = d => d["daily_vaccinations"]
    const xScale = scaleBand({
        range: [0, width],
        domain: vaxRate.map(x),
        padding: 0.07
    })
    const dateScale = scaleTime({
        range: [0, width],
        domain: extent(vaxRate, x)
    })
    const yScale = scaleLinear({
        range: [height, 50],
        domain: [0, props.estimation["required_rate"] > max(vaxRate, y) ? props.estimation["required_rate"] : max(vaxRate, y)],
    })
    var avgs = movingAvg(vaxRate, "daily_vaccinations")
    avgs.map((avg, i) => {
        vaxRate[i]['moving_avg'] = avg
    })
    useEffect(() => {
        props.setTodayRate(vaxRate[vaxRate.length - 1])
    }, [])
    const {
        showTooltip,
        hideTooltip,
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
                    <Group>
                        {vaxRate.map((d, i) => {
                            const barHeight = height - yScale(y(d))
                            return (
                                <Bar
                                    key={i}
                                    x={xScale(x(d))}
                                    y={height - barHeight - 30}
                                    width={xScale.bandwidth()}
                                    height={barHeight}
                                    fill={'#427165'}
                                    opacity={0.67}
                                />

                            );
                        })}
                    </Group>
                    <Group>
                        {tooltipData &&
                            <Bar
                                x={xScale(x(tooltipData))}
                                y={yScale(y(tooltipData)) - 30}
                                width={xScale.bandwidth()}
                                height={height - yScale(y(tooltipData))}
                                fill='#7ea297'
                                opacity={0.7}
                            />
                        }
                        <LinePath
                            curve={curveStepAfter}
                            data={vaxRate.slice(7, vaxRate.length)}
                            x={d => xScale(x(d))}
                            y={d => (yScale(d["moving_avg"]) - 30)}
                            stroke='#9dbbb2'
                            strokeWidth={2}
                        />
                        <circle
                            cx={xScale(x(vaxRate[vaxRate.length - 1]))}
                            cy={yScale(vaxRate[vaxRate.length - 1]["moving_avg"]) - 33}
                            r={4}
                            fill='#9dbbb2'
                        />
                    </Group>
                    <Bar
                        onMouseMove={(e) => {
                            const x = localPoint(e)['x']
                            if (x) {
                                const x0 = dateScale.invert(x)
                                const index = bisectDate(vaxRate, x0, 1)
                                const d = vaxRate[index]
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
                {props.estimation &&
                    <Group>
                        <Text
                            x={width - (width < 500 ? 40 : 60)}
                            y={yScale(parseInt(props.estimation["required_rate"])) - 30}
                            fill='#bdbdbd'
                            dx={-10}
                            dy={22}
                            width={200}
                            lineHeight={18}
                            textAnchor="end"
                            fontFamily="Sarabun"
                            fontWeight="bold"
                            fontSize={12}
                        >
                            {`เพื่อให้ตามเป้าหมาย ต่อไปนี้ต้องฉีดวัคซีนให้ได้ ${parseInt(props.estimation["required_rate"]).toLocaleString()} โดส/วัน`}
                        </Text>
                        <Line
                            from={{
                                x: width - (width < 500 ? 40 : 60),
                                y: yScale(parseInt(props.estimation["required_rate"])) - 30
                            }}
                            to={{
                                x: width,
                                y: yScale(parseInt(props.estimation["required_rate"])) - 30
                            }}
                            fill="white"
                            stroke="#bfbfbf"
                            strokeWidth={2}
                            strokeDasharray="3,4"
                        />
                    </Group>
                }
                <Group>
                    <GridRows
                        scale={yScale}
                        width={width}
                        top={-30}
                        left={0}
                        strokeDasharray="1,5"
                        stroke={"#fff"}
                        strokeOpacity={0.3}
                        pointerEvents="none"
                        numTicks={4}
                    />
                    <AxisLeft
                        scale={yScale}
                        tickLabelProps={() => ({
                            fill: "#bfbfbf",
                            fontSize: 11,
                            textAnchor: "start",
                            opacity: 0.7
                        })}
                        tickFormat={d => d > 0 ? d.toLocaleString() : ""}

                        numTicks={4}
                        top={-35}
                        left={0}
                        tickLength={0}
                    />
                    <AxisBottom
                        numTicks={3}
                        top={height - 30}
                        scale={dateScale}
                        tickFormat={d => moment(String(d)).format('MMM')}
                        tickStroke='#bfbfbf'
                        stroke='#bfbfbf'
                        tickLabelProps={() => ({
                            fill: '#bfbfbf',
                            fontSize: 11,
                            textAnchor: 'start'
                        })}
                    />
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
                            ฉีดวัคซีนไป {tooltipData['daily_vaccinations'].toLocaleString()} โดส<br />
                            {tooltipData["moving_avg"] ? `ค่าเฉลี่ย 7 วัน ${Math.floor(tooltipData["moving_avg"]).toLocaleString()} โดส` : ""}
                        </span>
                    </TooltipWithBounds>
                }
            </div>
        </div>
    )

}

const VaccinationRate = (props) => {
    const [todayRate, setTodayRate] = useState(undefined)
    const [percentage, setPercentage] = useState(undefined)
    useEffect(() => {
        if (todayRate) {
            const percent = 100 - Math.ceil((todayRate["moving_avg"] / props.estimation["required_rate"]) * 100)
            setPercentage(percent)
        }
    }, [todayRate])
    return (
        <div>
            {props.estimation &&
                <div>
                    <ParentSize>
                        {({ width, height }) => (
                            <Curve vaccination_timeseries={props.vaccination_timeseries} setTodayRate={setTodayRate} estimation={props.estimation} width={width} height={350} />
                        )}
                    </ParentSize>
                    {todayRate &&
                        <div>ค่าเฉลี่ย 7 วันอยู่ที่ {Math.ceil(todayRate["moving_avg"]).toLocaleString()} โดส/วัน ซึ่งต่ำกว่าความเร็วเป้าหมายเพื่อให้ครบประชากร 50 ล้านคน (100 ล้านโดส) ภายในสิ้นปีอยู่ {percentage} %</div>
                    }
                </div>
            }


        </div>
    )
}
export default VaccinationRate