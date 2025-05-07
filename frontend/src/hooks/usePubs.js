import { useState, useEffect } from 'react';
import supabase from '../../src/utils/supabasePublicClient'; // Import the Supabase client

const usePubs = () => {
  const [pubs, setPubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPubs = async () => {
      try {
        const { data, error } = await supabase
          .from('pubs')
          .select('id, name, start_time')
          .eq('active', true);

        if (error) throw error;

        setPubs(data);
      } catch (err) {
        setError('Failed to fetch pubs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPubs();
  }, []);

  return { pubs, loading, error };
};

export default usePubs;