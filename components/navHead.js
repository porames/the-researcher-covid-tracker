import React from 'react'
import Link from 'next/link'

const NavHead = () => {
    return (
        <div className='navbar navbar-dark text-white py-2 shadow' style={{ backgroundColor: '#3c3c3c' }}>
            <div>
                <Link href='/'><a className='text-white text-decoration-none'>The Researcher Covid Tracker</a></Link>
            </div>
            <div>
                <Link href='https://facebook.com/researcher.th'>
                    <a target="_blank">
                        <img className='social-logo mr-2' src='/facebook_logo-white.svg'></img>
                    </a>
                </Link>
                <Link href={`https://twitter.com/intent/tweet?url=${encodeURI('https://covid-19.researcherth.co/vaccination')}`}>
                    <a target='_blank'>
                        <img className='social-logo mr-2' src='/twitter_logo-white.svg'></img>
                    </a>
                </Link>
                <Link href={`https://github.com/porames`}>
                    <a target='_blank'>
                        <img className='social-logo' src='/github_logo-white.svg'></img>
                    </a>
                </Link>
            </div>
        </div>
    )
}
export default NavHead