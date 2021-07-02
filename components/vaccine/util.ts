import { timeDays } from 'd3';
import _ from 'lodash';
import moment from 'moment';

type TsProps = {
    [key: string]: any;
} & { date: string };

function compareDate(date1: string, date2: string) {
    const date1Value = moment(date1, 'YYYY-MM-DD').valueOf();
    const date2Value = moment(date2, 'YYYY-MM-DD').valueOf();
    return date1Value < date2Value;
}

function incrementDate(date: string) {
    return moment(date, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
}

function fillEmptyDates(ts: TsProps[]) {
    const morphObject: Record<string, TsProps> = ts.reduce(
        (pre, cur) => ({ ...pre, [cur.date]: { ...cur } }),
        {}
    );
    const minDate = ts.reduce(
        (pre, cur) => (compareDate(pre, cur.date) ? pre : cur.date),
        '2030-01-01'
    );
    const maxDate = ts.reduce(
        (pre, cur) => (compareDate(pre, cur.date) ? cur.date : pre),
        '2000-01-01'
    );
    console.log('minDate', minDate);
    console.log('maxDate', maxDate);
    for (
        let date = minDate;
        compareDate(date, maxDate);
        date = incrementDate(date)
    ) {
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
