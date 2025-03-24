import styles from './topmenu.module.css'
import Image from 'next/image'
import TopMenuItem from './TopMenuItem'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { Link } from '@mui/material'

export default async function TopMenu() {

    const session = await getServerSession(authOptions)

    return (
        <div className={styles.menucontainer}>
            <TopMenuItem title='Booking' pageRef='/booking/'/>
            
            <Image src={'/img/logo.png'} className={styles.logoimg} alt='logo' 
            width={0} height={0} sizes='100vh'/>

            <div className="flex justify-center items-center absolute left-0 h-full px-2 space-x-10">
                {
                    session
                    ? <Link href="/api/auth/signout">
                        <div className="text-cyan-600 text-sm">
                            Sign-Out of {session.user?.name}
                        </div>
                      </Link>
                    : <Link href="/api/auth/signin">
                        <div className="text-cyan-600 text-sm">
                            Sign-In
                        </div>
                      </Link>
                }
                <Link href="/mybooking/">
                    <div className="text-cyan-600 text-sm">
                        My Booking
                    </div>
                </Link>
            </div>
        </div>
    )
}
