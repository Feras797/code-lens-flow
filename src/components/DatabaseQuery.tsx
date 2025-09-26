import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface QueryResult {
  tableName: string;
  count: number;
  data: any[];
  error?: string;
}

export const DatabaseQuery = () => {
  const [results, setResults] = useState<QueryResult[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const queryAllTables = async () => {
      const queryResults: QueryResult[] = [];
      
      for (const table of tables) {
        try {
          const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact' })
            .limit(5);
          
          if (error) {
            queryResults.push({
              tableName: table,
              count: 0,
              data: [],
              error: error.message
            });
          } else {
            queryResults.push({
              tableName: table,
              count: count || 0,
              data: data || []
            });
          }
        } catch (err: any) {
          queryResults.push({
            tableName: table,
            count: 0,
            data: [],
            error: err.message
          });
        }
      }
      
      setResults(queryResults);
      setLoading(false);
    };

    queryAllTables();
  }, []);

  if (loading) {
    return <div className="p-4">Loading database info...</div>;
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Database Contents</h1>
      
      {results.map((result) => (
        <div key={result.tableName} className="mb-6 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">
            📊 Table: {result.tableName}
          </h2>
          
          {result.error ? (
            <div className="text-red-600">
              ❌ Error: {result.error}
            </div>
          ) : (
            <>
              <div className="text-gray-600 mb-2">
                📈 Count: {result.count} entries
              </div>
              
              {result.data.length > 0 ? (
                <div>
                  <h3 className="font-medium mb-2">Sample entries:</h3>
                  <div className="bg-gray-50 p-3 rounded max-h-96 overflow-auto">
                    <pre className="text-sm">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No entries found</div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};