import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import axios from "axios";

const TopicPieChart = ({ filters }) => {
  const svgRef = useRef();
  const [data, setData] = useState([]);

  // 1. Define a vibrant neon color palette to match the theme
  const colors = useMemo(() => [
    "#6366f1", // Indigo
    "#ec4899", // Pink
    "#06b6d4", // Cyan
    "#8b5cf6", // Violet
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#3b82f6", // Blue
  ], []);

  useEffect(() => {
    axios
      .get("https://chartanalytics.onrender.com/api/insights/count-by-topic", {
        params: filters,
      })
      .then((res) => {
        // Filter out empty topics and take top N to avoid clutter
        const cleanData = res.data
            .filter(d => d._id && d._id !== "")
            .sort((a, b) => b.count - a.count)
            .slice(0, 8); // Keep top 8 topics for a cleaner look
        setData(cleanData);
      });
  }, [filters]);

  useEffect(() => {
    if (data.length === 0) return;
    draw();
  }, [data, colors]); // Re-draw when data or colors change

  const draw = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.65; // Defines donut thickness

    // Calculate Total for center text
    const totalCount = d3.sum(data, d => d.count);

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // 2. Pie Generator with padding for gaps
    const pie = d3.pie()
      .value((d) => d.count)
      .sort(null)
      .padAngle(0.03); // Adds space between slices

    // 3. Arc Generator with rounded corners
    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(8); // Soft edges

    // Hover Arc (slightly larger)
    const hoverArc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius + 8) // Expands outwards
      .cornerRadius(8);

    const colorScale = d3.scaleOrdinal(colors);

    // Draw Arcs
    const path = g.selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => colorScale(i))
      .attr("stroke", "rgba(255,255,255,0.1)")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      // Add subtle shadow for depth
      .style("filter", "drop-shadow(0px 4px 4px rgba(0,0,0,0.2))")
      .transition().duration(750).attrTween("d", function(d) {
          const i = d3.interpolate(d.startAngle+0.1, d.endAngle);
          return function(t) {
              d.endAngle = i(t);
              return arc(d);
          }
      });

    // Interactivity
    g.selectAll("path")
      .on("mouseover", function(event, d) {
          d3.select(this)
            .transition().duration(200)
            .attr("d", hoverArc)
            .style("filter", "drop-shadow(0px 0px 10px rgba(255,255,255,0.3))");
          
          // Update center text on hover
          centerLabel.text(d.data._id);
          centerValue.text(d.data.count);
      })
      .on("mouseout", function() {
          d3.select(this)
            .transition().duration(200)
            .attr("d", arc)
            .style("filter", "drop-shadow(0px 4px 4px rgba(0,0,0,0.2))");

          // Reset center text
          centerLabel.text("Total Topics");
          centerValue.text(totalCount);
      });


    // 4. Center Text (Donut Hole Info)
    const centerGroup = g.append("g").style("text-anchor", "middle").style("pointer-events", "none");

    const centerLabel = centerGroup.append("text")
      .attr("y", -10)
      .text("Total Topics")
      .style("fill", "rgba(255,255,255,0.6)")
      .style("font-size", "12px")
      .style("font-weight", "600");

    const centerValue = centerGroup.append("text")
      .attr("y", 25)
      .text(totalCount)
      .style("fill", "#fff")
      .style("font-size", "28px")
      .style("font-weight", "800");
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <svg 
        ref={svgRef} 
        viewBox={`0 0 300 300`} 
        preserveAspectRatio="xMidYMid meet"
        style={{ maxWidth: "280px", maxHeight: "280px" }} // Ensures it doesn't get too big in the card
      />
    </div>
  );
};

export default TopicPieChart;