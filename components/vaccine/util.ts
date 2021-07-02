import { timeDays } from 'd3';
import _ from 'lodash';
import moment from 'moment';

type TsProps = {
    [key: string]: number | undefined;
} & { date: string };

function compareDate(date1: string, date2: string) {
    const date1Value = moment(date1, 'DD-MM-YYYY').valueOf();
    const date2Value = moment(date2, 'DD-MM-YYYY').valueOf();
    return date1Value < date2Value ? date1 : date2;
}

function incrementDate(date: string) {
    return moment(date, 'DD-MM-YYYY').add(1, 'days').format('DD-MM-YYYY');
}

function fillEmptyDates(ts: TsProps[]) {
    const morphObject: Record<string, TsProps> = ts.reduce(
        (pre, cur) => ({ ...pre, [cur.date]: { ...cur } }),
        {}
    );
    const minDate = ts.reduce(
        (pre, cur) => (compareDate(pre, cur.date) ? pre : cur.date),
        '01-01-3000'
    );
    const maxDate = ts.reduce(
        (pre, cur) => (compareDate(pre, cur.date) ? cur.date : pre),
        '01-01-2000'
    );
    for (let date = minDate; compareDate(date, maxDate); incrementDate(date)) {
        if (!_.has(morphObject, date)) {
            morphObject[date] = { date } as TsProps;
        }
    }
    return Object.values(morphObject).sort((a, b) =>
        compareDate(a.date, b.date) ? -1 : 1
    );
}

export function movingAvg(ts: TsProps[], id: string, type?: 'rate' | 'cum') {
    const moving_aves = [];
    const ys: (number | undefined)[] = [];
    ts = fillEmptyDates(ts);
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
