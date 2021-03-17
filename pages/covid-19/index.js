import { useEffect } from "react"

const Redirect = () => {
    useEffect(() => {
        if (typeof (window) !== 'undefined') {
            window.location = "/"
        }

    })
    return (
        <span>Redirect</span>
    )
}

export default Redirect