'use client'
import { Session } from "next-auth"
import { SessionProvider } from "next-auth/react"
import React, { ReactNode } from "react"

export default function NextAuthProvider({children,session} 
    : {children:React.ReactNode,session:any}) : React.ReactNode{
        return (
            <SessionProvider session={session}>
                {children}
            </SessionProvider>
        )
    }