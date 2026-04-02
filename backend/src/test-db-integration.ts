// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { supabase } from './config/database';

async function testDatabaseIntegration() {
  console.log('================================================');
  console.log('Database Integration Testing');
  console.log('================================================\n');
  
  console.log('1. Testing table accessibility...\n');
  
  const tables = [
    'patients',
    'doctors', 
    'appointments',
    'consultations',
    'prescriptions',
    'medical_certificates',
    'doctor_approval_requests'
  ];
  
  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .select('count')
      .limit(1);
    
    if (error) {
      console.log(`   ✗ ${table}: ${error.message}`);
    } else {
      console.log(`   ✓ ${table} accessible`);
    }
  }
  
  console.log('\n2. Checking table counts...\n');
  
  for (const table of tables) {
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    console.log(`   ${table}: ${count || 0} records`);
  }
  
  console.log('\n3. Testing relationships...\n');
  
  // Test if we can query with joins
  const { data: consultationsWithDoctors, error: joinError } = await supabase
    .from('consultations')
    .select(`
      id,
      doctor:doctors(full_name)
    `)
    .limit(1);
  
  if (joinError) {
    console.log(`   ✗ Join query failed: ${joinError.message}`);
  } else {
    console.log('   ✓ Join queries working (consultations -> doctors)');
  }
  
  console.log('\n================================================');
  console.log('✓ Database integration test complete');
  console.log('================================================\n');
}

testDatabaseIntegration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
