import { timeDays } from 'd3';
import _ from 'lodash';
import moment from 'moment';
type TsProps = {
    date: string;
} & {
    [key: string]: number | undefined;
};

export function movingAvg(ts: TsProps[], id: string, type?: 'rate' | 'cum') {
    const moving_aves = [];
    const ys: (number | undefined)[] = [];
    for (var i = 0; i < ts.length; i++) {
        let value = ts[i][id];
        if (value === undefined) {
            if (type === 'rate') value = 0;
            else if (type === 'cum') value = i === 0 ? 0 : ts[i - 1][id];
        }
        ys.push(value);
    }
    for (var i = 0; i < ys.length; i++) {
        if (i >= 7) {
            const cosum = ys.slice(i - 7, i);
            moving_aves.push(cosum.reduce((a, b) => a + b, 0) / 7);
        } else {
            moving_aves.push(0);
        }
    }
    return moving_aves;
}
