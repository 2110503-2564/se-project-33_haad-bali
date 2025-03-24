'use client'
import React from "react"

export default function InteractiveCard( { children,contentName } : { children: React.ReactNode, contentName:string }) {
    
    function onCardSelected() {
        alert("You Select " + contentName)
    }

    function onCardMouseAction (event:React.SyntheticEvent) {
        if (event.type == 'mouseover') {
            event.currentTarget.classList.remove('shadow-lg', 'bg-white');
            event.currentTarget.classList.add('shadow-2xl', 'bg-neutral-200');
            
        } else {
            event.currentTarget.classList.remove('shadow-2xl', 'bg-neutral-200');
            event.currentTarget.classList.add('shadow-lg', 'bg-white');
        }
    }
    
    return (
        <div className='w-full h-[300px] rounded-lg shadow-lg bg-white'
        onMouseOver={ (e) => onCardMouseAction(e) }
        onMouseOut={ (e) => onCardMouseAction(e) }>
            { children }
        </div>
    )
}