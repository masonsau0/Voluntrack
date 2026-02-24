import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp 
} from "firebase/firestore";

const NEW_OPPORTUNITIES = [
  {
    title: "Trinity Bellwoods Park Clean-Up",
    organization: "Toronto Parks Foundation",
    category: "Environment",
    commitment: "One-time",
    hours: 3,
    spotsLeft: 12,
    totalSpots: 20,
    location: "790 Queen St W, Toronto, ON M6J 1G3",
    description: "Help maintain one of Toronto's most beloved green spaces by picking up litter, raking leaves, and keeping pathways clear.",
    image: "/event-park-cleanup.png",
    featured: true,
    skills: ["Outdoor Work", "Teamwork"],
    startTime: new Date("2026-04-12T10:00:00"),
    endTime: new Date("2026-04-12T13:00:00")
  },
  {
    title: "Community Garden Volunteer",
    organization: "FoodShare Toronto",
    category: "Environment",
    commitment: "Monthly",
    hours: 4,
    spotsLeft: 10,
    totalSpots: 15,
    location: "90 Croatia St, Toronto, ON M6H 1K8",
    description: "Assist in maintaining our community garden, helping with planting, weeding, and composting to support local food security.",
    image: "/event-park-cleanup.png",
    featured: false,
    skills: ["Gardening", "Physical Work"],
    startTime: new Date("2026-05-10T09:00:00"),
    endTime: new Date("2026-05-10T13:00:00")
  },
  {
    title: "Ravine Restoration Project",
    organization: "Toronto Nature Conservancy",
    category: "Environment",
    commitment: "Weekly",
    hours: 4,
    spotsLeft: 15,
    totalSpots: 25,
    location: "Don Valley, Toronto, ON",
    description: "Join us in restoring the natural beauty of the Don Valley ravines by removing invasive species and planting native flora.",
    image: "/event-park-cleanup.png",
    featured: true,
    skills: ["Outdoor Work", "Environmental Conservation"],
    startTime: new Date("2026-04-15T08:00:00"),
    endTime: new Date("2026-04-15T12:00:00")
  },
  {
    title: "Beach Cleanup Initiative",
    organization: "Great Lakes Conservation",
    category: "Environment",
    commitment: "Weekly",
    hours: 3,
    spotsLeft: 20,
    totalSpots: 40,
    location: "Woodbine Beach, Toronto, ON",
    description: "Help keep our beaches clean and safe for everyone. Join our weekly cleanup event at Woodbine Beach.",
    image: "/event-park-cleanup.png",
    featured: false,
    skills: ["Outdoor Work", "Teamwork"],
    startTime: new Date("2026-04-20T10:00:00"),
    endTime: new Date("2026-04-20T13:00:00")
  },
  {
    title: "Tree Planting Campaign",
    organization: "LEAF Toronto",
    category: "Environment",
    commitment: "One-time",
    hours: 6,
    spotsLeft: 50,
    totalSpots: 100,
    location: "Various Parks, Toronto, ON",
    description: "Help expand Toronto's urban forest. We are planting hundreds of trees across various city parks this season.",
    image: "/event-park-cleanup.png",
    featured: false,
    skills: ["Physical Work", "Planting"],
    startTime: new Date("2026-05-02T09:00:00"),
    endTime: new Date("2026-05-02T15:00:00")
  },
  {
    title: "Urban Wildlife Monitoring",
    organization: "Toronto Zoo Conservation",
    category: "Environment",
    commitment: "Monthly",
    hours: 2,
    spotsLeft: 8,
    totalSpots: 12,
    location: "GTA Region, Toronto, ON",
    description: "Assist biologists in monitoring local wildlife populations in urban areas. Training will be provided.",
    image: "/event-park-cleanup.png",
    featured: false,
    skills: ["Observation", "Data Entry"],
    startTime: new Date("2026-06-01T18:00:00"),
    endTime: new Date("2026-06-01T20:00:00")
  },
  {
    title: "Pollinator Garden Workshop",
    organization: "David Suzuki Foundation",
    category: "Environment",
    commitment: "One-time",
    hours: 4,
    spotsLeft: 6,
    totalSpots: 12,
    location: "High Park, Toronto, ON",
    description: "Learn how to create habitats for bees and butterflies. Hands-on workshop in the heart of High Park.",
    image: "/event-park-cleanup.png",
    featured: false,
    skills: ["Gardening", "Teaching"],
    startTime: new Date("2026-05-15T13:00:00"),
    endTime: new Date("2026-05-15T17:00:00")
  },
  {
    title: "River Cleanup & Kayak Tour",
    organization: "Paddle Toronto",
    category: "Environment",
    commitment: "One-time",
    hours: 4,
    spotsLeft: 10,
    totalSpots: 20,
    location: "Humber River, Toronto, ON",
    description: "Combine environmental action with adventure. Clean up the Humber River from the seat of a kayak.",
    image: "/event-park-cleanup.png",
    featured: true,
    skills: ["Kayaking", "Environmental Action"],
    startTime: new Date("2026-06-20T09:00:00"),
    endTime: new Date("2026-06-20T13:00:00")
  },
  {
    title: "Food Bank Sorting & Distribution",
    organization: "Daily Bread Food Bank",
    category: "Education",
    commitment: "Weekly",
    hours: 4,
    spotsLeft: 8,
    totalSpots: 15,
    location: "191 New Toronto St, Toronto, ON M8V 2E7",
    description: "Help sort and distribute food donations to families in need. A vital role in our daily operations.",
    image: "/event-volunteer-fair.png",
    featured: true,
    skills: ["Organization", "Teamwork"],
    startTime: new Date("2026-04-10T08:00:00"),
    endTime: new Date("2026-04-10T12:00:00")
  },
  {
    title: "Habitat for Humanity Build Day",
    organization: "Habitat for Humanity GTA",
    category: "Education",
    commitment: "One-time",
    hours: 7,
    spotsLeft: 25,
    totalSpots: 40,
    location: "Various GTA, Toronto, ON",
    description: "Help build homes for families in need of affordable housing. No construction experience required.",
    image: "/event-volunteer-fair.png",
    featured: true,
    skills: ["Physical Work", "Construction"],
    startTime: new Date("2026-05-20T08:00:00"),
    endTime: new Date("2026-05-20T15:00:00")
  },
  {
    title: "Hospital Patient Companion",
    organization: "Toronto General Hospital",
    category: "Healthcare",
    commitment: "Weekly",
    hours: 4,
    spotsLeft: 5,
    totalSpots: 10,
    location: "200 Elizabeth St, Toronto, ON M5G 2C4",
    description: "Provide companionship to patients, offering support and a friendly face during their stay.",
    image: "/event-hospital-volunteer.png",
    featured: false,
    skills: ["Communication", "Empathy"],
    startTime: new Date("2026-04-14T13:00:00"),
    endTime: new Date("2026-04-14T17:00:00")
  },
  {
    title: "Animal Shelter Dog Walker",
    organization: "Toronto Humane Society",
    category: "Animal Welfare",
    commitment: "Weekly",
    hours: 2,
    spotsLeft: 20,
    totalSpots: 30,
    location: "11 River St, Toronto, ON M5A 4C2",
    description: "Help exercise our shelter dogs and give them the outdoor time they love.",
    image: "/event-animal-shelter.png",
    featured: true,
    skills: ["Animal Handling", "Patience"],
    startTime: new Date("2026-04-18T10:00:00"),
    endTime: new Date("2026-04-18T12:00:00")
  },
  {
    title: "Youth Tutoring Program",
    organization: "Big Brothers Big Sisters",
    category: "Education",
    commitment: "Weekly",
    hours: 3,
    spotsLeft: 6,
    totalSpots: 10,
    location: "3005 Danforth Ave, Toronto, ON M4C 1M9",
    description: "Provide academic support to youth, helping them build confidence and achieve their goals.",
    image: "/event-youth-mentorship.png",
    featured: false,
    skills: ["Teaching", "Mentoring"],
    startTime: new Date("2026-04-13T16:00:00"),
    endTime: new Date("2026-04-13T19:00:00")
  },
  {
    title: "ESL Conversation Partner",
    organization: "Toronto Public Library",
    category: "Education",
    commitment: "Weekly",
    hours: 1.5,
    spotsLeft: 8,
    totalSpots: 12,
    location: "789 Yonge St, Toronto, ON M4W 2G8",
    description: "Help newcomers practice their English conversation skills in a supportive, informal setting.",
    image: "/event-youth-mentorship.png",
    featured: false,
    skills: ["Communication", "Patience"],
    startTime: new Date("2026-04-16T18:00:00"),
    endTime: new Date("2026-04-16T19:30:00")
  },
  {
    title: "Community Mural Project",
    organization: "Arts for All Toronto",
    category: "Arts & Culture",
    commitment: "One-time",
    hours: 6,
    spotsLeft: 15,
    totalSpots: 20,
    location: "1550 St Clair Ave W, Toronto, ON M6E 1C9",
    description: "Help us paint a new community mural celebrating local heritage and diversity.",
    image: "/event-art-workshop.png",
    featured: false,
    skills: ["Art", "Collaboration"],
    startTime: new Date("2026-06-05T10:00:00"),
    endTime: new Date("2026-06-05T16:00:00")
  },
  {
    title: "Theatre Production Assistant",
    organization: "Young People's Theatre",
    category: "Arts & Culture",
    commitment: "Monthly",
    hours: 4,
    spotsLeft: 12,
    totalSpots: 20,
    location: "165 Front St E, Toronto, ON M5A 3Z4",
    description: "Support our backstage team during youth theatre productions. Learn about theatre magic!",
    image: "/event-art-workshop.png",
    featured: false,
    skills: ["Organization", "Creativity"],
    startTime: new Date("2026-05-15T18:00:00"),
    endTime: new Date("2026-05-15T22:00:00")
  },
  {
    title: "Senior Tech Support",
    organization: "Reena Foundation",
    category: "Senior Care",
    commitment: "Weekly",
    hours: 2,
    spotsLeft: 4,
    totalSpots: 8,
    location: "927 Clark Ave W, Thornhill, ON L4J 8G6",
    description: "Help seniors navigate technology, from smartphones to video calls with family.",
    image: "/event-youth-mentorship.png",
    featured: false,
    skills: ["Tech Saavy", "Patience"],
    startTime: new Date("2026-04-11T14:00:00"),
    endTime: new Date("2026-04-11T16:00:00")
  },
  {
    title: "Youth Coding Workshop Mentor",
    organization: "Ladies Learning Code",
    category: "Education",
    commitment: "Monthly",
    hours: 5,
    spotsLeft: 3,
    totalSpots: 5,
    location: "483 Queen St W, Toronto, ON M5V 2A9",
    description: "Mentor young learners as they build their first websites. Programming knowledge required.",
    image: "/event-volunteer-fair.png",
    featured: true,
    skills: ["Coding", "Mentoring"],
    startTime: new Date("2026-05-30T10:00:00"),
    endTime: new Date("2026-05-30T15:00:00")
  }
];

export async function GET() {
  try {
    const results = {
      organizationsCreated: 0,
      opportunitiesCreated: 0,
      errors: [] as string[],
    };

    const orgsRef = collection(db, "volunteer_orgs");
    const oppsRef = collection(db, "opportunities");

    for (const oppData of NEW_OPPORTUNITIES) {
      try {
        // 1. Check if organization exists
        let orgId = "";
        const orgQuery = query(orgsRef, where("name", "==", oppData.organization));
        const orgSnapshot = await getDocs(orgQuery);

        if (orgSnapshot.empty) {
          // Create new organization
          const newOrg = await addDoc(orgsRef, {
            name: oppData.organization,
            createdAt: Timestamp.now(),
            createdBy: "system-seed",
          });
          orgId = newOrg.id;
          results.organizationsCreated++;
        } else {
          orgId = orgSnapshot.docs[0].id;
        }

        // 2. Add Opportunity
        const startTime = Timestamp.fromDate(oppData.startTime);
        const endTime = Timestamp.fromDate(oppData.endTime);
        const dateISO = oppData.startTime.toISOString().split('T')[0];
        const dateStr = oppData.startTime.toLocaleDateString("en-US", { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
        const timeStr = `${oppData.startTime.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' })} – ${oppData.endTime.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' })}`;

        await addDoc(oppsRef, {
          title: oppData.title,
          organization: oppData.organization,
          orgId: orgId,
          description: oppData.description,
          startTime: startTime,
          endTime: endTime,
          date: dateStr,
          dateISO: dateISO,
          time: timeStr,
          location: oppData.location,
          hours: oppData.hours,
          spotsLeft: oppData.spotsLeft,
          totalSpots: oppData.totalSpots,
          category: oppData.category,
          commitment: oppData.commitment,
          skills: oppData.skills,
          featured: oppData.featured,
          image: oppData.image,
          status: "open",
          createdAt: Timestamp.now(),
        });

        results.opportunitiesCreated++;
      } catch (err: any) {
        results.errors.push(`Failed to add "${oppData.title}": ${err.message}`);
      }
    }

    return NextResponse.json({
      message: "Seeding complete",
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Seeding failed", details: error.message },
      { status: 500 }
    );
  }
}
