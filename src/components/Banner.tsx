'use client'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function Banner () {
    const covers = ['/img/cover.jpg','/img/cover2.jpg','/img/cover3.jpg','/img/cover4.jpg']
    const [index, setIndex] = useState(0)
    const router = useRouter()

    const { data: session } = useSession()

    return(
        <div className="relative w-full h-96" onClick={() => setIndex(index + 1)}>
            <Image 
                src={covers[index % 4]} 
                alt='cover' 
                fill={true} 
                priority
                objectFit='cover'
                className="absolute top-0 left-0 w-full h-full"
            />
            <div className="absolute top-1/2 left-10 transform -translate-y-1/2">
                <h1 className="drop-shadow-lg text-5xl bottom-10 font-bold text-white break-words max-w-xs"> {/* Increased font size and wrapping */}
                    Where every event finds its venue
                </h1>
                <h3 className="drop-shadow-2xl text-m text-white mt-2 break-words max-w-xs"> {/* Ensures long text wraps */}
                    Book the perfect venue for your event—hassle-free and tailored to your needs!
                </h3>
            </div>
            {
                session ? (
                    <div className="z-30 absolute top-5 left-5 font-semibold text-cyan-200 text-xl">
                        Welcome {session.user?.name}
                    </div>
                ) : null
            }
            <button 
                className="z-30 absolute bottom-5 left-10 bg-black text-white  font-semibold py-2 px-4 rounded-3xl hover:bg-white hover:text-black hover:border-transparent"
                onClick={(e) => { 
                    e.stopPropagation(); 
                    router.push('/venue');
                }}
            >
                Select Venue
            </button>
        </div>
    );
}
