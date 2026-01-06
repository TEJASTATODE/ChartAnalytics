import { useEffect, useState } from "react";
import axios from "axios";

const Filters = ({ onChange }) => {
  const [options, setOptions] = useState({});
  const [filters, setFilters] = useState({});

  useEffect(() => {
    axios.get("https://chartanalytics.onrender.com/api/insights/filters")
      .then((res) => setOptions(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...filters, [name]: value || undefined };
    Object.keys(updated).forEach(k => updated[k] === undefined && delete updated[k]);
    setFilters(updated);
    onChange(updated);
  };

  const resetAll = () => {
    setFilters({});
    onChange({});
    document.querySelectorAll('.filter').forEach(el => el.value = "");
  };

  const FilterBox = ({ name, label, data }) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px', paddingLeft: '4px' }}>
        {label}
      </label>
      <select name={name} className="filter" onChange={handleChange}>
        <option value="">All {label}s</option>
        {data?.map(item => <option key={item} value={item}>{item}</option>)}
      </select>
    </div>
  );

  return (
    <div className="filters-list">
      <FilterBox name="topic" label="Topic" data={options.topics} />
      <FilterBox name="sector" label="Sector" data={options.sectors} />
      <FilterBox name="region" label="Region" data={options.regions} />
      <FilterBox name="country" label="Country" data={options.countries} />
      <FilterBox name="pestle" label="PEST" data={options.pestles} />
      <FilterBox name="source" label="Source" data={options.sources} />
      <FilterBox name="endYear" label="Year" data={options.years} />
      
      {Object.keys(filters).length > 0 && (
        <button onClick={resetAll} style={{
          width: '100%', padding: '8px', background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171',
          borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600'
        }}>
          Reset Filters
        </button>
      )}
    </div>
  );
};

export default Filters;