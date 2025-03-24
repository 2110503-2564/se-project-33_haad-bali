import getCampgrounds from "@/libs/getCampgrounds"
import CamgroundCatalog from "@/components/CampgroundCatalog"
import { Suspense } from "react"
import { LinearProgress } from "@mui/material"

export default function Card() {
    const campgrounds = getCampgrounds()

    return (
        <main className="text-center p-5">
        
            <Suspense fallback={ <p>Loading... <LinearProgress/></p> }>
            <CamgroundCatalog cammpgroundsJson={campgrounds}/>                
            </Suspense>
        </main>
    )
}