import type { Place } from "@/types";

/**
 * Places per day, keyed by day id (see mock-days.ts).
 *
 * Kerala Family Trip 2026 — actual visited places, reconstructed from the
 * expense sheet + hotel bookings and confirmed with the traveller. Coordinates
 * are researched inline; photos are real Wikimedia Commons images (themed where
 * a specific landmark photo isn't available).
 */

// Real Wikimedia Commons photos (host allowed in next.config.mjs).
const IMG = {
  cheeyappara:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Potrait_view_of_Cheeyappara_Waterfalls.jpg/1280px-Potrait_view_of_Cheeyappara_Waterfalls.jpg",
  munnar:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Munnar_Overview.jpg/1280px-Munnar_Overview.jpg",
  alappuzhaBoat:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Alappuzha_Boat_Beauty_W.jpg/1280px-Alappuzha_Boat_Beauty_W.jpg",
  kathakali:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Kathakali_-Play_with_Kaurava.jpg/1280px-Kathakali_-Play_with_Kaurava.jpg",
  kovalam:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Kovalam_beach_trivandrum_kerala.jpg/1280px-Kovalam_beach_trivandrum_kerala.jpg",
  padmanabha:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Sree_Padmanabhaswamy_temple_01.jpg/1280px-Sree_Padmanabhaswamy_temple_01.jpg",
  periyar:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Periyar_National_Park.JPG/1280px-Periyar_National_Park.JPG",
  thekkady:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Thekkady.jpg/1280px-Thekkady.jpg",
  varkala:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Varkala_Cliff_Sunset_by_KS.jpg/1280px-Varkala_Cliff_Sunset_by_KS.jpg",
  aluva:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Aluva_manappuram_temple_-_panoramio.jpg/1280px-Aluva_manappuram_temple_-_panoramio.jpg",
  // Periyar National Park image reused for the Vandiperiyar tea-route drive (clean filename).
  vandiperiyar:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Periyar_National_Park.JPG/1280px-Periyar_National_Park.JPG",
  // Alappuzha backwater boat for generic "Kerala" cards (train, Jatayu, mall, home).
  backwaters:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Alappuzha_Boat_Beauty_W.jpg/1280px-Alappuzha_Boat_Beauty_W.jpg",
  spices:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Spices1.jpg/1280px-Spices1.jpg",
  tvmTemple:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Padmanabhaswamy_Temple_Thiruvananthapuram.jpg/1280px-Padmanabhaswamy_Temple_Thiruvananthapuram.jpg",
};

const DRIVER = {
  contactName: "Shehi Nihal (driver)",
  contactPhone: "+91 97461 63935",
};

export const mockPlaces: Record<string, Place[]> = {
  // ─────────────────────────── DAY 1 · Train down ───────────────────────────
  "kerala-d1": [
    {
      id: "kerala-d1-p1",
      index: 1,
      name: "PBR–KCVL Express · Vasai Road",
      openingHours: "Departs 09:55 AM",
      visitStart: "09:55 AM",
      visitEnd: "—",
      photoUrl: IMG.backwaters,
      placeCategory: "transport",
      description:
        "Boarded the weekly PBR–KCVL Express from Vasai Road for the ~24-hour haul down the Konkan coast to Kerala.",
      actualCost: "₹11,238 (going fare, group of 6)",
      honestNote:
        "Long but scenic. Carry snacks, medicines and water, and pack light for the overnight leg.",
    },
  ],

  // ───────────────────────── DAY 2 · Aluva → Munnar ─────────────────────────
  "kerala-d2": [
    {
      id: "kerala-d2-p1",
      index: 1,
      name: "Aluva Railway Station",
      lat: 10.108,
      lng: 76.3563,
      openingHours: "—",
      visitStart: "10:25 AM",
      visitEnd: "11:00 AM",
      photoUrl: IMG.aluva,
      placeCategory: "transport",
      description:
        "Hopped off at Aluva and met our cab — an AC Ertiga with driver Shehi Nihal, our ride for the entire loop.",
      travelToNext: {
        mode: "drive",
        duration: "~2 hrs",
        distance: "~50 km",
        directionsUrl: "https://www.google.com/maps/dir/Aluva+Railway+Station/Kothamangalam",
        note: "Same driver & cab (AC Ertiga) for all 8 days — ₹18,500 package, billed pickup-to-pickup back to Aluva, +₹18/km after 800 km.",
        costEstimate: "₹18,500 pkg",
        ...DRIVER,
      },
    },
    {
      id: "kerala-d2-p2",
      index: 2,
      name: "Lunch · Kothamangalam",
      lat: 10.0626,
      lng: 76.633,
      openingHours: "—",
      visitStart: "1:00 PM",
      visitEnd: "2:00 PM",
      photoUrl: IMG.munnar,
      placeCategory: "restaurant",
      description:
        "Lunch stop in Kothamangalam, the last proper town before the NH-85 climb into the Western Ghats.",
      actualCost: "₹1,205",
      travelToNext: {
        mode: "drive",
        duration: "~2 hrs",
        distance: "~45 km",
        directionsUrl: "https://www.google.com/maps/dir/Kothamangalam/Cheeyappara+Waterfalls",
      },
    },
    {
      id: "kerala-d2-p3",
      index: 3,
      name: "Cheeyappara Waterfalls",
      lat: 10.0541,
      lng: 76.8299,
      openingHours: "Open access",
      visitStart: "4:00 PM",
      visitEnd: "4:20 PM",
      photoUrl: IMG.cheeyappara,
      placeCategory: "attraction",
      description:
        "A seven-tiered roadside cascade on the climb to Munnar — a quick 15-minute photo stop, no trekking, free.",
      travelToNext: {
        mode: "drive",
        duration: "~1.5 hrs",
        distance: "~40 km",
        directionsUrl: "https://www.google.com/maps/dir/Cheeyappara+Waterfalls/Munnar",
      },
    },
    {
      id: "kerala-d2-p4",
      index: 4,
      name: "Cliff Swing Viewpoint",
      lat: 10.03,
      lng: 76.92,
      openingHours: "Daytime",
      visitStart: "5:00 PM",
      visitEnd: "5:30 PM",
      photoUrl: IMG.munnar,
      placeCategory: "attraction",
      description:
        "A roadside giant cliff-swing over a valley drop, right on the way up to the stay — big swing, big view, great photos.",
      actualCost: "₹1,500 (for 3 of us · ₹500 each)",
      yourRating: 4,
      wouldReturn: "yes",
      honestNote: "Only three of us did it — ₹500 a head. Quick, fun adrenaline stop on the drive in.",
    },
    {
      id: "kerala-d2-p5",
      index: 5,
      name: "Calm Shack Farm Stay · Check-in",
      lat: 10.0096,
      lng: 76.9707,
      googleMapsUrl: "https://maps.app.goo.gl/WQkq2gq8yYUmPJREA",
      openingHours: "Check-in afternoon",
      visitStart: "5:30 PM",
      visitEnd: "6:30 PM",
      photoUrl: IMG.munnar,
      placeCategory: "hotel",
      description:
        "Checked into the farm stay — exotic-fruit orchard, homemade breakfast, free run of the grounds. (Full details in the stay card below.)",
    },
    {
      id: "kerala-d2-p6",
      index: 6,
      name: "Fish Farm Visit",
      lat: 10.02,
      lng: 76.97,
      openingHours: "—",
      visitStart: "—",
      visitEnd: "—",
      photoUrl: IMG.munnar,
      placeCategory: "attraction",
      description:
        "A working fish farm near Munnar — a hands-on, kid-friendly stop the family enjoyed.",
      actualCost: "₹3,300",
    },
    {
      id: "kerala-d2-p7",
      index: 7,
      name: "Munnar Town · Bazaar Road",
      lat: 10.0967,
      lng: 77.0272,
      openingHours: "Shops till ~9 PM",
      visitStart: "7:00 PM",
      visitEnd: "9:00 PM",
      photoUrl: IMG.munnar,
      placeCategory: "market",
      description:
        "Evening stroll down Bazaar Road — Munnar tea, fresh cardamom and homemade chocolate shops — then dinner in town.",
      actualCost: "₹1,709 (dinner)",
    },
  ],

  // ──────────────────────── DAY 3 · Munnar slow day ────────────────────────
  "kerala-d3": [
    {
      id: "kerala-d3-p1",
      index: 1,
      name: "Chithirapuram Heritage Walk",
      lat: 10.027,
      lng: 77.049,
      openingHours: "Open access",
      visitStart: "10:00 AM",
      visitEnd: "11:30 AM",
      photoUrl: IMG.munnar,
      placeCategory: "attraction",
      description:
        "Old British planters' cottages, stone-paved lanes and Christ Church (1898) — a quiet, atmospheric counterpoint to busy Munnar town.",
      honestNote: "Lovely slow morning in the mist. Far nicer than the commercial Munnar tourist belt.",
    },
    {
      id: "kerala-d3-p2",
      index: 2,
      name: "Ripple Tea Museum",
      lat: 10.0876,
      lng: 77.0606,
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Ripple+Tea+Museum+Munnar",
      openingHours: "9 AM – 5 PM",
      visitStart: "11:30 AM",
      visitEnd: "1:00 PM",
      photoUrl: IMG.munnar,
      placeCategory: "attraction",
      description:
        "Tea museum with a working-factory view and tasting at Moolakadai (KDHP House) in Munnar town — fully indoor, a great monsoon rain-backup.",
      actualCost: "₹920",
    },
    {
      id: "kerala-d3-p3",
      index: 3,
      name: "Lunch · Munnar Town",
      lat: 10.0889,
      lng: 77.0606,
      openingHours: "—",
      visitStart: "1:00 PM",
      visitEnd: "2:30 PM",
      photoUrl: IMG.munnar,
      placeCategory: "restaurant",
      description: "Kerala lunch in Munnar town.",
      actualCost: "₹1,395",
    },
    {
      id: "kerala-d3-p4",
      index: 4,
      name: "The Raga, Anachal · Kathakali & Kalaripayattu",
      lat: 10.03,
      lng: 77.045,
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The+Raga+Anachal+Munnar",
      openingHours: "Evening shows",
      visitStart: "5:00 PM",
      visitEnd: "6:30 PM",
      photoUrl: IMG.kathakali,
      placeCategory: "attraction",
      description:
        "Evening Kathakali dance-drama and a Kalaripayattu martial-art show at Raga's traditional-arts theatre in Anachal.",
      actualCost: "₹6,000",
      yourRating: 4,
      wouldReturn: "yes",
      honestNote:
        "Raga's Kathakali is genuinely good — recommended. Tip: save Kalaripayattu for Thekkady (cheaper there). And know that Thekkady's Kathakali is ultra-authentic — great, but it can feel slow if you're new to it.",
    },
    {
      id: "kerala-d3-p5",
      index: 5,
      name: "Group Dinner · Munnar",
      lat: 10.0967,
      lng: 77.0272,
      openingHours: "—",
      visitStart: "7:30 PM",
      visitEnd: "9:00 PM",
      photoUrl: IMG.munnar,
      placeCategory: "restaurant",
      description: "Big group dinner back in Munnar town.",
      actualCost: "₹3,086",
    },
  ],

  // ───────────────────── DAY 4 · Munnar → Thekkady ─────────────────────
  "kerala-d4": [
    {
      id: "kerala-d4-p1",
      index: 1,
      name: "Vandiperiyar Tea Route",
      lat: 9.578,
      lng: 77.078,
      openingHours: "—",
      visitStart: "8:00 AM",
      visitEnd: "11:00 AM",
      photoUrl: IMG.vandiperiyar,
      placeCategory: "attraction",
      description:
        "The scenic cardamom-and-tea road from Munnar to Thekkady that locals recommend over the highway — the drive itself is the experience.",
      travelToNext: {
        mode: "drive",
        duration: "~1 hr",
        distance: "~30 km",
        directionsUrl: "https://www.google.com/maps/dir/Vandiperiyar/Thekkady",
        note: "Scenic cardamom-hill drive.",
        ...DRIVER,
      },
    },
    {
      id: "kerala-d4-p2",
      index: 2,
      name: "Periyar Inn Homestay · Check-in",
      lat: 9.604,
      lng: 77.168,
      googleMapsUrl: "https://maps.app.goo.gl/V4cyBPuDTB15QdhbA",
      openingHours: "Check-in after 12 noon",
      visitStart: "11:30 AM",
      visitEnd: "12:30 PM",
      photoUrl: IMG.thekkady,
      placeCategory: "hotel",
      description: "Checked in at Kumily, then lunch. (Stay details below.)",
    },
    {
      id: "kerala-d4-p3",
      index: 3,
      name: "Spice Plantation Tour",
      lat: 9.59,
      lng: 77.16,
      openingHours: "9 AM – 5 PM",
      visitStart: "2:30 PM",
      visitEnd: "4:00 PM",
      photoUrl: IMG.spices,
      placeCategory: "attraction",
      description:
        "Guided walk through cardamom, black pepper, cinnamon, nutmeg and vanilla at a family-run plantation in spice-capital Thekkady.",
      honestNote:
        "Worth it for the walk — but don't buy spices at the plantation shop. Buy from the Kumily town shops instead; same spices, far cheaper.",
    },
    {
      id: "kerala-d4-p4",
      index: 4,
      name: "Periyar Jungle Jeep Safari",
      lat: 9.6,
      lng: 77.18,
      openingHours: "Morning & afternoon slots",
      visitStart: "4:00 PM",
      visitEnd: "6:00 PM",
      photoUrl: IMG.periyar,
      placeCategory: "trek",
      description:
        "Off-road jungle jeep safari on the Periyar fringe — steep bumpy climbs, forest tracks and viewpoints.",
      actualCost: "₹3,500",
      yourRating: 5,
      wouldReturn: "yes",
      honestNote: "Crazy fun — the most thrilling thing we did on the whole trip. Hold on tight.",
    },
    {
      id: "kerala-d4-p5",
      index: 5,
      name: "Elephant Interaction",
      lat: 9.595,
      lng: 77.162,
      openingHours: "—",
      visitStart: "6:00 PM",
      visitEnd: "7:00 PM",
      photoUrl: IMG.periyar,
      placeCategory: "attraction",
      description:
        "Elephant ride plus bathing and feeding the elephant — a hit with the family.",
      actualCost: "₹3,000",
    },
  ],

  // ───────────────────── DAY 5 · Thekkady → Alleppey ─────────────────────
  "kerala-d5": [
    {
      id: "kerala-d5-p1",
      index: 1,
      name: "Chemmoth Sree Bala Subramania Swamy Temple (Munch Murugan)",
      lat: 9.498,
      lng: 76.339,
      googleMapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Chemmoth+Sree+Bala+Subramania+Swamy+Temple+Alappuzha",
      openingHours: "Morning & evening darshan",
      visitStart: "5:30 PM",
      visitEnd: "6:30 PM",
      photoUrl: IMG.tvmTemple,
      placeCategory: "temple",
      description:
        "A Subramanya (Murugan) temple in Alappuzha town, locally known as the 'Munch Murugan' temple — a calm stop after the long drive down from the hills.",
      travelToNext: {
        mode: "drive",
        duration: "~20 min",
        distance: "~8 km",
        directionsUrl: "https://www.google.com/maps/dir/Alappuzha/Palmy+Lake+Resort",
        note: "Long ~140 km westward drive from Thekkady's hills to the coast earlier in the day; same driver.",
        ...DRIVER,
      },
    },
    {
      id: "kerala-d5-p2",
      index: 2,
      name: "Palmy Lake Resort · Check-in (boat-only)",
      lat: 9.5201,
      lng: 76.3568,
      googleMapsUrl: "https://maps.app.goo.gl/C7c8zZtS46yfmQ4v8",
      openingHours: "Check-in afternoon",
      visitStart: "7:00 PM",
      visitEnd: "—",
      photoUrl: IMG.alappuzhaBoat,
      placeCategory: "hotel",
      description:
        "Reached the boat jetty and crossed by the resort's boat to the four-room water stay in the middle of the backwaters. (Stay details below.)",
    },
  ],

  // ──────────────── DAY 6 · Alleppey → Jatayu → Varkala ────────────────
  "kerala-d6": [
    {
      id: "kerala-d6-p1",
      index: 1,
      name: "Alleppey Backwater Shikara Ride",
      lat: 9.505,
      lng: 76.36,
      openingHours: "Morning",
      visitStart: "8:00 AM",
      visitEnd: "10:30 AM",
      photoUrl: IMG.alappuzhaBoat,
      placeCategory: "attraction",
      description:
        "Morning canoe/shikara glide through the narrow village canals — coir-making, toddy taps and kingfishers, on water too narrow for houseboats.",
      actualCost: "₹2,400 (+ ₹475 meal)",
      yourRating: 5,
      wouldReturn: "yes",
      honestNote:
        "This is the move — skip the houseboat and do a shikara. Quiet, intimate, and you actually see backwater village life.",
      travelToNext: {
        mode: "drive",
        duration: "~2.5 hrs",
        distance: "~80 km",
        directionsUrl: "https://www.google.com/maps/dir/Alappuzha/Jatayu+Earth+Center",
        ...DRIVER,
      },
    },
    {
      id: "kerala-d6-p2",
      index: 2,
      name: "Jatayu Earth's Center",
      lat: 8.8608,
      lng: 76.8665,
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Jatayu+Earth+Center+Chadayamangalam",
      openingHours: "10 AM – 5 PM",
      visitStart: "12:30 PM",
      visitEnd: "2:30 PM",
      photoUrl: IMG.backwaters,
      placeCategory: "attraction",
      description:
        "A sculpture park built around the world's largest bird statue — the 200-ft Jatayu from the Ramayana. Cable car up the hill (elder-friendly), then walk around the giant sculpture.",
      actualCost: "₹3,326",
      yourRating: 4,
      wouldReturn: "maybe",
      honestNote:
        "Did the cable car and the sculpture up top — skipped the 6D theatre and adventure park. The cable-car views are the highlight.",
      travelToNext: {
        mode: "drive",
        duration: "~1.5 hrs",
        distance: "~50 km",
        directionsUrl: "https://www.google.com/maps/dir/Jatayu+Earth+Center/Varkala",
        ...DRIVER,
      },
    },
    {
      id: "kerala-d6-p3",
      index: 3,
      name: "Beach House Varkala · Private Beach",
      lat: 8.776,
      lng: 76.699,
      googleMapsUrl: "https://maps.app.goo.gl/F6YLEe41uagMsiF36",
      openingHours: "Check-in evening",
      visitStart: "6:00 PM",
      visitEnd: "—",
      photoUrl: IMG.varkala,
      placeCategory: "beach",
      description:
        "Checked into the private-beach stay on the quiet Chilakkoor/Ayiroor coast north of Varkala — sunset and dinner by the water. (Stay details below.)",
      actualCost: "₹2,300 (dinner)",
    },
  ],

  // ───────────────── DAY 7 · Varkala → Trivandrum ─────────────────
  "kerala-d7": [
    {
      id: "kerala-d7-p1",
      index: 1,
      name: "Varkala Cliff & Papanasham Beach",
      lat: 8.7383,
      lng: 76.7066,
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Varkala+Cliff",
      openingHours: "Open access",
      visitStart: "9:00 AM",
      visitEnd: "10:30 AM",
      photoUrl: IMG.varkala,
      placeCategory: "beach",
      description:
        "The famous red-laterite cliff with cafés along the top and the holy Papanasham black-sand beach below.",
      honestNote:
        "In June monsoon many cliff cafés are shut and the sea has a strong undertow — atmospheric and empty, but not for swimming.",
    },
    {
      id: "kerala-d7-p2",
      index: 2,
      name: "Kappil Beach View Point",
      lat: 8.766,
      lng: 76.7,
      openingHours: "Open access",
      visitStart: "11:00 AM",
      visitEnd: "11:45 AM",
      photoUrl: IMG.varkala,
      placeCategory: "beach",
      description:
        "The quiet spot just north of Varkala where the Kappil backwater bends right up to the sea — a calm viewpoint away from the cliff crowds.",
      travelToNext: {
        mode: "drive",
        duration: "~1.5 hrs",
        distance: "~50 km",
        directionsUrl: "https://www.google.com/maps/dir/Kappil+Beach+Varkala/Thiruvananthapuram",
        ...DRIVER,
      },
    },
    {
      id: "kerala-d7-p3",
      index: 3,
      name: "Lulu Mall · Trivandrum",
      lat: 8.515,
      lng: 76.8978,
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Lulu+Mall+Thiruvananthapuram",
      openingHours: "10 AM – 10 PM",
      visitStart: "6:00 PM",
      visitEnd: "9:00 PM",
      photoUrl: IMG.backwaters,
      placeCategory: "market",
      description:
        "After checking into the city Airbnb, an easy evening at the big modern mall — shopping and a genuinely good food court.",
      honestNote:
        "Lulu Mall was surprisingly great — a relaxed family evening and a welcome break from temples and drives.",
    },
  ],

  // ───────── DAY 8 · Trivandrum temple, beaches & sunset ─────────
  "kerala-d8": [
    {
      id: "kerala-d8-p1",
      index: 1,
      name: "Sree Padmanabhaswamy Temple",
      lat: 8.4828,
      lng: 76.9447,
      googleMapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Sree+Padmanabhaswamy+Temple+Thiruvananthapuram",
      openingHours: "Darshan slots from early morning",
      visitStart: "6:30 AM",
      visitEnd: "9:00 AM",
      photoUrl: IMG.padmanabha,
      placeCategory: "temple",
      description:
        "The world's wealthiest temple. Strict dress code — mundu for men (no shirt inside), saree/salwar for women; ID required, phones forbidden, Hindu-only entry.",
      actualCost: "₹980 (temple taxi)",
      yourRating: 5,
      wouldReturn: "yes",
      honestNote:
        "Go early to beat the queue. Phones aren't allowed inside — leave them in the cab. Dress code is enforced.",
    },
    {
      id: "kerala-d8-p2",
      index: 2,
      name: "Kovalam · Lighthouse Beach",
      lat: 8.3853,
      lng: 76.9791,
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Lighthouse+Beach+Kovalam",
      openingHours: "Open access",
      visitStart: "4:00 PM",
      visitEnd: "5:30 PM",
      photoUrl: IMG.kovalam,
      placeCategory: "beach",
      description:
        "Kovalam's iconic crescent with the candy-striped lighthouse — busy in season, moody and uncrowded in monsoon.",
      honestNote:
        "Rough monsoon sea, so no swimming — but a great walk before heading to the Azhimala sunset just south.",
    },
    {
      id: "kerala-d8-p3",
      index: 3,
      name: "Azhimala Shiva Temple (sunset)",
      lat: 8.3568,
      lng: 76.987,
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Azhimala+Shiva+Temple",
      openingHours: "Best at sunset",
      visitStart: "6:00 PM",
      visitEnd: "7:30 PM",
      photoUrl: IMG.kovalam,
      placeCategory: "temple",
      description:
        "A 58-ft Gangadhareshwara Shiva statue on a cliff over the Arabian Sea, with a detailed sculpted cave shrine below. West-facing — golden hour is the shot.",
      actualCost: "₹500 (cave shrine)",
      yourRating: 5,
      wouldReturn: "yes",
      honestNote:
        "Time it for sunset — the statue faces west. The carved cave with the detailed statues below is worth the ₹500 and easy to miss.",
    },
  ],

  // ───────────────────── DAY 9 · Train home ─────────────────────
  "kerala-d9": [
    {
      id: "kerala-d9-p1",
      index: 1,
      name: "Thiruvananthapuram Central",
      lat: 8.487,
      lng: 76.9526,
      openingHours: "—",
      visitStart: "Afternoon",
      visitEnd: "—",
      photoUrl: IMG.tvmTemple,
      placeCategory: "transport",
      description:
        "The cab dropped us at Trivandrum Central (the final pickup-to-pickup leg, settled here) and we boarded the long train back to Mumbai.",
      actualCost: "₹10,608 (return fare, group of 6)",
      honestNote:
        "Heads up: we got a ₹5,060 TTE fine on the return — double-check every passenger's reservation and ID before boarding.",
    },
  ],

  // ───────────────────── DAY 10 · Home ─────────────────────
  "kerala-d10": [
    {
      id: "kerala-d10-p1",
      index: 1,
      name: "Home · Mumbai",
      openingHours: "—",
      visitStart: "Morning",
      visitEnd: "—",
      photoUrl: IMG.backwaters,
      placeCategory: "transport",
      description:
        "Pulled into Mumbai — 10 days, five bases and the full north-to-south sweep of Kerala done.",
    },
  ],
};
