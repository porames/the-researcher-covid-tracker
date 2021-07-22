import React, { useEffect, useState, useRef } from 'react';
import vaccination from '../../components/gis/data/provincial-vaccination-data_2.json';
import infectionData from '../../components/gis/data/provinces-data-14days.json'
import chroma from 'chroma-js';
import _ from 'lodash';
import * as d3 from 'd3';

const Legend = () => {
    const pallete = ["#FFFA6C", '#FFB14D', '#FF682D', '#a2322c', '#460c39', '#29010e']
    const scales = [10, 30, 50, 100, 250, 1000]
    return (
        <div className="mt-4 d-flex flex-column align-items-center">
            <b>จำนวนผู้ติดเชื้อใหม่ในช่วง 14 วันต่อประชากร 100,000 คน</b>
            <div className="d-flex mt-2 flex-wrap justify-content-center">
                {pallete.map((color, index) => {
                    return (
                        <div className="mr-3 d-flex align-items-center" key={index}>
                            <div style={{
                                width: 15,
                                height: 15,
                                borderRadius: "50%",
                                marginRight: 5,
                                backgroundColor: color,
                                border: "1px solid #bdbdbd"
                            }}>

                            </div>
                            <div>{scales[index].toLocaleString()}</div>
                        </div>
                    )
                })
                }
            </div>
        </div>
    )
}

function VaccinationRace() {
    const [toolTipData, setToolTipData] = useState()
    const [mousePosition, setMousePosition] = useState({ x: null, y: null })
    const svgContainer = useRef(null)
    const d3Container = useRef(null)
    var data = _.cloneDeep(vaccination["data"])
    data = data.filter(province => province.id !== '0')
    data.map((province, index) => {
        data[index]['coverage'] = province['total_doses'] / (province['population'] * 2)
    })
    const doses_sum = d3.sum(data, (d) => d["total_doses"])
    const population = d3.sum(data, (d) => d["registered_population"])
    const national_avg = doses_sum / (population * 2)
    var height = 400;
    for (const i in data) {
        if (data[i]['id'] !== '0') {
            const province = data[i]
            const infection = _.find(infectionData, { "id": Number(province.id) })
            data[i]["cases-per-100k"] = infection["cases-per-100k"]
        }
    }
    let coverageDomain = d3.extent(data.map((d) => d["coverage"]))
    let xScale = d3
        .scaleLinear()
        .domain(coverageDomain)
    let vaccinationSizeDomain = d3.extent(data.map((d) => d["total_doses"]));
    let size = d3
        .scaleLinear()
        .domain(vaccinationSizeDomain)
    function renderChart(clientWidth, svg, node) {
        d3.select(node).selectAll(".circ").remove()
        d3.select(node).selectAll("line").remove()

        var medianLineHeight
        if (clientWidth < 500) {
            medianLineHeight = 150
            size.range([1, 50]);
            xScale.range([10, clientWidth - 10]);
        }
        else {
            medianLineHeight = 250
            size.range([3, 100])
            xScale.range([40, clientWidth - 40]);
        }

        const axis = d3
            .axisBottom(xScale)
            .ticks(5)
            .tickSize(height - 20, 0)
            .tickFormat((d) => { return parseInt(d * 100) + "%" })

        d3.selectAll(".grid").remove()
        d3.select(node)
            .append("g")
            .attr("class", "grid")
            .call(axis)
            .style("color", "white")

        var median = d3.select(node).append("line")
            .attr("x1", xScale(national_avg))
            .attr("y1", (height / 2) + (medianLineHeight / 2))
            .attr("x2", xScale(national_avg))
            .attr("y2", (height / 2) - (medianLineHeight / 2))
            .attr("stroke-width", 2)
            .attr("stroke", "#bdbdbd");
        d3.select(node).append("text")
            .attr("x", xScale(national_avg))
            .attr("y", (height / 2) - (medianLineHeight / 2 + 10))
            .attr("class", "grid")
            .text("ค่าเฉลี่ยทั้งประเทศ " + (national_avg * 100).toFixed(1) + "%")
            .style("fill", "white")
            .style("font-weight", "bold")

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
                var offsetX = d3.event.offsetX
                const offsetY = d3.event.offsetY
                if (offsetX > clientWidth - 500 && clientWidth > 500) {
                    offsetX = offsetX - 250
                }
                else if ((offsetX > clientWidth / 2) && clientWidth < 500) {
                    offsetX = offsetX - 250
                }
                setMousePosition({ x: offsetX, y: offsetY })

            })
            .on("mouseover", function () {
                d3.select(this).attr("stroke", "white")
            })
            .on("mouseleave", function () {
                d3.select(this).attr("stroke", "#999")
                setToolTipData(null)
            })

        d3.forceSimulation(data)
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
            .style("background-color", "#242424")
        if (typeof (window) !== "undefined") {
            d3.select(window).on("resize", () => {
                const clientWidth = svgContainer.current.clientWidth
                renderChart(clientWidth, svg, node)
            })

            renderChart(clientWidth, svg, node)
            return () => d3.select(window).on("resize", null)
        }
    }, [d3Container.current])
    return (
        <div className="mt-5">
            <div className="container text-center" style={{ maxWidth: 800 }}>
                <h2>การจัดสรรวัคซีนตามการระบาดในพื้นที่</h2>
                <p className="text-muted">ข้อมูลการจัดสรรวัคซีน โดยความเข้มของสีบอกสถานการณ์การระบาดในพื้นที่ ขนาดบอกจำนวนวัคซีนที่ได้รับ
                    และตำแหน่งบอกความครอบคลุมวัคซีนต่อประชากรในจังหวัด</p>
                <Legend />
            </div>
            <div className="w-100 mt-5" ref={svgContainer} style={{ position: "relative" }}>
                {toolTipData &&
                    <div className="bg-white text-dark p-3 shadow rounded" style={{ position: "absolute", top: (mousePosition.y + 15), left: (mousePosition.x + 15) }}>
                        <b>{toolTipData["name"]}</b><br />
                        วัคซีนครอบคลุมประชากร {(toolTipData["coverage"] * 100).toFixed(1)}%<br />
                        ฉีดวัคซีนไป {toolTipData["total_doses"].toLocaleString()} โดส
                    </div>
                }
                <svg ref={d3Container} />
                <div className="text-muted text-center"><b>ร้อยละวัคซีนต่อประชากร</b></div>
            </div>

        </div>
    )
}

export default VaccinationRace
