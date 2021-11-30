import React from 'react'
import Logo from "./Logo"

// Everything horizontally centered using Tailwind
export default function NavigationBar(props) {
    return (
        <div className="flex flex-col gap-2 pr-16">
            {/* <div className="text-center font-serif text-lg">情迷香港 the lost metropolis</div> */}
            <Logo />
            <div className="flex justify-center flex-col">
                {props.children}
            </div>
            
        </div>
    )
}