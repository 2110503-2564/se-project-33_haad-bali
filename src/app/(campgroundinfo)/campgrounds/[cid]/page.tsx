import getCampground from "@/libs/getCampground";
import Image from "next/image";
import Link from "next/link";
import { FiMapPin, FiPhone, FiMail, FiHome } from "react-icons/fi";

export default async function CampgroundDetailPage({params} : {params: {cid:string}}) {
    const campgroundDetail = await getCampground(params.cid);
    
    // Construct location string from available data
    const getLocation = () => {
        const parts = [
            campgroundDetail.data.address,
            campgroundDetail.data.district,
            campgroundDetail.data.province,
            campgroundDetail.data.postalcode
        ].filter(Boolean); // Remove empty/null parts
        
        return parts.length > 0 ? parts.join(', ') : 'Location not specified';
    };

    return (
        <main className="text-center p-5 font-sans bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-semibold text-gray-800 mb-8">{campgroundDetail.data.name}</h1>

            <div className="flex flex-col lg:flex-row items-center justify-center my-5 bg-white shadow-lg rounded-xl p-6 max-w-6xl mx-auto">
                
                {/* Campground Image */}
                <div className="flex-1 w-full lg:w-1/2 mb-6 lg:mb-0 lg:mr-8">
                    <Image 
                        src={campgroundDetail.data.picture} 
                        alt={`${campgroundDetail.data.name} Image`}
                        width={600}
                        height={400}
                        className="rounded-xl w-full h-auto object-cover shadow-md"
                        priority
                    />
                </div>
                
                {/* Campground Details */}
                <div className="flex-1 w-full lg:w-1/2 text-gray-700">
                    <div className="space-y-4">
                        {/* Location with icon */}
                        <div className="flex items-start">
                            <FiMapPin className="mt-1 mr-2 text-indigo-600" />
                            <div>
                                <h2 className="font-medium text-gray-900">Location</h2>
                                <p>{getLocation()}</p>
                            </div>
                        </div>
                        
                        {/* Contact with icon */}
                        {campgroundDetail.data.tel && (
                            <div className="flex items-start">
                                <FiPhone className="mt-1 mr-2 text-indigo-600" />
                                <div>
                                    <h2 className="font-medium text-gray-900">Contact</h2>
                                    <p>{campgroundDetail.data.tel}</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Additional details can be added here */}
                        <div className="flex items-start">
                            <FiHome className="mt-1 mr-2 text-indigo-600" />
                            <div>
                                <h2 className="font-medium text-gray-900">Facilities</h2>
                                <p>Tents, Restrooms, Showers, Fire pits</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Booking Button */}
                    <Link 
                        href={`/booking?id=${params.cid}&name=${encodeURIComponent(campgroundDetail.data.name)}`}
                        className="block mt-8"
                    >
                        <button className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-300 transform hover:scale-[1.02] shadow-md">
                            Book Your Stay
                        </button>
                    </Link>
                </div>
            </div>
        </main>
    );
}