import React from 'react'
import data from './gis/data/national-timeseries-14-1-2021.json'


function NationalTable(props) {
    const ts = data['Data']
    var currentPeriod = 0
    var prevPeriod = 0
    for (var i = ts.length - 1; i >= ts.length - 15; i--) {
        currentPeriod += ts[i]['NewConfirmed']
    }
    for (var i = (ts.length - 1) - 14; i >= (ts.length - 15) - 14; i--) {
        prevPeriod += ts[i]['NewConfirmed']
    }
    const delta = ((currentPeriod - prevPeriod) / prevPeriod) * 100
    const deltaH = ((ts[ts.length - 1]['Deaths'] - ts[ts.length - 15]['Deaths']) / ts[ts.length - 15]['Deaths']) * 100
    return (
        <table className="table table-theme-light mt-4 text-white">
            <thead>
                <tr>
                    <th scope="col"></th>
                    <th className='text-end' scope="col">ตั้งแต่เริ่มระบาด</th>
                    <th className='text-end' scope="col">วันนี้</th>
                    <th className='text-end' scope="col">แนวโน้ม 14 วัน</th>
                </tr>
            </thead>
            <tbody>
                <tr className='text-danger'>
                    <th scope="row">ผู้ติดเชื้อสะสม</th>
                    <td>{ts[ts.length - 1]['Confirmed'].toLocaleString()}</td>
                    <td>{ts[ts.length - 1]['NewConfirmed'].toLocaleString()}</td>
                    <td>{delta > 0 ? '+' : ''}{parseInt(delta)}%</td>
                </tr>
                <tr className='text-sec'>
                    <th scope="row">เสียชีวิต</th>
                    <td>{ts[ts.length - 1]['Deaths']}</td>
                    <td>{ts[ts.length - 1]['NewDeaths']}</td>
                    <td></td>
                </tr>
                <tr className='text-sec'>
                    <th scope="row">รักษาตัวในโรงพยาบาล</th>
                    <td></td>
                    <td>{ts[ts.length - 1]['Hospitalized'].toLocaleString()}</td>
                    <td>{deltaH > 0 ? '+' : '-'}{parseInt(deltaH).toLocaleString()}%</td>
                </tr>

            </tbody>
        </table>
    )
}
export default NationalTable