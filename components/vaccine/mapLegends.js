import React from 'react'

export const VaxCoverageLegend = (props) => {
    const palette = ['#bdd5cd', '#9dbbb2', '#7ea297', '#60897e', '#427165']
    return (
      <div className='d-flex flex-column w-100' >
        <div className='text-left mb-3 text-sec'><b>จำนวนโดสครอบคลุมประชากร</b></div>
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
        </div>
        <div className='w-100 d-flex flex-row'>
          <div className='d-flex bar-label' style={{ flex: 4 }}>
            {[`${parseInt(props.maxCoverage * 20)}%`, `${parseInt(props.maxCoverage * 40)}%`, `${parseInt(props.maxCoverage * 60)}%`, `${parseInt(props.maxCoverage * 80)}%`, `${parseInt(props.maxCoverage * 100)}%`].map((label, i) => {
              return (
                <div key={i} className='label'>
                  <small>{label}</small>
                </div>
              )
            })}
  
          </div>
        </div>
      </div>
    )
  }