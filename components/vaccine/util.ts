import { timeDays } from 'd3';
import _ from 'lodash'
import moment from 'moment';
interface TsProps {
    date: string,
    [key: string]: any
}



export function movingAvg(ts: TsProps[], id: string, type?: 'rate' | 'cum') {
    var moving_aves = []
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