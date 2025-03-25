'use client'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function Banner () {
    const covers = ['/img/cover.jpg', '/img/cover2.jpg', '/img/cover3.jpg', '/img/cover4.jpg'];
    const [index, setIndex] = useState(0);
    const router = useRouter();

    const { data: session } = useSession();
    console.log(session);

    return(
        <div className="relative w-full h-96" onClick={() => setIndex(index + 1)}>
            <Image 
                src={covers[index % 4]} 
                alt="cover" 
                fill={true} 
                priority
                objectFit="cover"
                className="absolute top-0 left-0 w-full h-full transition-transform duration-500 ease-in-out"
            />
            <div className="absolute top-1/2 left-10 transform -translate-y-1/2 space-y-4">
                <h1 className="text-5xl font-bold text-white drop-shadow-lg max-w-xl">
                    Where every event finds its venue
                </h1>
                <h3 className="text-xl text-white mt-2 drop-shadow-2xl max-w-xl">
                    Book the perfect venue for your event—hassle-free and tailored to your needs!
                </h3>
            </div>
            <button 
                className="z-20 absolute bottom-5 left-10 bg-black text-white font-semibold py-3 px-6 rounded-3xl transition-all duration-300 transform hover:bg-white hover:text-black hover:border-transparent hover:scale-105"
                onClick={(e) => { 
                    e.stopPropagation(); 
                    router.push('/campgrounds');
                }}
            >
                Select Your Campground
            </button>
        </div>
    );
}
