export type ProviderType = 'Fiber' | 'Cable' | '5G Home' | 'Satellite' | 'DSL'

export interface Provider {
  id: string
  name: string
  type: ProviderType
  tagline: string
  download: number // Mbps advertised max
  upload: number   // Mbps advertised max
  ping: number     // ms typical
  price: number    // $/mo starting
  rating: number   // out of 5
  data: string     // 'Unlimited' | 'X TB' etc
  availability: string
  pros: string[]
  affiliateUrl: string
  badge?: string   // e.g. "Editor's Pick", "Best Value", "Most Reliable"
}

export const providers: Provider[] = [
  {
    id: 'earthlink-fiber',
    name: 'EarthLink Fiber',
    type: 'Fiber',
    tagline: 'Fastest Speeds',
    download: 5000,
    upload: 5000,
    ping: 6,
    price: 160,
    rating: 4.5,
    data: 'Unlimited',
    availability: 'Growing metros',
    pros: ['Symmetrical speeds', 'No data caps', 'Low latency'],
    affiliateUrl: 'https://www.earthlink.net/internet/',
  },
  {
    id: 'xfinity',
    name: 'Xfinity',
    type: 'Cable',
    tagline: 'Wide Availability',
    download: 1200,
    upload: 35,
    ping: 18,
    price: 80,
    rating: 3.8,
    data: '1.2 TB',
    availability: 'Nationwide',
    pros: ['Wide availability', 'Fast download', 'Flexible plans'],
    affiliateUrl: 'https://www.xfinity.com/learn/internet-service',
  },
  {
    id: 'google-fiber',
    name: 'Google Fiber',
    type: 'Fiber',
    tagline: "Editor's Pick",
    download: 1000,
    upload: 1000,
    ping: 8,
    price: 70,
    rating: 4.8,
    data: 'Unlimited',
    availability: 'Select cities',
    pros: ['No contracts', 'Symmetrical speeds', 'No data caps'],
    affiliateUrl: 'https://fiber.google.com/',
    badge: "Editor's Pick",
  },
  {
    id: 'att-fiber',
    name: 'AT&T Fiber',
    type: 'Fiber',
    tagline: 'Best Fiber Value',
    download: 840,
    upload: 840,
    ping: 12,
    price: 80,
    rating: 4.6,
    data: 'Unlimited',
    availability: 'Major metros',
    pros: ['No equipment fee', 'Symmetrical speeds', 'Price lock guarantee'],
    affiliateUrl: 'https://www.att.com/internet/',
    badge: 'Best Fiber Value',
  },
  {
    id: 'verizon-fios',
    name: 'Verizon Fios',
    type: 'Fiber',
    tagline: 'Most Reliable',
    download: 880,
    upload: 880,
    ping: 10,
    price: 90,
    rating: 4.5,
    data: 'Unlimited',
    availability: 'Northeast US',
    pros: ['No contracts', 'Symmetrical speeds', 'Consistent speeds'],
    affiliateUrl: 'https://www.verizon.com/home/internet/',
  },
  {
    id: 'spectrum',
    name: 'Spectrum',
    type: 'Cable',
    tagline: 'No Contracts',
    download: 500,
    upload: 20,
    ping: 30,
    price: 70,
    rating: 3.7,
    data: 'Unlimited',
    availability: 'Nationwide',
    pros: ['No contracts', 'Free modem', 'Wide coverage'],
    affiliateUrl: 'https://www.spectrum.com/internet',
  },
  {
    id: 'cox',
    name: 'Cox',
    type: 'Cable',
    tagline: 'Reliable Cable',
    download: 250,
    upload: 15,
    ping: 22,
    price: 80,
    rating: 3.5,
    data: '1.25 TB',
    availability: 'Select markets',
    pros: ['Reliable network', 'Bundle options', 'Fast setup'],
    affiliateUrl: 'https://www.cox.com/residential/internet.html',
  },
  {
    id: 'tmobile-home',
    name: 'T-Mobile Home',
    type: '5G Home',
    tagline: 'Best Budget',
    download: 245,
    upload: 31,
    ping: 42,
    price: 50,
    rating: 3.9,
    data: 'Unlimited',
    availability: 'Nationwide',
    pros: ['No equipment fee', 'No contracts', 'Easy setup'],
    affiliateUrl: 'https://www.t-mobile.com/isp',
    badge: 'Best Budget',
  },
  {
    id: 'starlink',
    name: 'Starlink',
    type: 'Satellite',
    tagline: 'Best Satellite',
    download: 100,
    upload: 20,
    ping: 40,
    price: 120,
    rating: 4.1,
    data: 'Unlimited',
    availability: 'Rural & remote',
    pros: ['Rural coverage', 'No cable needed', 'Improving speeds'],
    affiliateUrl: 'https://www.starlink.com/',
  },
]

export const useCaseRecommendations = [
  {
    icon: '🎮',
    title: 'Gaming',
    description: 'Lowest ping + symmetric speeds reduce lag in competitive games.',
    providers: ['google-fiber', 'verizon-fios', 'earthlink-fiber'],
  },
  {
    icon: '💼',
    title: 'Remote Work / Video Calls',
    description: 'High upload speeds ensure smooth HD video calls and file sharing.',
    providers: ['att-fiber', 'google-fiber', 'verizon-fios'],
  },
  {
    icon: '📺',
    title: 'Streaming (4K)',
    description: 'At least 25 Mbps per screen — all these deliver well above that.',
    providers: ['xfinity', 'att-fiber', 'spectrum'],
  },
  {
    icon: '💰',
    title: 'Budget-Conscious',
    description: 'Solid speeds at $50–70/mo with no contracts required.',
    providers: ['tmobile-home', 'spectrum', 'xfinity'],
  },
  {
    icon: '🏡',
    title: 'Rural / No Cable Access',
    description: 'Works without ground cable infrastructure. Starlink reaches even the most remote areas.',
    providers: ['starlink', 'tmobile-home'],
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Large Households',
    description: 'Unlimited data + high speeds handle 10+ devices streaming simultaneously.',
    providers: ['att-fiber', 'google-fiber', 'xfinity'],
  },
]
