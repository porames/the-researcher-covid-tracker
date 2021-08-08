import React from 'react';
import { extent, max } from 'd3-array'
import _ from 'lodash'
import { Group } from '@visx/group'
import moment from 'moment'
import { scaleTime, scaleLinear, scaleBand } from '@visx/scale'
import { MarkerArrow } from '@visx/marker'
import { curveLinear } from '@visx/curve'
import { Bar, LinePath, AreaClosed } from '@visx/shape'
import { movingAvg_ } from './vaccine/util'

function movingAvg(ts) {
    ts = ts.reverse()
    var moving_aves = []
    var ys = []
    for (var i = 0; i < ts.length; i++) {
        ys.push(ts[i]['caseCount'])
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

function Graph(props) {

    var f = props.data
    var keys = Object.keys(f)
    const today = moment()
    var ts = []
    for (var i = 0; i < 30; i++) {
        const time = new Date(today.subtract(1, 'd').startOf('day'))
        ts.push({ 'date': time, 'caseCount': 0 })
    }

    keys.forEach((date) => {
        if (date !== 'null') {
            //ts2.push({ 'date': date, 'caseCount': f[date] })
            var query = _.findIndex(ts, { date: new Date(date) })
            if (query >= 0) {
                ts[query].caseCount = f[date]
            }
        }
    })
    const avgs = movingAvg(ts)
    avgs.map((avg, i) => {
        ts[i]['movingAvg'] = avg
    })


    const height = 75;
    const width = height * 1.5;

    const x = d => new Date(d.date);
    const y = d => d['movingAvg'];
    const recent = ts.slice(16, 31)
    // And then scale the graph by our data
    const xScale = scaleTime({
        range: [0, width - 10],
        domain: extent(recent, x),
    })

    const yScale = scaleLinear({
        range: [height - 10, 10],
        domain: max(recent, y) === 0 ? [0, 1] : [0, max(ts, y)],
    })

    return (
        <svg width={width} height={height}>
            <Group>
                <MarkerArrow id={`marker-arrow-province-${props.index}`} fill='#cf1111' refX={2} size={5} />
                <LinePath
                    curve={curveLinear}
                    data={recent}
                    x={d => xScale(new Date(d.date)) ?? 0}
                    y={d => yScale(d['movingAvg']) ?? 0}
                    stroke='#cf1111'
                    strokeWidth={2}
                    shapeRendering="geometricPrecision"
                    markerEnd={`url(#marker-arrow-province-${props.index})`}

                />
            </Group>
        </svg>
    );
}

export default Graph