import React from 'react'
import Link from 'next/link'
const NavHead = () => {
    return (
        <div className='navbar navbar-dark text-white py-2 shadow' style={{backgroundColor: '#3c3c3c'}}>
            <div>
                <Link href='/'><a className='text-white text-decoration-none'>The Researcher Covid Tracker</a></Link>
            </div>
            <div>                
                <img className='social-logo mr-2' src='/facebook_logo-white.svg'></img>
                <img className='social-logo mr-2' src='/twitter_logo-white.svg'></img>
                <img className='social-logo' src='/github_logo-white.svg'></img>
            </div>
        </div>
    )
}
export default NavHead