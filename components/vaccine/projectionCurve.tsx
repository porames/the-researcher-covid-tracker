import React, { useEffect } from 'react';
import { extent, max } from 'd3-array'
import _ from 'lodash'
import { Group } from '@visx/group'
import { GridRows } from '@visx/grid'
import moment from 'moment'
import 'moment/locale/th'
import { scaleLinear, scaleBand, scaleTime } from '@visx/scale'
import { curveBasis } from '@visx/curve'
import { LinePath, SplitLinePath } from '@visx/shape'
import { ParentSize } from '@visx/responsive'
import data from '../gis/data/national-vaccination-timeseries.json'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { Text } from '@visx/text'
import { NationalVaccinationDataProps } from './types'
import { movingAvg } from './util'

const population = 66186727 * 2 //doses roequired to cover all population (children included)

interface PredictionProps {
    vaccinatedAvg?: number;
    date: string;
    estimation: boolean;
    deltaAvg?: number;
    total_doses: number;
    first_dose?: number;
    firstDoseAvg?: number;
}

function generateExtension(ts: PredictionProps[]) {
    const delta = Math.floor(ts[ts.length - 1]['deltaAvg']) //latest 7-day average vaccination rate
    const startDate = moment(ts[ts.length - 1]['date'])
    const initVaccinated: number = ts[ts.length - 1]['total_doses']
    var predictions: PredictionProps[] = []
    var i = 0
    var predict = 0
    var m50_date = 0
    while (predict < population) {
        predict = initVaccinated + (delta * i)
        if (predict < 50 * 1000 * 1000 * 2) {
            m50_date += 1
        }
        predictions.push({
            vaccinatedAvg: predict,
            total_doses: predict,
            date: startDate.add(1, 'd').format('YYYY-MM-DD'),
            estimation: true,
            deltaAvg: delta
        })
        i += 1
    }
    return { predictions: predictions, m50_date: m50_date }
}


function plannedRollout(ts: PredictionProps[]) {
    const startDate = moment(ts[ts.length - 1]['date'])
    const startDate_120 = moment(ts[ts.length - 1]['date'])
    const goalDate = moment('2021-12-31')
    const eta = goalDate.diff(startDate, 'days')
    const initVaccinated = ts[ts.length - 1]['total_doses']
    const requiredRate = ((50 * 1000 * 1000 * 2) - initVaccinated) / eta
    var planned: PredictionProps[] = []
    var planned_120: PredictionProps[] = []
    var i = 0
    var predict = 0
    var predict_120 = 0
    var m50_date = 0
    var m50_date_120 = 0

    while (predict < population) {
        predict = Math.floor(initVaccinated + (requiredRate * i))
        if (predict < 50 * 1000 * 1000 * 2) {
            m50_date += 1
        }
        planned.push({
            vaccinatedAvg: predict,
            total_doses: predict,
            date: startDate.add(1, 'd').format('YYYY-MM-DD'),
            estimation: true,
            deltaAvg: requiredRate,
        })
        i += 1
    }
    i = 0
    return { planned: planned, m50_date: m50_date, required_rate: requiredRate }
}

const EstimateCurve = (props) => {
    const { width, height } = props
    let timeSeries: PredictionProps[] = []
    const { moving_aves: vaccinatedAvgs } = movingAvg(data, 'total_doses')
    const { moving_aves: firstDoseAvgs } = movingAvg(data, 'first_dose')
    const { moving_aves: deltaAvgs } = movingAvg(data, 'daily_vaccinations')
    // not sure if data should be updated?
    data.map((item: NationalVaccinationDataProps, index: number) => {
        timeSeries.push({
            date: item.date,
            estimation: false,
            total_doses: item.total_doses,
            first_dose: item.first_dose,
            vaccinatedAvg: vaccinatedAvgs[index],
            firstDoseAvg: firstDoseAvgs[index],
            deltaAvg: deltaAvgs[index]
        })
    })
    const generatedData = generateExtension(timeSeries)
    const extension = generatedData.predictions
    const goal = plannedRollout(timeSeries)
    const dividedData = [timeSeries, extension]
    const merged = [...timeSeries, ...extension]
    useEffect(() => {
        props.setEstimation({
            m50_date: generatedData.m50_date,
            deltaAvg: extension[extension.length - 1].deltaAvg,
            required_rate: Math.floor(goal.required_rate)
        })
    }, [])

    const x = d => new Date(d.date)
    const y = d => d.vaccinatedAvg
    const xScale = scaleBand({
        range: [0, width],
        domain: merged.map(x),
        padding: 0.07
    })
    const dateScale = scaleTime({
        range: [0, width - 0],
        domain: extent(merged, x),
    })
    const yScale = scaleLinear({
        range: [height, 50],
        domain: [0, max(merged, y)],
    })
    return (
        <div style={{ position: 'relative' }}>
            <svg width={width} height={height}>
                <Group>
                    <Group>
                        <LinePath
                            curve={curveBasis}
                            data={goal['planned']}
                            x={d => dateScale(x(d))}
                            y={d => yScale(d['vaccinatedAvg']) - 30}
                            stroke="#ffffff"
                            strokeWidth={1.4}
                            strokeDasharray="3,4"
                        />
                        <circle
                            cx={dateScale(x(goal['planned'][goal['m50_date']]))}
                            cy={yScale(y(goal['planned'][goal['m50_date']])) - 30}
                            r={4}
                            strokeWidth={2}
                            stroke='#ffffff'
                            fill='#242424'
                        />
                        <Text
                            x={dateScale(x(goal['planned'][goal['m50_date']]))}
                            y={yScale(y(goal['planned'][goal['m50_date']])) - 30}
                            fill='#fff'
                            dx={10}
                            dy={10}
                            width={150}
                            lineHeight={18}
                            fontFamily="Sarabun"
                            fontWeight="bold"
                            fontSize={12}
                        >
                            {`${Math.floor(goal['required_rate']).toLocaleString()} โดส/วัน เพื่อให้ครบ 50 ล้านคน ในสิ้นปี`}
                        </Text>
                    </Group>
                    <LinePath
                        curve={curveBasis}
                        data={dividedData[0]}
                        x={d => dateScale(x(d))}
                        y={d => yScale(d['vaccinatedAvg']) - 30}
                        stroke="#7ea297"
                        strokeWidth={2}
                    />
                    <LinePath
                        curve={curveBasis}
                        data={dividedData[1]}
                        x={d => dateScale(x(d))}
                        y={d => yScale(d['vaccinatedAvg']) - 30}
                        stroke="#7ea297"
                        strokeWidth={2}
                        strokeDasharray="3,4"
                    />
                </Group>
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
                </Group>
                <Group>
                    <AxisLeft
                        scale={yScale}
                        tickLabelProps={() => ({
                            fill: '#bfbfbf',
                            fontSize: 11,
                            textAnchor: "start",
                            opacity: 0.7
                        })}
                        tickFormat={d => (`${Math.floor(Number(d) * 100 / population)}%`)}
                        numTicks={4}
                        top={-35}
                        left={0}
                        tickLength={0}
                    />
                    <AxisBottom
                        numTicks={5}
                        top={height - 30}
                        scale={dateScale}
                        tickFormat={d => moment(String(d)).format('MMM YY')}
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

export const Projection = (props) => (
    <div>
        <ParentSize>
            {({ width }) => (
                <EstimateCurve setEstimation={props.setEstimation} width={width} height={350} />
            )}
        </ParentSize>
    </div>
)
