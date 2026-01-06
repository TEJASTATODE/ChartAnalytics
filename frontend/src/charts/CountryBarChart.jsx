import { useEffect, useRef } from "react";
import * as d3 from "d3";
import axios from "axios";

const CountryBarChart = ({ filters }) => {
  const svgRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/insights/count-by-country", {
        params: filters,
      })
      .then((res) => {
        // Filter out empty IDs or "Unknown" for a cleaner UI
        const cleanData = res.data.filter(d => d._id && d._id !== "");
        draw(cleanData);
      });
  }, [filters]);

  const draw = (data) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Get parent container dimensions for true responsiveness
    const width = 600; 
    const height = 280;
    const margin = { top: 20, right: 20, bottom: 70, left: 50 };

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d._id))
      .range([margin.left, width - margin.right])
      .padding(0.3); // Increased padding for a more "spaced" modern look

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Create Gradient for Glass effect
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "bar-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#818cf8"); // Indigo light
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#6366f1"); // Indigo primary

    // X-Axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSize(0)) // Hide tick marks for cleaner UI
      .attr("color", "rgba(255,255,255,0.5)") // Faded white text
      .selectAll("text")
      .attr("transform", "rotate(-35)")
      .style("text-anchor", "end")
      .style("font-size", "11px");

    // Y-Axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(-width + margin.left + margin.right)) // Background grid lines
      .attr("color", "rgba(255,255,255,0.1)") // Grid line color
      .selectAll("text")
      .attr("color", "rgba(255,255,255,0.5)")
      .style("font-size", "11px");

    // Draw Bars
    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d._id))
      .attr("y", (d) => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(d.count))
      .attr("fill", "url(#bar-gradient)")
      .attr("rx", 6) // Rounded corners for that polished look
      .attr("ry", 6)
      .style("filter", "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))") // Subtle depth
      .on("mouseover", function() {
          d3.select(this).attr("fill", "#a5b4fc"); // Hover state
      })
      .on("mouseout", function() {
          d3.select(this).attr("fill", "url(#bar-gradient)");
      });
  };

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <svg 
        ref={svgRef} 
        viewBox={`0 0 600 280`} 
        preserveAspectRatio="xMidYMid meet" 
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default CountryBarChart;
