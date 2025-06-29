import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface CustomerTypeData {
  count: number;
  acv: number;
  closed_fiscal_quarter: string;
  Cust_Type: string;
}

interface Props {
  data: CustomerTypeData[];
}

const COLORS: Record<string, string> = {
  'Existing Customer': '#4285F4',
  'New Customer': '#FB8C00',
};

export default function D3StackedBarChart({ data }: Props) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data.length) return;
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    // Get container dimensions
    const container = ref.current?.parentElement;
    const containerWidth = container?.clientWidth || 700;
    const containerHeight = 400;

    const margin = { top: 40, right: 20, bottom: 50, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const grouped = d3.group(data, d => d.closed_fiscal_quarter);
    const quarters = Array.from(grouped.keys());
    const types = Array.from(new Set(data.map(d => d.Cust_Type)));

    // Prepare stacked data
    const stackData = quarters.map(q => {
      const entry: Record<string, string | number> = { quarter: q };
      types.forEach(type => {
        entry[type] = data.find(d => d.closed_fiscal_quarter === q && d.Cust_Type === type)?.acv || 0;
      });
      return entry;
    });

    const stackGen = d3.stack<Record<string, string | number>>().keys(types);
    const series = stackGen(stackData);

    const x = d3.scaleBand()
      .domain(quarters)
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(stackData, d => types.reduce((sum, t) => sum + (d[t] as number), 0)) || 0])
      .nice()
      .range([height, 0]);

    const chart = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Axis
    chart.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // X Axis Label
    svg.append('text')
      .attr('x', margin.left + width / 2)
      .attr('y', height + margin.top + margin.bottom - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', 14)
      .attr('fill', '#222')
      .text('Closed Fiscal Quarter');

    // Y Axis
    chart.append('g')
      .call(d3.axisLeft(y).tickFormat(d => `$${(+d/1000).toFixed(0)}K`));

    // Add horizontal grid lines
    chart.append('g')
      .attr('class', 'y-grid')
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '2,2');

    // Bars
    chart.selectAll('g.layer')
      .data(series)
      .join('g')
      .attr('fill', d => COLORS[d.key] || '#ccc')
      .selectAll('rect')
      .data(d => d)
      .join('rect')
      .attr('x', d => x(d.data.quarter as string)!)
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth());

    // Value labels
    chart.selectAll('g.layer')
      .data(series)
      .join('g')
      .attr('fill', d => COLORS[d.key] || '#ccc')
      .selectAll('text')
      .data(d => d)
      .join('text')
      .attr('x', d => x(d.data.quarter as string)! + x.bandwidth() / 2)
      .attr('y', d => y(d[1]) + (y(d[0]) - y(d[1])) / 2 + 4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', 12)
      .text(d => d[1] - d[0] > 0 ? `$${((d[1] - d[0])/1000).toFixed(0)}K` : '');

    // Total labels at the top of each bar
    stackData.forEach((d) => {
      const total = types.reduce((sum, t) => sum + (d[t] as number), 0);
      chart.append('text')
        .attr('x', x(d.quarter as string)! + x.bandwidth() / 2)
        .attr('y', y(total) - 8)
        .attr('text-anchor', 'middle')
        .attr('fill', '#222')
        .attr('font-size', 14)
        .attr('font-weight', 'bold')
        .text(`$${(total/1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}K`);
    });

    // Title
    svg.append('text')
      .attr('x', (width + margin.left + margin.right) / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', 16)
      .attr('font-weight', 'bold')
  }, [data]);

  return <svg ref={ref} style={{ width: '100%', height: 400 }} />;
} 