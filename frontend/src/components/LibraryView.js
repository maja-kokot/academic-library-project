// In frontend/src/components/LibraryView.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import axios from 'axios';

function LibraryView() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/areas/');
        setAreas(response.data);
      } catch (err) {
        setError('Failed to fetch data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>My Academic Library</h1>
      <h2>Select an Area to Begin</h2>
      <ul>
        {areas.map(area => (
          <li key={area.id}>
            {/* This Link now uses the area's slug for the URL */}
            <Link to={`/${area.slug}`}>{area.name}</Link>
          </li>
        ))}
      </ul>
      <nav>
        {/* You can decide if you still want a global graph view here */}
        <Link to="/graph">View Global Connections</Link>
      </nav>
    </div>
  );
}

export default LibraryView;