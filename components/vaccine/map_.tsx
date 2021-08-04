import React, { useMemo, useState } from 'react';
import populationData from '../gis/data/th-census-with-hidden-pop.json';
import _ from 'lodash';
import { VaxCoverageLegend, SupplyLegend } from './mapLegends';
import CoverageMap from '../map/CoverageMap';
import SupplyMap from '../map/SupplyMap';

function Map(props: { province_vaccination }) {
    const [mapType, setMapType] = useState('coverage');
    const provincesData = props.province_vaccination

    const maxCoverage = useMemo(() => {
        const coverages = [];
        provincesData['data'].forEach((province) => {
            const provincePopulation = _.find(populationData, { province: province['province'] })
            var coverage
            if (provincePopulation['estimated_living_population']) {
                coverage = province['1st_dose']['total_doses'] / provincePopulation['estimated_living_population']
            }
            else {
                coverage = province['1st_dose']['total_doses'] / provincePopulation['population']
            }
            if (coverage >= 0) coverages.push(coverage);
        });
        return Math.max(...coverages);
    }, []);
    return (
        <div style={{ position: 'relative' }}>
            <h2 className='text-center'>แผนที่สถานการณ์วัคซีน</h2>
            <div className='container mt-4 mb-3 mb-md-0 row mx-auto flex-column-reverse flex-md-row'>
                <div
                    className='col-md-6 mb-3'
                    style={{ display: 'flex', alignItems: 'flex-end' }}
                >
                    {mapType === 'coverage' && <VaxCoverageLegend maxCoverage={maxCoverage} />}
                    {mapType === 'supply' && <SupplyLegend />}
                </div>

                <div className='col-md-6 mb-3 d-flex justify-content-center'>
                    <button
                        onClick={() => setMapType('coverage')}
                        className={`btn btn-dark px-3 mr-4 ${mapType == 'coverage' && 'focus'
                            }`}
                        style={{
                            height: 120,
                            width: 200,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundImage: 'url(/vax-coverage-map.png)',
                        }}
                    >
                        <div className='d-flex h-100 align-items-end text-left'>
                            <span>ความครอบคลุมรายจังหวัด</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setMapType('supply')}
                        className={`btn btn-dark px-3 mr-0 ${mapType == 'supply' && 'focus'
                            }`}
                        style={{
                            height: 120,
                            width: 200,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundImage: 'url(/vax-supply-map.png)',
                        }}
                    >
                        <div className='d-flex h-100 align-items-end text-left'>
                            <span>การกระจายตามศูนย์ฉีดวัคซีน (Archived)</span>
                        </div>
                    </button>
                </div>
            </div>
            {mapType === 'coverage' && <CoverageMap province_vaccination={props.province_vaccination} />}
            {mapType === 'supply' && <SupplyMap />}
        </div>
    );
}

export default Map;
