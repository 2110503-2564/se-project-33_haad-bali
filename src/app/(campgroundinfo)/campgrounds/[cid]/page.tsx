import getCampground from "@/libs/getCampground";
import Image from "next/image";
import Link from "next/link";

export default async function CampgroundDetailPage({params} : {params: {cid:string}}) {
    
    const campgroundDetail = await getCampground(params.cid);
    // /**
    //  *  Mock Data for Demonstation Only
    //  */
    // const mockVenueRepo = new Map()
    // mockVenueRepo.set("001", {name:"The Bloom Pavilion", image:"/img/bloom.jpg"});
    // mockVenueRepo.set("002", {name:"Spark Space", image:"/img/sparkspace.jpg"});
    // mockVenueRepo.set("003", {name:"The Grand Table", image:"/img/grandtable.jpg"});
    
    
    return (
        <main className="text-center p-5 font-serif">
            <h1 className="text-lg font-medium text-black">{campgroundDetail.data.name}</h1>
            <div className="flex flex-row my-5">
                <Image src={(campgroundDetail.data.picture)}
                alt="Campground Image"
                width={0} height={0} sizes="100vw"
                className="rounded-lg w-[30%]"/>
                <div className="text-md mx-5 text-black text-left">
                    <div>Name: { campgroundDetail.data.name}</div>
                    <div>Address: { campgroundDetail.data.address }</div>
                    <div>District: { campgroundDetail.data.district }</div>
                    <div>Province: { campgroundDetail.data.province }</div>
                    <div>Postal Code: { campgroundDetail.data.postalcode }</div>
                    <div>Tel: { campgroundDetail.data.tel }</div>

                    <Link href={`/booking?id=${params.cid}&name=${campgroundDetail.data.name}`}>
            <button className="text-white block rounded-md bg-cyan-600 hover:bg-cyan-900 hover:text-black px-3 py-1">
                Make Booking
            </button>
            </Link>
                </div>
                
            </div>
           
        </main>
    )
}

// export async function generateStaticParams() {
//     return [{vid:"001"}, {vid:"002"}, {vid:"003"}]
// }