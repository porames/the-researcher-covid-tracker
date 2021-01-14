import React from 'react';
import { extent, max } from 'd3-array'
import _ from 'lodash'
import { Group } from '@visx/group'
import moment from 'moment'
import { scaleTime, scaleLinear } from '@visx/scale'
import { curveLinear } from '@visx/curve'
import { LinePath } from '@visx/shape'

function Graph(props) {
    var f = _.countBy(props.data)
    var keys = Object.keys(f)
    const today = moment()
    var ts = []
    for (var i = 0; i < 14; i++) {
        const time = new Date(today.subtract(1, 'd').startOf('day'))
        ts.push({ 'date': time, 'caseCount': 0 })
    }
    function colorMap(caseCount) {
        const palette = ['#fafafa', '#f2df91', '#FFB14D', '#FF682D', '#a2322c', '#460c39', '#29010e']
        var step
        if (caseCount < 5) {
            step = 0
        }
        else if (caseCount < 30) {
            step = 1
        }
        else if (caseCount < 50) {
            step = 2
        }
        else if (caseCount < 100) {
            step = 3
        }
        else if (caseCount < 250) {
            step = 4
        }
        else {
            step = 5
        }
        return palette[step]
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
    // Define the graph dimensions and margins
    const width = 150;
    const height = 80;

    // Then we'll create some bounds
    const xMax = width
    const yMax = height
    // We'll make some helpers to get at the data we want
    const x = d => new Date(d.date);
    const y = d => d.caseCount;

    // And then scale the graph by our data
    const xScale = scaleTime({
        range: [0, width],
        domain: extent(ts, x),
    })
    const yScale = scaleLinear({
        range: [height - 10, 10],
        domain: max(ts, y) === 0 ? [0, 1] : [0, max(ts, y)],
    })

    return (
        <svg width={width} height={height}>
            {[ts].map((lineData, i) => {
                return (
                    <Group key={`bar-${i}`}>
                        <LinePath
                            curve={curveLinear}
                            data={lineData}
                            x={d => xScale(new Date(d.date)) ?? 0}
                            y={d => yScale(d.caseCount) ?? 0}
                            stroke={colorMap(props.caseCount)}
                            strokeWidth={2}
                            shapeRendering="geometricPrecision"
                        />
                    </Group>
                );
            })}
        </svg>
    );
}

export default Graph