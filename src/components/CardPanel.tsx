'use client'
import Card from "./Card"
import { useReducer } from "react"
import Link from "next/link";

export default function CardPanel() {
    const cardReducer = (
        venueList: Map<string, number>, 
        action: { type: string; venueName: string; rating?: number }
    ) => {
        let defaultVenue = new Map<string, number>([
            ["The Bloom Pavilion", 0],
            ["Spark Space", 0],
            ["The Grand Table", 0]
        ]);
    
        if (action.type === "UPDATE_RATING" && action.venueName && action.rating !== undefined) {
            let newMap = new Map(venueList);
            newMap.set(action.venueName, action.rating);
            return newMap;
        } else if (action.type === "REMOVE_RATING" && action.venueName) {
            let newMap = new Map(venueList);
            newMap.delete(action.venueName);
            return newMap;
        }
            
        return venueList;
    };

    const [venueRatings, dispatch] = useReducer(
        cardReducer,
        new Map([
            ["The Bloom Pavilion", 0],
            ["Spark Space", 0],
            ["The Grand Table", 0],
        ])
    );

    /**
     *  Mock Data for Demonstration Only
     */
    const mockVenueRepo = [
        {vid: "001", name:"The Bloom Pavilion", image:"/img/bloom.jpg"},
        {vid: "002", name:"Spark Space", image:"/img/sparkspace.jpg"},
        {vid: "003", name:"The Grand Table", image:"/img/grandtable.jpg"},
    ]

    return (
        <div>
            <div style={{margin:"20px", display:"flex",
                flexDirection:"row", alignContent:"space-around",
                justifyContent:"space-around", flexWrap:"wrap"}}>
                {
                    mockVenueRepo.map((venueItem) => (
                        <Link href={`/venue/${venueItem.vid}`} className="w-1/5" key={venueItem.vid}> 
                            <Card 
                                venueName={venueItem.name} 
                                imgSrc={venueItem.image}
                                onRating={(newRating: number) => 
                                    dispatch({ 
                                    type: "UPDATE_RATING", 
                                    venueName: venueItem.name,
                                    rating: newRating 
                                    })
                                }                        
                            />
                        </Link>
                    ))
                }
                
            </div>

            <div style={{ marginTop: "40px"}}>
                <h2 className="text-black font-serif font-bold">Venue List with Ratings: {venueRatings.size}</h2>
                {Array.from(venueRatings).map(([venueName, rating]) => (
                    <p 
                        key={venueName} 
                        data-testid={venueName} 
                        style={{ fontSize: "18px", color: "black", fontFamily: "serif", paddingTop: "5px", cursor: "pointer" }} 
                        onClick={() => {
                            dispatch({ type: "REMOVE_RATING", venueName });
                        }}
                    >
                        {venueName} Rating: {rating}
                    </p>
                ))}
                </div>

        </div>
    )
}
