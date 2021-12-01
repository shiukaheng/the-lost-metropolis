import React from 'react'
import Logo from "./Logo"

// Everything horizontally centered using Tailwind
export default function NavigationBar(props) {
    return (
        <div className="flex flex-col justify-center gap-2 mb-4">
            <div className="text-center font-serif text-lg">情迷香港 the lost metropolis</div>
            <div className="flex justify-center">
                {props.children}
            </div>
            
        </div>
    )
}