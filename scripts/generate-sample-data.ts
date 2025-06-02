import { createClient } from '@supabase/supabase-js'
import type { Database } from '../lib/database.types'

// Initialize Supabase client with service role key for admin operations
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // You'll need to add this to your .env.local
)

// Sample data arrays
const expertTitles = [
  'Senior Software Engineer',
  'Product Manager',
  'UX Designer',
  'Data Scientist',
  'DevOps Engineer',
  'Marketing Director',
  'Business Consultant',
  'Financial Advisor',
  'Career Coach',
  'Legal Advisor',
  'AI Research Scientist',
  'Cybersecurity Expert',
  'Digital Marketing Specialist',
  'Project Manager',
  'HR Consultant',
  'Sales Director',
  'Content Strategist',
  'Brand Manager',
  'Operations Manager',
  'Technology Consultant'
]

const expertiseAreas = [
  ['JavaScript', 'React', 'Node.js', 'TypeScript'],
  ['Product Strategy', 'Roadmapping', 'Agile', 'User Research'],
  ['UI Design', 'User Research', 'Prototyping', 'Design Systems'],
  ['Machine Learning', 'Python', 'SQL', 'Data Visualization'],
  ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
  ['Digital Marketing', 'SEO', 'Content Marketing', 'Analytics'],
  ['Strategy', 'Operations', 'Process Improvement', 'Leadership'],
  ['Investment Planning', 'Retirement Planning', 'Tax Strategy', 'Wealth Management'],
  ['Career Development', 'Resume Writing', 'Interview Prep', 'Networking'],
  ['Corporate Law', 'Contract Review', 'Compliance', 'Intellectual Property'],
  ['Deep Learning', 'Natural Language Processing', 'Computer Vision', 'Research'],
  ['Network Security', 'Penetration Testing', 'Compliance', 'Risk Assessment'],
  ['Social Media', 'Email Marketing', 'PPC', 'Analytics'],
  ['Scrum', 'Risk Management', 'Team Leadership', 'Budget Planning'],
  ['Talent Acquisition', 'Performance Management', 'Culture Building', 'Compensation'],
  ['B2B Sales', 'Lead Generation', 'CRM', 'Sales Strategy'],
  ['Content Creation', 'Editorial Strategy', 'Brand Voice', 'Copywriting'],
  ['Brand Strategy', 'Market Research', 'Campaign Management', 'Brand Identity'],
  ['Supply Chain', 'Lean Manufacturing', 'Quality Control', 'Process Optimization'],
  ['Digital Transformation', 'IT Strategy', 'System Integration', 'Tech Stack Planning']
]

const descriptions = [
  'Passionate about helping teams build scalable web applications and mentoring junior developers.',
  'Experienced in leading cross-functional teams to deliver successful products that users love.',
  'Creative designer focused on creating intuitive user experiences that drive business results.',
  'Data-driven professional helping organizations unlock insights from their data.',
  'Infrastructure expert helping companies scale their systems reliably and efficiently.',
  'Marketing strategist with a track record of growing businesses through digital channels.',
  'Business consultant helping startups and enterprises optimize their operations.',
  'Certified financial planner helping individuals and families achieve their financial goals.',
  'Career development expert with 10+ years helping professionals advance their careers.',
  'Legal professional specializing in business law and helping startups navigate legal challenges.',
  'AI researcher passionate about advancing the field and helping businesses adopt AI solutions.',
  'Cybersecurity expert helping organizations protect their digital assets and data.',
  'Digital marketing specialist focused on ROI-driven campaigns and growth strategies.',
  'Agile project manager with experience leading complex technical projects to success.',
  'HR consultant helping organizations build strong cultures and effective talent strategies.',
  'Sales leader with expertise in building high-performing sales teams and processes.',
  'Content strategist helping brands tell their story and connect with their audience.',
  'Brand expert helping companies build memorable and meaningful brand experiences.',
  'Operations specialist focused on efficiency, quality, and continuous improvement.',
  'Technology consultant helping businesses leverage technology for competitive advantage.'
]

const firstNames = [
  'Alex', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Daniel', 'Ashley', 'Matthew', 'Amanda',
  'Christopher', 'Jennifer', 'Joshua', 'Lisa', 'Andrew', 'Michelle', 'Ryan', 'Kimberly', 'Tyler', 'Amy',
  'Brandon', 'Angela', 'Jason', 'Stephanie', 'Justin', 'Nicole', 'William', 'Rachel', 'James', 'Laura',
  'Robert', 'Katherine', 'John', 'Maria', 'Kevin', 'Christina', 'Anthony', 'Samantha', 'Mark', 'Rebecca',
  'Steven', 'Melissa', 'Brian', 'Elizabeth', 'Eric', 'Heather', 'Jonathan', 'Anna', 'Nicholas', 'Monica'
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
]

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function generateRandomRating(): number {
  // Generate ratings between 3.5 and 5.0 with bias toward higher ratings
  return Math.round((3.5 + Math.random() * 1.5) * 10) / 10
}

function generateRandomReviews(): number {
  // Generate review counts between 5 and 150
  return Math.floor(Math.random() * 145) + 5
}

function generateHourlyRate(): number {
  // Generate rates between $50 and $300 per hour
  const rates = [50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300]
  return getRandomElement(rates)
}

async function generateUsers() {
  console.log('Generating regular users...')
  
  const users = []
  for (let i = 0; i < 50; i++) {
    const firstName = getRandomElement(firstNames)
    const lastName = getRandomElement(lastNames)
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`
    
    users.push({
      email,
      full_name: `${firstName} ${lastName}`,
      role: 'user' as const,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}${i}`,
    })
  }

  const { data, error } = await supabase
    .from('users')
    .insert(users)
    .select()

  if (error) {
    console.error('Error inserting users:', error)
    return []
  }

  console.log(`Generated ${data.length} regular users`)
  return data
}

async function generateExperts() {
  console.log('Generating experts...')
  
  const experts = []
  for (let i = 0; i < 30; i++) {
    const firstName = getRandomElement(firstNames)
    const lastName = getRandomElement(lastNames)
    const email = `expert.${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`
    
    experts.push({
      email,
      full_name: `${firstName} ${lastName}`,
      role: 'expert' as const,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=expert${firstName}${lastName}${i}`,
    })
  }

  const { data: expertUsers, error } = await supabase
    .from('users')
    .insert(experts)
    .select()

  if (error) {
    console.error('Error inserting expert users:', error)
    return []
  }

  console.log(`Generated ${expertUsers.length} expert users`)

  // Now create expert profiles
  const expertProfiles = expertUsers.map((user, index) => ({
    user_id: user.id,
    title: expertTitles[index % expertTitles.length],
    description: descriptions[index % descriptions.length],
    expertise_areas: expertiseAreas[index % expertiseAreas.length],
    hourly_rate: generateHourlyRate(),
    subscription_type: Math.random() > 0.3 ? 'premium' : 'free' as const,
    is_available: Math.random() > 0.1, // 90% available
    rating: generateRandomRating(),
    total_reviews: generateRandomReviews(),
  }))

  const { data: profiles, error: profileError } = await supabase
    .from('expert_profiles')
    .insert(expertProfiles)
    .select()

  if (profileError) {
    console.error('Error inserting expert profiles:', profileError)
    return []
  }

  console.log(`Generated ${profiles.length} expert profiles`)
  return profiles
}

async function generateAvailabilitySlots(expertProfiles: any[]) {
  console.log('Generating availability slots...')
  
  const slots = []
  const now = new Date()
  
  for (const expert of expertProfiles) {
    // Generate slots for the next 30 days
    for (let day = 1; day <= 30; day++) {
      const date = new Date(now)
      date.setDate(date.getDate() + day)
      
      // Skip weekends for some experts
      if (Math.random() > 0.3 && (date.getDay() === 0 || date.getDay() === 6)) {
        continue
      }
      
      // Generate 2-6 time slots per day
      const slotsPerDay = Math.floor(Math.random() * 5) + 2
      
      for (let slot = 0; slot < slotsPerDay; slot++) {
        // Random time between 9 AM and 6 PM
        const startHour = Math.floor(Math.random() * 9) + 9 // 9 AM to 5 PM
        const startTime = new Date(date)
        startTime.setHours(startHour, 0, 0, 0)
        
        const endTime = new Date(startTime)
        endTime.setHours(startHour + 1) // 1-hour slots
        
        slots.push({
          expert_id: expert.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          is_booked: Math.random() > 0.8, // 20% already booked
        })
      }
    }
  }

  // Insert in batches to avoid payload size limits
  const batchSize = 100
  let totalInserted = 0
  
  for (let i = 0; i < slots.length; i += batchSize) {
    const batch = slots.slice(i, i + batchSize)
    const { data, error } = await supabase
      .from('availability_slots')
      .insert(batch)

    if (error) {
      console.error('Error inserting availability slots batch:', error)
    } else {
      totalInserted += batch.length
    }
  }

  console.log(`Generated ${totalInserted} availability slots`)
}

async function main() {
  try {
    console.log('Starting data generation...')
    
    // Generate regular users
    await generateUsers()
    
    // Generate experts and their profiles
    const expertProfiles = await generateExperts()
    
    // Generate availability slots for experts
    if (expertProfiles.length > 0) {
      await generateAvailabilitySlots(expertProfiles)
    }
    
    console.log('✅ Data generation completed successfully!')
    console.log('\nGenerated:')
    console.log('- 50 regular users')
    console.log('- 30 expert users with profiles')
    console.log('- Availability slots for the next 30 days')
    console.log('\nYou can now browse experts and book consultations!')
    
  } catch (error) {
    console.error('Error during data generation:', error)
    process.exit(1)
  }
}

// Run the script
main() 