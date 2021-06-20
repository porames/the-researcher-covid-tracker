import React, { useEffect, useState, useRef } from 'react';
import vaccination from '../../components/gis/data/provincial-vaccination-data.json';
import infectionData from '../../components/gis/data/provinces-data-14days.json'
import chroma from 'chroma-js';
import _ from 'lodash';
import * as d3 from 'd3';

function VaccinationRace() {
    const [toolTipData, setToolTipData] = useState()
    const [mousePosition, setMousePosition] = useState({ x: null, y: null })
    const svgContainer = useRef(null)
    const d3Container = useRef(null)
    var data = vaccination["data"]
    var height = 500;
    for (const i in data) {
        const province = data[i]
        const infection = _.find(infectionData, { "id": Number(province.id) })
        data[i]["cases-per-100k"] = infection["cases-per-100k"]
    }
    let coverageDomain = d3.extent(data.map((d) => +d["coverage"]))
    let xScale = d3
        .scaleLinear()
        .domain(coverageDomain)
    let vaccinationSizeDomain = d3.extent(data.map((d) => d["total_doses"]));
    let size = d3
        .scaleLinear()
        .domain(vaccinationSizeDomain)
    function renderChart(clientWidth, svg, node) {
        console.log("drawing")
        d3.selectAll(".circ").remove()
        d3.selectAll("line").remove()
        if (clientWidth < 500) {
            size.range([1, 50])
            xScale.range([10, clientWidth - 10]);
        }
        else {
            size.range([3, 100])
            xScale.range([40, clientWidth - 40]);
        }

        const axis = d3
            .axisBottom(xScale)
            .ticks(5)
            .tickSize(height - 20, 0)
            .tickFormat((d) => { return parseInt(d * 100) + "%" })

        d3.select(".grid").remove()
        d3.select(node)
            .append("g")
            .attr("class", "grid")
            .call(axis)
            .style("color", "white")

        var median = d3.select(node).append("line")
            .attr("x1", xScale(0.0695))
            .attr("y1", (height / 2) + 80)
            .attr("x2", xScale(0.0695))
            .attr("y2", (height / 2) - 80)
            .attr("stroke-width", 2)
            .attr("stroke", "#bdbdbd");
        let color = chroma.scale(["#FFFA6C", '#FFB14D', '#FF682D', '#a2322c', '#460c39', '#29010e']).domain([10, 30, 50, 100, 250, 1000]);
        svg.selectAll(".circ")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "circ")
            .attr("stroke", "#999")
            .attr("r", (d) => size(d["total_doses"]))
            .attr("cx", (d) => xScale(d["coverage"]))
            .attr("cy", height / 2)
            .attr("fill", (d) => color(d["cases-per-100k"]))
            .attr("stroke-width", (d) => color(d["cases-per-100k"]))
            .style("opacity", 0.9)
            .on("mousemove", (d) => {
                setToolTipData(d)
                setMousePosition({ x: d3.event.pageX, y: d3.event.pageY })

            })
            .on("mouseover", function () {
                d3.select(this).attr("stroke", "white")
            })
            .on("mouseleave", function () {
                d3.select(this).attr("stroke", "")
                setToolTipData(null)
            })
        let forceSimulation = d3.forceSimulation(data)
            .force("x", d3.forceX((d) => {
                return xScale(d["coverage"]);
            }).strength(1))
            .force("y", d3.forceY(height / 2).strength(0.5))
            .force("collide", d3.forceCollide((d) => {
                return size(d["total_doses"]);
            }))
            .alphaDecay(0.1)
            .alpha(0.5)
            .on("tick", tick);
        function tick() {
            d3.selectAll(".circ")
                .attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y);
        }
    }

    useEffect(() => {
        const clientWidth = svgContainer.current.clientWidth
        var node = d3Container.current
        var svg = d3.select(node)
            .attr("id", "vaccination-race-chart")
            .attr("width", "100%")
            .attr("height", height)
            .style("background-color", "#212121")
        if (typeof (window) !== "undefined") {
            d3.select(window).on("resize", () => {
                const clientWidth = svgContainer.current.clientWidth
                renderChart(clientWidth, svg, node)
            })
            
            renderChart(clientWidth, svg, node)
            return () => d3.select(window).on("resize", null)
        }
        console.log(d3Container.current)
        
    }, [d3Container.current])
    return (

        <div className="w-100" ref={svgContainer} style={{ position: "relative" }}>
            {toolTipData &&
                <div className="bg-white px-3 py-2 shadow rounded" style={{ position: "absolute", top: (mousePosition.y + 15), left: (mousePosition.x + 15) }}>
                    <b>{toolTipData["name"]}</b><br />
                    วัคซีนครอบคลุมประชากร {(toolTipData["coverage"] * 100).toFixed(1)}%<br />
                    ฉีดวัคซีนไป {toolTipData["total_doses"].toLocaleString()} โดส
                </div>
            }
            <svg ref={d3Container} />
        </div>

    )
}

export default VaccinationRace
