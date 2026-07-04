import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kmqrkqtrwtgdbwrvczcm.supabase.co'
const supabaseKey = 'sb_publishable_kdJUb2p_femFi8r1dJJHJg_-F1RZcd5'

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanAndSeed() {
  try {
    console.log('🧹 Starting database cleanup and seeding...\n')

    // Step 1: Delete existing data (respecting foreign key constraints)
    console.log('🗑️  Deleting existing data...')
    
    // Delete reviews
    const { error: deleteReviewsError } = await supabase
      .from('reviews')
      .delete()
      .neq('review_id', '')
    if (deleteReviewsError && deleteReviewsError.code !== 'PGRST116') {
      throw deleteReviewsError
    }

    // Delete bookings
    const { error: deleteBookingsError } = await supabase
      .from('bookings')
      .delete()
      .neq('booking_id', '')
    if (deleteBookingsError && deleteBookingsError.code !== 'PGRST116') {
      throw deleteBookingsError
    }

    // Delete wishlist
    const { error: deleteWishlistError } = await supabase
      .from('wishlist')
      .delete()
      .neq('wishlist_id', '')
    if (deleteWishlistError && deleteWishlistError.code !== 'PGRST116') {
      throw deleteWishlistError
    }

    // Delete event_organizers
    const { error: deleteEventOrgError } = await supabase
      .from('event_organizers')
      .delete()
      .neq('event_organizer_id', '')
    if (deleteEventOrgError && deleteEventOrgError.code !== 'PGRST116') {
      throw deleteEventOrgError
    }

    // Delete event_categories
    const { error: deleteEventCatError } = await supabase
      .from('event_categories')
      .delete()
      .neq('event_category_id', '')
    if (deleteEventCatError && deleteEventCatError.code !== 'PGRST116') {
      throw deleteEventCatError
    }

    // Delete events
    const { error: deleteEventsError } = await supabase
      .from('events')
      .delete()
      .neq('event_id', '')
    if (deleteEventsError && deleteEventsError.code !== 'PGRST116') {
      throw deleteEventsError
    }

    // Delete organizers
    const { error: deleteOrganizersError } = await supabase
      .from('organizers')
      .delete()
      .neq('organizer_id', '')
    if (deleteOrganizersError && deleteOrganizersError.code !== 'PGRST116') {
      throw deleteOrganizersError
    }

    console.log('✓ Old data deleted\n')

    // Step 1.5: Add test users
    console.log('➕ Adding test users...')
    const testUsers = [
      {
        first_name: 'Ali',
        last_name: 'Ahmed',
        email: 'ali.ahmed@example.com',
        phone: '03000000001',
        password: 'password123'
      },
      {
        first_name: 'Ahmed',
        last_name: 'Khan',
        email: 'ahmed.khan@example.com',
        phone: '03000000002',
        password: 'password123'
      },
      {
        first_name: 'Fatima',
        last_name: 'Ali',
        email: 'fatima.ali@example.com',
        phone: '03000000003',
        password: 'password123'
      }
    ]

    // Delete existing test users first
    await supabase
      .from('users')
      .delete()
      .in('user_id', [1, 2, 3])

    const { data: addedUsers, error: userError } = await supabase
      .from('users')
      .insert(testUsers)
      .select()

    if (userError && userError.code !== 'PGRST116') {
      throw userError
    }
    console.log('✓ Test users added\n')

    // Step 2: Add categories
    console.log('➕ Adding categories...')
    const categories = [
      { name: 'Technology', description: 'Tech conferences, workshops, and summits' },
      { name: 'Music', description: 'Music festivals and concerts' },
      { name: 'Business', description: 'Business networking and conferences' },
      { name: 'Education', description: 'Workshops and training sessions' },
      { name: 'Sports', description: 'Sports events and tournaments' }
    ]

    const { data: addedCategories, error: catError } = await supabase
      .from('categories')
      .insert(categories)
      .select()

    if (catError) throw catError
    console.log('✓ Categories added\n')

    // Step 3: Add organizers
    console.log('➕ Adding organizers...')
    const organizers = [
      {
        name: 'Ahmed Khan',
        email: 'ahmed@techsummit.pk',
        phone: '+92-300-1234567',
        company: 'TechSummit Pakistan',
        bio: 'Tech event organizer with 10+ years experience'
      },
      {
        name: 'Fatima Ali',
        email: 'fatima@businessevents.pk',
        phone: '+92-300-2345678',
        company: 'Business Events Co.',
        bio: 'Professional business event organizer'
      },
      {
        name: 'Hassan Malik',
        email: 'hassan@musicfest.pk',
        phone: '+92-300-3456789',
        company: 'Music Festival Productions',
        bio: 'Renowned music festival organizer'
      }
    ]

    const { data: addedOrganizers, error: orgError } = await supabase
      .from('organizers')
      .insert(organizers)
      .select()

    if (orgError) throw orgError
    console.log('✓ Organizers added\n')

    // Step 4: Add 5 professional events
    console.log('➕ Adding 5 professional events...\n')

    const professionalEvents = [
      {
        title: 'Tech Summit 2025',
        venue: 'Karachi Convention Center',
        event_date: '2025-06-15',
        price: 5000,
        available_seats: 500,
        description: 'Join leading tech innovators for a day of inspiring talks, networking, and breakthrough innovations in AI, Web3, and Cloud Computing.'
      },
      {
        title: 'Business Networking Gala',
        venue: 'Lahore Serena Hotel',
        event_date: '2025-07-20',
        price: 3500,
        available_seats: 300,
        description: 'Connect with entrepreneurs, investors, and business leaders. A premium networking event with dinner and live entertainment.'
      },
      {
        title: 'Music Festival 2025',
        venue: 'Islamabad Sports Complex',
        event_date: '2025-08-10',
        price: 2500,
        available_seats: 5000,
        description: 'Three days of world-class music performances featuring international and local artists. Food courts, merchandise, and VIP lounges available.'
      },
      {
        title: 'Digital Marketing Workshop',
        venue: 'Peshawar Business Hub',
        event_date: '2025-06-25',
        price: 1500,
        available_seats: 200,
        description: 'Learn the latest digital marketing strategies from industry experts. Includes hands-on training on SEO, SEM, Social Media, and Analytics.'
      },
      {
        title: 'Startup Pitch Competition',
        venue: 'Multan Innovation Center',
        event_date: '2025-07-05',
        price: 800,
        available_seats: 400,
        description: 'Showcase your startup idea to investors and win prizes up to PKR 1 Million. Includes mentoring sessions and networking opportunities.'
      }
    ]

    const { data: insertedEvents, error: insertError } = await supabase
      .from('events')
      .insert(professionalEvents)
      .select()

    if (insertError) {
      throw insertError
    }

    console.log('✓ Professional events added successfully!\n')
    console.log('📋 Events Summary:')
    console.log('─'.repeat(80))
    insertedEvents.forEach((event, index) => {
      console.log(`\n${index + 1}. ${event.title}`)
      console.log(`   📍 Venue: ${event.venue}`)
      console.log(`   📅 Date: ${event.event_date}`)
      console.log(`   💰 Price: Rs. ${event.price}`)
      console.log(`   🪑 Seats: ${event.available_seats}`)
    })

    // Step 5: Link events to categories
    console.log('\n\n➕ Linking events to categories...')
    const eventCategoryMappings = [
      { eventIndex: 0, categoryIndex: 0 }, // Tech Summit -> Technology
      { eventIndex: 1, categoryIndex: 2 }, // Business Gala -> Business
      { eventIndex: 2, categoryIndex: 1 }, // Music Festival -> Music
      { eventIndex: 3, categoryIndex: 3 }, // Marketing Workshop -> Education
      { eventIndex: 4, categoryIndex: 3 }  // Startup Pitch -> Education
    ]

    for (const mapping of eventCategoryMappings) {
      await supabase
        .from('event_categories')
        .insert({
          event_id: insertedEvents[mapping.eventIndex].event_id,
          category_id: addedCategories[mapping.categoryIndex].category_id
        })
    }
    console.log('✓ Events linked to categories\n')

    // Step 6: Link events to organizers
    console.log('➕ Linking events to organizers...')
    const eventOrganizerMappings = [
      { eventIndex: 0, organizerIndex: 0 }, // Tech Summit -> Ahmed Khan
      { eventIndex: 1, organizerIndex: 1 }, // Business Gala -> Fatima Ali
      { eventIndex: 2, organizerIndex: 2 }, // Music Festival -> Hassan Malik
      { eventIndex: 3, organizerIndex: 1 }, // Marketing Workshop -> Fatima Ali
      { eventIndex: 4, organizerIndex: 1 }  // Startup Pitch -> Fatima Ali
    ]

    for (const mapping of eventOrganizerMappings) {
      await supabase
        .from('event_organizers')
        .insert({
          event_id: insertedEvents[mapping.eventIndex].event_id,
          organizer_id: addedOrganizers[mapping.organizerIndex].organizer_id
        })
    }
    console.log('✓ Events linked to organizers\n')

    // Step 7: Add sample reviews
    console.log('➕ Adding sample reviews...')
    const sampleReviews = [
      {
        event_id: insertedEvents[0].event_id,
        user_id: 1,
        rating: 5,
        comment: 'Amazing event! Great speakers and networking opportunities.'
      },
      {
        event_id: insertedEvents[0].event_id,
        user_id: 2,
        rating: 4,
        comment: 'Good event, but could have been better organized.'
      },
      {
        event_id: insertedEvents[1].event_id,
        user_id: 1,
        rating: 5,
        comment: 'Excellent networking event! Met many interesting people.'
      },
      {
        event_id: insertedEvents[2].event_id,
        user_id: 3,
        rating: 5,
        comment: 'Best music festival ever! Outstanding performances.'
      },
      {
        event_id: insertedEvents[3].event_id,
        user_id: 2,
        rating: 4,
        comment: 'Great workshop, very informative content.'
      }
    ]

    const { error: reviewError } = await supabase
      .from('reviews')
      .insert(sampleReviews)

    if (reviewError && reviewError.code !== 'PGRST116') {
      throw reviewError
    }
    console.log('✓ Sample reviews added\n')

    console.log('─'.repeat(80))
    console.log('\n✅ Database cleanup and seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   ✓ 3 Test users created`)
    console.log(`   ✓ 5 Events created`)
    console.log(`   ✓ 5 Categories created`)
    console.log(`   ✓ 3 Organizers created`)
    console.log(`   ✓ 5 Event-Category mappings`)
    console.log(`   ✓ 5 Event-Organizer mappings`)
    console.log(`   ✓ 5 Sample reviews added\n`)
    console.log('Test User Credentials:')
    console.log('   1. Email: ali.ahmed@example.com (User ID: 1)')
    console.log('   2. Email: ahmed.khan@example.com (User ID: 2)')
    console.log('   3. Email: fatima.ali@example.com (User ID: 3)\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

cleanAndSeed()
