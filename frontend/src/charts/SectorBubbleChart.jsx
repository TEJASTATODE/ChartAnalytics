import { useEffect, useRef } from "react";
import * as d3 from "d3";
import axios from "axios";

const SectorBubbleChart = ({ filters }) => {
  const svgRef = useRef();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/insights/sector-risk-analysis", {
        params: filters,
      })
      .then((res) => {
        // Clean data: remove entries with missing sector names
        const cleanData = res.data.filter(d => d._id);
        draw(cleanData);
      });
  }, [filters]);

  const draw = (data) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 300;
    const margin = { top: 30, right: 40, bottom: 50, left: 60 };

    // --- SCALES ---
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.avgLikelihood) * 1.1])
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.avgRelevance) * 1.1])
      .range([height - margin.bottom, margin.top]);

    const r = d3
      .scaleSqrt()
      .domain([0, d3.max(data, (d) => d.avgIntensity)])
      .range([8, 30]); // Slightly larger for better "glass" look

    // --- DEFS (Gradients & Shadows) ---
    const defs = svg.append("defs");
    const bubbleGradient = defs.append("radialGradient")
      .attr("id", "bubble-grad")
      .attr("cx", "30%").attr("cy", "30%");

    bubbleGradient.append("stop").attr("offset", "0%").attr("stop-color", "#a5b4fc");
    bubbleGradient.append("stop").attr("offset", "100%").attr("stop-color", "#6366f1");

    // --- AXES ---
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(-height + margin.top + margin.bottom))
      .attr("color", "rgba(255,255,255,0.05)")
      .selectAll("text").attr("color", "rgba(255,255,255,0.4)").style("font-size", "10px");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(-width + margin.left + margin.right))
      .attr("color", "rgba(255,255,255,0.05)")
      .selectAll("text").attr("color", "rgba(255,255,255,0.4)").style("font-size", "10px");

    // Axis Labels
    svg.append("text")
      .attr("x", width / 2).attr("y", height - 10)
      .attr("fill", "rgba(255,255,255,0.3)").style("font-size", "10px")
      .style("text-anchor", "middle").text("Likelihood →");

    // --- BUBBLES ---
    const bubbles = svg.selectAll(".bubble-group")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "bubble-group");

    bubbles.append("circle")
      .attr("cx", (d) => x(d.avgLikelihood))
      .attr("cy", (d) => y(d.avgRelevance))
      .attr("r", (d) => r(d.avgIntensity))
      .attr("fill", "url(#bubble-grad)")
      .attr("stroke", "rgba(255,255,255,0.3)")
      .attr("stroke-width", 1)
      .style("opacity", 0.8)
      .style("filter", "drop-shadow(0px 4px 10px rgba(99, 102, 241, 0.4))")
      .on("mouseover", function(event, d) {
        d3.select(this).transition().duration(200).attr("r", r(d.avgIntensity) + 5).style("opacity", 1);
      })
      .on("mouseout", function(event, d) {
        d3.select(this).transition().duration(200).attr("r", r(d.avgIntensity)).style("opacity", 0.8);
      });

    // --- TEXT LABELS (Only for larger bubbles to keep it clean) ---
    bubbles.append("text")
      .attr("x", (d) => x(d.avgLikelihood))
      .attr("y", (d) => y(d.avgRelevance) + 4) // Center vertically
      .attr("fill", "#fff")
      .style("font-size", "9px")
      .style("font-weight", "600")
      .style("text-anchor", "middle")
      .style("pointer-events", "none")
      .text(d => d.avgIntensity > 20 ? d._id : ""); // Only label significant sectors
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <svg 
        ref={svgRef} 
        viewBox={`0 0 600 300`} 
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default SectorBubbleChart;
