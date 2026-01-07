import { useState } from "react";
import Filters from "../components/Filters";
import IntensityLineChart from "../charts/IntensityLineChart";
import CountryBarChart from "../charts/CountryBarChart";
import TopicPieChart from "../charts/TopicPieChart";
import SectorBubbleChart from "../charts/SectorBubbleChart";


const Dashboard = () => {
  const [filters, setFilters] = useState({});

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 10, height: 10, background: 'var(--primary-accent)', borderRadius: '50%', boxShadow: '0 0 15px var(--primary-accent)' }}></div>
          <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.8px' }}>ChartData</span>
        </div>
        <h2>Control Panel</h2>
        <Filters onChange={setFilters} />
      </aside>

      <main className="content">
        <header style={{ marginBottom: '32px' }}>
          <h1>Dashboard</h1>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            {Object.keys(filters).length === 0 ? (
              <span className="badge">Live Data Stream</span>
            ) : (
              Object.entries(filters).map(([k, v]) => (
                <span key={k} className="badge">{k}: {v}</span>
              ))
            )}
          </div>
        </header>

        <div className="grid">
          <section className="card">
            <h3>Intensity Trends</h3>
            <div style={{ height: 260 }}><IntensityLineChart filters={filters} /></div>
          </section>

          <section className="card">
            <h3>Geographic Impact</h3>
            <div style={{ height: 260 }}><CountryBarChart filters={filters} /></div>
          </section>

          <section className="card">
            <h3>Topic Volume</h3>
            <div style={{ height: 260 }}><TopicPieChart filters={filters} /></div>
          </section>

          <section className="card">
            <h3>Sector Risk Analysis</h3>
            <div style={{ height: 260 }}><SectorBubbleChart filters={filters} /></div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;