import React from 'react'

const CaseCircle = (props) => (
    <div className='case-circle-legend mr-3' style={{ width: props.size, height: props.size }} ></div>
)

export const CasesLegend = (props) => {
    const circleSizes = [1, 4, 16, 64]
    return (
        <div className='mx-auto mx-md-0'>
            <div><b>จำนวนผู้ติดเชื้อใหม่ในช่วง 14 วัน</b></div>
            <div className='mt-3 d-flex w-100 align-items-center text-sec'>
                <div className='mr-3'>1</div>
                <div className='d-flex align-items-center'>
                    {circleSizes.map((diameter, i) => {
                        return (
                            <CaseCircle size={diameter} key={i} />
                        )
                    })}
                </div>
                <div>1,000</div>
            </div>
        </div>
    )
}

export const HotspotLegend = (props) => {
    const palette = ["#FFFA6C", '#FFB14D', '#FF682D', '#a2322c', '#460c39', '#29010e']
    return (
        <div className='d-flex flex-column w-100' >
            <b className='text-center text-md-left mb-3'>จำนวนผู้ติดเชื้อใหม่ในช่วง 14 วัน ต่อประชากร 100,000 คน</b>
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
    )
}