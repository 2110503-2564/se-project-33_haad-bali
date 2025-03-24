'use client'
import styles from './banner.module.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function Banner () {
    const covers = ['/img/cover.jpg','/img/cover2.jpg', '/img/cover3.jpg', '/img/cover4.jpg'];
    const [index, setIndex] = useState(0);
    const router = useRouter();
    const {data:session} = useSession();
    console.log(session)
    
    return (
        <div className={styles.banner} onClick={() => { setIndex(index+1) }}>
            <Image src={covers[index%4]} 
            alt='cover'
            fill={true}
            objectFit= 'cover'
            priority
            />
            <div className={styles.bannerText}>
                <h1 className='text-4xl font-bold font-serif text-white'>Where every event finds its venue</h1>
                <h3 className='text-xl font-serif text-white'>Your Events, Our Venue</h3>
            </div>
            {
                session? <div className={styles.bannerTexta}> <div className='text-4xl font-bold font-serif text-white '>
                Welcome {session.user?.name}</div></div>:null
            }
            <button className='bg-[#501717] text-white border border-[#501717]
                font-semibold font-serif py-2 px-2 m-2 rounded z-30 absolute bottom-0 right-0
                hover:bg-[#731f1f] hover:text-white'
                onClick={(e) => {e.stopPropagation; router.push('/campgrounds') }}>
                Select Your Campground NOW
            </button>
        </div> 
    );
}

