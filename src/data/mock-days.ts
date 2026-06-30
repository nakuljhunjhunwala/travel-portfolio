import type { Day } from "@/types";

/**
 * Day-by-day itinerary data, keyed by trip id.
 *
 * Kerala Family Trip 2026 — the actual trip (reconstructed from the hotel
 * bookings + expense sheet, confirmed with the traveller). The polished PDF was
 * the *plan*; reality differed (Varkala added; Munroe Island & Fort Kochi dropped).
 */

// Real Wikimedia Commons photos for the stay cards (host allowed in next.config.mjs).
const STAY_IMG = {
  munnar:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Munnar_Overview.jpg/1280px-Munnar_Overview.jpg",
  thekkady:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Thekkady.jpg/1280px-Thekkady.jpg",
  alappuzhaBoat:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Alappuzha_Boat_Beauty_W.jpg/1280px-Alappuzha_Boat_Beauty_W.jpg",
  varkala:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Varkala_Cliff_Sunset_by_KS.jpg/1280px-Varkala_Cliff_Sunset_by_KS.jpg",
  tvm:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Padmanabhaswamy_Temple_Thiruvananthapuram.jpg/1280px-Padmanabhaswamy_Temple_Thiruvananthapuram.jpg",
};

export const mockDays: Record<string, Day[]> = {
  "trip-kerala-2026": [
    {
      id: "kerala-d1",
      dayNumber: 1,
      date: { seconds: 1781827200, nanoseconds: 0 } as Day["date"], // 19 Jun 2026
      city: "En route",
      dayTitle: "Mumbai → Kerala · overnight train",
      totalDuration: "~24 hrs",
      totalDistance: "~1,400 km",
    },
    {
      id: "kerala-d2",
      dayNumber: 2,
      date: { seconds: 1781913600, nanoseconds: 0 } as Day["date"], // 20 Jun 2026
      city: "Munnar",
      dayTitle: "Aluva → Munnar · into the tea hills",
      totalDuration: "~9 hrs",
      totalDistance: "~130 km",
      accommodation: {
        name: "Calm Shack",
        phoneNumber: "+91 75580 95564",
        googleMapsUrl: "https://maps.app.goo.gl/WQkq2gq8yYUmPJREA",
        costPerNight: "₹6,500",
        totalCost: "₹13,000",
        checkIn: "20 Jun",
        checkOut: "22 Jun",
        rating: 4.8,
        honestNote:
          "The highlight of the whole trip. A farm stay with its own exotic-fruit orchard — you're free to roam and pluck fruit straight off the trees. Big homemade breakfast included. Felt genuinely luxurious for the price.",
        photoUrl: STAY_IMG.munnar,
        lat: 10.0096,
        lng: 76.9707,
      },
    },
    {
      id: "kerala-d3",
      dayNumber: 3,
      date: { seconds: 1782000000, nanoseconds: 0 } as Day["date"], // 21 Jun 2026
      city: "Munnar",
      dayTitle: "Munnar slow day · tea & culture",
      totalDuration: "~7 hrs",
      totalDistance: "~35 km",
      accommodation: {
        name: "Calm Shack",
        phoneNumber: "+91 75580 95564",
        googleMapsUrl: "https://maps.app.goo.gl/WQkq2gq8yYUmPJREA",
        costPerNight: "₹6,500",
        totalCost: "₹13,000",
        checkIn: "20 Jun",
        checkOut: "22 Jun",
        rating: 4.8,
        honestNote:
          "Second night at the farm — waking up to the orchard and a slow breakfast before exploring is the move. Book directly on the phone number.",
        photoUrl: STAY_IMG.munnar,
        lat: 10.0096,
        lng: 76.9707,
      },
    },
    {
      id: "kerala-d4",
      dayNumber: 4,
      date: { seconds: 1782086400, nanoseconds: 0 } as Day["date"], // 22 Jun 2026
      city: "Thekkady",
      dayTitle: "Munnar → Thekkady · spice country & a jungle jeep",
      totalDuration: "~8 hrs",
      totalDistance: "~95 km",
      accommodation: {
        name: "Periyar Inn Homestay",
        googleMapsUrl: "https://maps.app.goo.gl/V4cyBPuDTB15QdhbA",
        costPerNight: "₹3,400",
        totalCost: "₹3,400",
        checkIn: "22 Jun · after 12 noon",
        checkOut: "23 Jun · before 11 AM",
        honestNote:
          "Simple, clean homestay on Bypass Road, Kumily. Two rooms comfortably held all six of us. Walkable to the Thekkady junction.",
        photoUrl: STAY_IMG.thekkady,
        lat: 9.604,
        lng: 77.168,
      },
    },
    {
      id: "kerala-d5",
      dayNumber: 5,
      date: { seconds: 1782172800, nanoseconds: 0 } as Day["date"], // 23 Jun 2026
      city: "Alleppey",
      dayTitle: "Thekkady → Alleppey · into the backwaters",
      totalDuration: "~6 hrs",
      totalDistance: "~140 km",
      accommodation: {
        name: "Palmy Lake Resort",
        phoneNumber: "+91 73563 75483",
        googleMapsUrl: "https://maps.app.goo.gl/C7c8zZtS46yfmQ4v8",
        costPerNight: "₹4,200",
        totalCost: "₹4,200",
        checkIn: "23 Jun",
        checkOut: "24 Jun",
        rating: 4.5,
        honestNote:
          "Sits in the middle of the water — the only way in is by the resort's boat. Just four rooms, so it feels semi-private. Pro tip: do this instead of an Alleppey houseboat — same backwater magic, none of the houseboat hassle.",
        photoUrl: STAY_IMG.alappuzhaBoat,
        lat: 9.5201,
        lng: 76.3568,
      },
    },
    {
      id: "kerala-d6",
      dayNumber: 6,
      date: { seconds: 1782259200, nanoseconds: 0 } as Day["date"], // 24 Jun 2026
      city: "Varkala",
      dayTitle: "Alleppey → Varkala · backwaters to a cliff coast",
      totalDuration: "~7 hrs",
      totalDistance: "~150 km",
      accommodation: {
        name: "Beach House Varkala by Palmyra",
        phoneNumber: "+91 96555 16916",
        googleMapsUrl: "https://maps.app.goo.gl/F6YLEe41uagMsiF36",
        costPerNight: "₹5,250",
        totalCost: "₹5,250",
        checkIn: "24 Jun",
        checkOut: "25 Jun",
        rating: 4.5,
        honestNote:
          "On the quieter Chilakkoor/Ayiroor side of Varkala with its own private beach — a world away from the busy cliff. ₹1,000 advance to hold it.",
        photoUrl: STAY_IMG.varkala,
        lat: 8.776,
        lng: 76.699,
      },
    },
    {
      id: "kerala-d7",
      dayNumber: 7,
      date: { seconds: 1782345600, nanoseconds: 0 } as Day["date"], // 25 Jun 2026
      city: "Trivandrum",
      dayTitle: "Varkala → Trivandrum · cliffs, Kappil & the capital",
      totalDuration: "~6 hrs",
      totalDistance: "~55 km",
      accommodation: {
        name: "Airbnb · Trivandrum",
        bookingUrl:
          "https://www.airbnb.co.in/rooms/1423888394076441545?check_out=2026-06-27&viralityEntryPoint=154&s=76",
        costPerNight: "₹3,450",
        totalCost: "₹6,900",
        checkIn: "25 Jun",
        checkOut: "27 Jun",
        honestNote:
          "Whole-place Airbnb, paid in full upfront. Breakfast not included — but Lulu Mall and the city's food are minutes away. Contact & exact location are on the Airbnb listing.",
        photoUrl: STAY_IMG.tvm,
      },
    },
    {
      id: "kerala-d8",
      dayNumber: 8,
      date: { seconds: 1782432000, nanoseconds: 0 } as Day["date"], // 26 Jun 2026
      city: "Trivandrum",
      dayTitle: "Trivandrum · temple, beaches & a cliff-top sunset",
      totalDuration: "~10 hrs",
      totalDistance: "~60 km",
      accommodation: {
        name: "Airbnb · Trivandrum",
        bookingUrl:
          "https://www.airbnb.co.in/rooms/1423888394076441545?check_out=2026-06-27&viralityEntryPoint=154&s=76",
        costPerNight: "₹3,450",
        totalCost: "₹6,900",
        checkIn: "25 Jun",
        checkOut: "27 Jun",
        honestNote:
          "Last night of the trip — an easy base for the morning temple run and the late return from the Azhimala sunset.",
        photoUrl: STAY_IMG.tvm,
      },
    },
    {
      id: "kerala-d9",
      dayNumber: 9,
      date: { seconds: 1782518400, nanoseconds: 0 } as Day["date"], // 27 Jun 2026
      city: "En route",
      dayTitle: "Trivandrum → Mumbai · the long train home",
      totalDuration: "~30 hrs",
      totalDistance: "~1,500 km",
    },
    {
      id: "kerala-d10",
      dayNumber: 10,
      date: { seconds: 1782604800, nanoseconds: 0 } as Day["date"], // 28 Jun 2026
      city: "Mumbai",
      dayTitle: "Home · trip ends",
      totalDuration: "—",
      totalDistance: "—",
    },
  ],
};
