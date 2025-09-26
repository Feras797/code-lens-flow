import { supabase } from './src/lib/supabase.js';

async function queryAllTables() {
  console.log('🔍 Querying Supabase database for existing entries...\n');
  
  const tables = [
    'companies',
    'facilities', 
    'environmental_metrics',
    'reference_patches',
    'reports',
    'time_series_analysis',
    'users',
    'chat_sessions',
    'chat_messages',
    'alerts',
    'audit_log'
  ];

  for (const table of tables) {
    try {
      console.log(`📊 Table: ${table}`);
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(5); // Just show first 5 entries for each table
      
      if (error) {
        console.log(`❌ Error querying ${table}: ${error.message}`);
      } else {
        console.log(`📈 Count: ${count || 0} entries`);
        if (data && data.length > 0) {
          console.log('Sample entries:');
          data.forEach((entry, index) => {
            console.log(`  ${index + 1}.`, JSON.stringify(entry, null, 2));
          });
        } else {
          console.log('  No entries found');
        }
      }
      console.log('---');
    } catch (err) {
      console.log(`❌ Exception querying ${table}: ${err.message}`);
      console.log('---');
    }
  }
}

// Run the query
queryAllTables().catch(console.error);