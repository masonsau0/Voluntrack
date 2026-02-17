/**
 * Shared sample applications data for Dashboard and Applications pages.
 * Both pages use this source to ensure consistent information.
 * Replace with Firestore queries when backend is ready.
 */

export interface Application {
  id: number
  title: string
  organization: string
  location: string
  date: string
  dateISO?: string
  appliedDate: string
  hours: string
  category: string
  status: "pending" | "approved" | "denied" | "completed"
  description: string
  skills: string[]
  spotsLeft: number
  totalSpots: number
  commitment: string
  image: string
}

export const sampleApplications: Application[] = [
  {
    id: 1,
    title: "Trinity Bellwoods Park: Park Clean-Up",
    organization: "Toronto Parks Foundation",
    location: "790 Queen St W, Toronto, ON M6J 1G3",
    date: "Saturday, July 30, 2025, 10:00 AM – 12:00 PM",
    dateISO: "2025-07-30",
    appliedDate: "2025-01-15",
    hours: "2 Hr",
    category: "Environment",
    status: "pending",
    description: "Join us for a community park clean-up at Trinity Bellwoods Park. Help maintain one of Toronto's most beloved green spaces by picking up litter, raking leaves, and keeping pathways clear.",
    skills: ["Outdoor Work", "Teamwork"],
    spotsLeft: 8,
    totalSpots: 20,
    commitment: "One-time",
    image: "/event-volunteer-fair.png",
  },
  {
    id: 2,
    title: "Food Bank Sorting",
    organization: "Daily Bread Food Bank",
    location: "125 Main St, Toronto, ON M4C 1A1",
    date: "Saturday, June 14, 2025, 7:00 AM – 9:00 AM",
    dateISO: "2025-06-14",
    appliedDate: "2025-01-10",
    hours: "2 Hr",
    category: "Education",
    status: "completed",
    description: "Help sort and distribute food donations to families in need. Tasks include organizing donations, checking expiry dates, and packing food hampers for distribution.",
    skills: ["Organization", "Physical Work", "Teamwork"],
    spotsLeft: 15,
    totalSpots: 30,
    commitment: "Weekly",
    image: "/event-volunteer-fair.png",
  },
  {
    id: 3,
    title: "Community Garden Planting",
    organization: "FoodShare Toronto",
    location: "456 Oak St, Toronto, ON M5H 2N2",
    date: "Sunday, July 13, 2025, 12:00 AM – 2:00 PM",
    dateISO: "2025-07-13",
    appliedDate: "2025-01-12",
    hours: "2 Hr",
    category: "Environment",
    status: "completed",
    description: "Help grow fresh vegetables for community food programs. Tasks include planting, weeding, watering, and harvesting. Learn urban farming techniques.",
    skills: ["Gardening", "Physical Work"],
    spotsLeft: 10,
    totalSpots: 20,
    commitment: "Monthly",
    image: "/event-park-cleanup.png",
  },
  {
    id: 4,
    title: "Hospital Volunteer Program",
    organization: "Toronto General Hospital",
    location: "200 Elizabeth St, Toronto, ON M5G 2C4",
    date: "Monday, August 4, 2025, 9:00 AM – 1:00 PM",
    dateISO: "2025-08-04",
    appliedDate: "2025-01-18",
    hours: "4 Hr",
    category: "Healthcare",
    status: "pending",
    description: "Provide friendly companionship to hospital patients. Duties include chatting, reading, playing games, and offering emotional support to patients and their families.",
    skills: ["Communication", "Empathy", "Patience"],
    spotsLeft: 5,
    totalSpots: 15,
    commitment: "Weekly",
    image: "/event-volunteer-fair.png",
  },
  {
    id: 5,
    title: "Youth Mentorship Session",
    organization: "Big Brothers Big Sisters",
    location: "100 Queen's Park, Toronto, ON M5S 2C6",
    date: "Wednesday, July 23, 2025, 3:00 PM – 5:00 PM",
    dateISO: "2025-07-23",
    appliedDate: "2025-01-05",
    hours: "2 Hr",
    category: "Education",
    status: "approved",
    description: "Mentor elementary and high school students in various subjects including math, science, and English. Help build confidence and academic skills in young learners.",
    skills: ["Teaching", "Communication", "Patience"],
    spotsLeft: 12,
    totalSpots: 25,
    commitment: "Weekly",
    image: "/event-youth-mentorship.png",
  },
  {
    id: 6,
    title: "Animal Shelter Helper",
    organization: "Toronto Humane Society",
    location: "821 Progress Ave, Toronto, ON M1H 2X4",
    date: "Saturday, August 9, 2025, 10:00 AM – 2:00 PM",
    dateISO: "2025-08-09",
    appliedDate: "2025-01-20",
    hours: "4 Hr",
    category: "Animal Welfare",
    status: "denied",
    description: "Walk dogs, socialize cats, and help with basic animal care. Experience the joy of helping shelter animals find their forever homes.",
    skills: ["Animal Handling", "Physical Fitness"],
    spotsLeft: 0,
    totalSpots: 20,
    commitment: "Weekly",
    image: "/event-animal-shelter.png",
  },
  {
    id: 7,
    title: "Senior Center Art Class Assistant",
    organization: "Toronto Senior Services",
    location: "55 Elm St, Toronto, ON M5G 1H1",
    date: "Thursday, July 17, 2025, 1:00 PM – 3:00 PM",
    dateISO: "2025-07-17",
    appliedDate: "2025-01-08",
    hours: "2 Hr",
    category: "Arts & Culture",
    status: "approved",
    description: "Assist seniors with art projects including painting, drawing, and crafts. Help create a fun and supportive creative environment for older adults.",
    skills: ["Art", "Communication", "Patience"],
    spotsLeft: 6,
    totalSpots: 12,
    commitment: "Weekly",
    image: "/event-volunteer-fair.png",
  },
  {
    id: 8,
    title: "Beach Cleanup Initiative",
    organization: "Lake Ontario Waterkeeper",
    location: "1561 Lake Shore Blvd W, Toronto, ON M6K 3C1",
    date: "Sunday, August 17, 2025, 8:00 AM – 11:00 AM",
    dateISO: "2025-08-17",
    appliedDate: "2025-01-22",
    hours: "3 Hr",
    category: "Environment",
    status: "pending",
    description: "Help keep Toronto's waterfront clean and beautiful. Collect litter and debris from the beach, learn about local ecosystems, and make a visible difference.",
    skills: ["Outdoor Work", "Teamwork"],
    spotsLeft: 25,
    totalSpots: 50,
    commitment: "One-time",
    image: "/event-volunteer-fair.png",
  },
]
