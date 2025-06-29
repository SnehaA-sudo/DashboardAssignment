import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

// Types for the data
interface CustomerTypeData {
  count: number;
  acv: number;
  closed_fiscal_quarter: string;
  Cust_Type: string;
}

// Props for the component
interface Props {
  data: CustomerTypeData[];
}

// Colors for the chart
const COLORS: Record<string, string> = {
  'Existing Customer': '#4285F4',
  'New Customer': '#FB8C00',
};

export default function D3DoughnutChart({ data }: Props) {
  const ref = useRef<SVGSVGElement | null>(null);

  // useEffect hook to update the chart when the data changes
  useEffect(() => {
    if (!data.length) return;
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    // Get container dimensions
    const container = ref.current?.parentElement;
    const containerWidth = container?.clientWidth || 350;
    const containerHeight = 400;
    const width = containerWidth;
    const height = containerHeight;
    const radius = Math.min(width, height) / 2 - 80;

    // Aggregate ACV by Cust_Type
    const acvByType = d3.rollup(
      data,
      v => d3.sum(v, d => d.acv),
      d => d.Cust_Type
    );
    const pieData = Array.from(acvByType, ([key, value]) => ({ key, value }));
    const total = d3.sum(pieData, d => d.value);

    const pieGen = d3.pie<{ key: string; value: number }>()
      .value(d => d.value)
      .sort(null);
    const arcGen = d3.arc<d3.PieArcDatum<{ key: string; value: number }>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius);

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Draw arcs
    g.selectAll('path')
      .data(pieGen(pieData))
      .join('path')
      .attr('d', arcGen)
      .attr('fill', d => COLORS[d.data.key] || '#ccc')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add lines and labels outside the arcs
    const outerArc = d3.arc<d3.PieArcDatum<{ key: string; value: number }>>()
      .innerRadius(radius * 0.85)
      .outerRadius(radius * 1.05);

    g.selectAll('polyline')
      .data(pieGen(pieData))
      .join('polyline')
      .attr('points', d => {
        const posA = arcGen.centroid(d); // arc centroid
        const posB = outerArc.centroid(d); // just outside the arc
        const posC = [
          outerArc.centroid(d)[0] + (outerArc.centroid(d)[0] > 0 ? 10 : -10),
          outerArc.centroid(d)[1]
        ];
        return [posA, posB, posC].map(point => point.join(',')).join(' ');
      })
      .attr('fill', 'none')
      .attr('stroke', '#999')
      .attr('stroke-width', 1.5);

    g.selectAll('text.label')
      .data(pieGen(pieData))
      .join('text')
      .attr('class', 'label')
      .attr('x', d => outerArc.centroid(d)[0] + (outerArc.centroid(d)[0] > 0 ? 10 : -10))
      .attr('y', d => outerArc.centroid(d)[1])
      .attr('text-anchor', d => outerArc.centroid(d)[0] > 0 ? 'start' : 'end')
      .attr('font-size', 12)
      .attr('font-weight', 'bold')
      .text(d => `$${(d.data.value/1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}K (${Math.round((d.data.value/total)*100)}%)`);

    // Center label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 8)
      .attr('font-size', 14)
      .attr('font-weight', 'bold')
      .text(`Total\n$${(total/1000).toFixed(0)}K`)
      .select(function() { return this; })
      .call(text => {
        const lines = text.text().split('\\n');
        text.text(null);
        lines.forEach((line, i) => {
          text.append('tspan')
            .attr('x', 0)
            .attr('y', 8 + i * 18)
            .text(line);
        });
      });
  }, [data]);

  return <svg ref={ref} style={{ width: '100%', height: 400 }} />;
} 