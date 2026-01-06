import { useEffect, useRef } from "react";
import * as d3 from "d3";
import axios from "axios";

const IntensityLineChart = ({ filters }) => {
  const svgRef = useRef();

  useEffect(() => {
    axios
      .get("https://chartanalytics.onrender.com/api/insights/avg-intensity-by-year", {
        params: filters,
      })
      .then((res) => {
        // Sort data by year (id) to ensure the line draws correctly
        const sortedData = res.data.sort((a, b) => a._id - b._id);
        draw(sortedData);
      });
  }, [filters]);

  const draw = (data) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 280;
    const margin = { top: 30, right: 30, bottom: 40, left: 50 };

    // Scales
    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d._id))
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.avgIntensity)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Line generator with Curve for smoothness
    const line = d3
      .line()
      .x((d) => x(d._id))
      .y((d) => y(d.avgIntensity))
      .curve(d3.curveMonotoneX); // Makes the line smooth

    // Area generator for the "Glow" under the line
    const area = d3
      .area()
      .x((d) => x(d._id))
      .y0(height - margin.bottom)
      .y1((d) => y(d.avgIntensity))
      .curve(d3.curveMonotoneX);

    // Create Gradients
    const defs = svg.append("defs");

    // Area Gradient
    const areaGradient = defs
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");

    areaGradient.append("stop").attr("offset", "0%").attr("stop-color", "rgba(99, 102, 241, 0.4)");
    areaGradient.append("stop").attr("offset", "100%").attr("stop-color", "rgba(99, 102, 241, 0)");

    // Axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")).tickSize(0).tickPadding(10))
      .attr("color", "rgba(255,255,255,0.4)")
      .style("font-size", "11px");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(-width + margin.left + margin.right))
      .attr("color", "rgba(255,255,255,0.1)") // Faint grid lines
      .selectAll("text")
      .attr("color", "rgba(255,255,255,0.4)")
      .style("font-size", "11px");

    // Draw Area
    svg
      .append("path")
      .datum(data)
      .attr("fill", "url(#area-gradient)")
      .attr("d", area);

    // Draw Line
    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#818cf8")
      .attr("stroke-width", 3)
      .attr("d", line)
      .style("filter", "drop-shadow(0px 0px 8px rgba(99, 102, 241, 0.6))"); // The line glow

    // Add glowing dots on data points
    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d._id))
      .attr("cy", (d) => y(d.avgIntensity))
      .attr("r", 4)
      .attr("fill", "#fff")
      .attr("stroke", "#6366f1")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0px 0px 5px rgba(255, 255, 255, 0.8))");
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

export default IntensityLineChart;
