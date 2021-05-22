import React, { useState } from 'react'
import _ from 'lodash'
import HotspotMap from './hotspotMap'
import CasesMap from './casesMap'
import { HotspotLegend, CasesLegend } from './mapLegends'


function Map() {
    const [mapType, setMapType] = useState('hotspot')
    return (
        <div>
            <div className='container mb-3 mb-md-0 row mx-auto flex-column-reverse flex-md-row'>
                <div className='col-md-6 mb-3' style={{ display: 'flex', alignItems: 'flex-end' }}>
                    {mapType === 'hotspot' && <HotspotLegend />}
                    {mapType === 'cases' && <CasesLegend />}
                </div>
                <div className='col-md-6 mb-3 d-flex justify-content-center'>
                    <button onClick={() => setMapType('hotspot')} className='btn btn-dark px-3 mr-4' style={{ height: 120, width: 200, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: 'url(/hotspots-map.png)' }}>
                        <div className='d-flex h-100 align-items-end'>
                            <span>การระบาดในจังหวัด</span>
                        </div>
                    </button>
                    <button onClick={() => setMapType('cases')} className='btn btn-dark px-3' style={{ height: 120, width: 200, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: 'url(/cases-map.png)' }}>
                        <div className='d-flex h-100 align-items-end'>
                            <span>ตำแหน่งการระบาด</span>
                        </div>
                    </button>
                </div>
            </div>
            {mapType === 'hotspot' && <HotspotMap />}
            {mapType === 'cases' && <CasesMap />}
        </div>
    )
}

export default Map