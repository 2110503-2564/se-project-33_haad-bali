import Card from "./Card"
import Link from "next/link"
import { CamgroundItem, CammpgroundsJson } from "../../interface"

export default async function CamgroundCatalog({cammpgroundsJson} : {cammpgroundsJson:Promise<CammpgroundsJson>}) {
    const campgroundJsonReady = await cammpgroundsJson

    return (
        <div className="">
            <h2 className="text-xl text-black text-center my-4">
                Explore {campgroundJsonReady.count} campgrounds in our campground catalog
            </h2>

            <div style={{margin:"20px", display:"flex",
                flexDirection:"row", alignContent:"space-around",
                justifyContent:"space-around", flexWrap:"wrap"}}>
                {
                    campgroundJsonReady.data.map((campgroundItem:CamgroundItem) => (
                        <Link href={`/campgrounds/${campgroundItem.id}`} className="w-1/5 " key={campgroundItem.id}> 
                            <Card 
                                campgroundName={campgroundItem.name} 
                                imgSrc={campgroundItem.picture}                     
                            />
                        </Link>
                    ))
                }        
            </div>
        </div>
    )
}