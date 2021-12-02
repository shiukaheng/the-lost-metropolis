import React from 'react'
import Logo from "./Logo"

// Everything horizontally centered using Tailwind
export default function NavigationBar(props) {
    return (
        // <div className="flex flex-col gap-2 pr-16"> DESKTOP
        <div className="flex flex-col gap-2 p-8 md:p-20 md:pr-8">
            <Logo />
            {/* <div className="flex justify-center flex-col"> DESKTOP*/} 
            <div className="flex justify-left flex-row md:flex-col">
                {props.children}
            </div>
            
        </div>
    )
}