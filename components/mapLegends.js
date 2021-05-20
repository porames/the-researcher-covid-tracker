import React from 'react'


export const HotspotLegend = (props) => {
    const palette = ["#FFFA6C", '#FFB14D', '#FF682D', '#a2322c', '#460c39', '#29010e']
    return (
        <div className='container' style={{ maxWidth: 700 }}>
            <div className='px-sm-3 px-md-5 px-0 d-flex flex-column' >
                <b className='text-center mb-3'>จำนวนผู้ติดเชื้อใหม่ในช่วง 14 วัน ต่อประชากร 100,000 คน</b>
                <div className='w-100 d-flex flex-row'>
                    <div className='d-flex bar-legend' style={{ flex: 4 }}>
                        {palette.map((color, i) => {
                            return (
                                <div key={i} className='bar'>
                                    <div className='level' style={{ backgroundColor: color }}></div>
                                </div>
                            )
                        })}

                    </div>
                    <div className='d-flex bar-legend' style={{ flex: 1, justifyContent: 'center' }} >
                        <div className='pl-3 pl-sm-5' style={{ width: '100%', paddingBottom: 5 }}>
                            <div className='level' style={{ backgroundColor: '#fafafa' }} />
                        </div>
                    </div>
                </div>
                <div className='w-100 d-flex flex-row'>
                    <div className='d-flex bar-label' style={{ flex: 4 }}>
                        {[10, 30, 50, 100, 250, '1000+'].map((label, i) => {
                            return (
                                <div key={i} className='label'>
                                    <small>{label}</small>
                                </div>
                            )
                        })}

                    </div>
                    <div className='d-flex bar-label' style={{ flex: 1, justifyContent: 'center' }} >
                        <div className='pl-3 pl-sm-5' style={{ width: '100%', paddingBottom: 5 }}>
                            <div className='text-center'>
                                <small>ข้อมูลไม่พอ</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}