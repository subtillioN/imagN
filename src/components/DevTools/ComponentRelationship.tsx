import React, { useEffect, useRef } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  select,
  drag,
  zoom,
  SimulationNodeDatum,
  SimulationLinkDatum
} from 'd3';
import styles from '../../styles/base.module.css';
import { PropAnalysisResult } from '../../utils/propAnalysis';

interface Node extends SimulationNodeDatum {
  id: string;
  name: string;
  type: 'component' | 'prop';
  value?: number;
}

interface Link extends SimulationLinkDatum<Node> {
  source: string;
  target: string;
  value: number;
  type: 'prop' | 'dependency';
}

interface ComponentRelationshipProps {
  data: PropAnalysisResult;
  width?: number;
  height?: number;
}

const ComponentRelationship: React.FC<ComponentRelationshipProps> = ({
  data,
  width = 800,
  height = 600
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous visualization
    select(svgRef.current).selectAll('*').remove();

    // Transform data into nodes and links
    const nodes: Node[] = [];
    const links: Link[] = [];

    // Add component nodes
    data.components.forEach(component => {
      nodes.push({
        id: component.componentName,
        name: component.componentName,
        type: 'component',
        value: component.props.length
      });

      // Add prop nodes and links
      component.props.forEach(prop => {
        const propId = `${component.componentName}-${prop.name}`;
        nodes.push({
          id: propId,
          name: prop.name,
          type: 'prop',
          value: prop.usageCount
        });

        links.push({
          source: component.componentName,
          target: propId,
          value: prop.usageCount || 1,
          type: 'prop'
        });
      });
    });

    // Add dependency links based on prop patterns
    data.propPatterns.forEach(pattern => {
      if (pattern.components.length > 1) {
        for (let i = 0; i < pattern.components.length - 1; i++) {
          links.push({
            source: pattern.components[i],
            target: pattern.components[i + 1],
            value: pattern.count,
            type: 'dependency'
          });
        }
      }
    });

    // Create SVG container
    const svg = select(svgRef.current);
    const g = svg.append('g');

    // Add zoom behavior
    svg.call(zoom<SVGSVGElement, unknown>().on('zoom', (event) => {
      g.attr('transform', event.transform.toString());
    }));

    // Create force simulation
    const simulation = forceSimulation<Node, Link>(nodes)
      .force('link', forceLink<Node, Link>(links)
        .id(d => d.id)
        .distance(100)
        .strength(0.1))
      .force('charge', forceManyBody().strength(-300))
      .force('center', forceCenter(width / 2, height / 2));

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', d => styles[`link-${d.type}`])
      .attr('stroke-width', d => Math.sqrt(d.value));

    // Create nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', d => styles[`node-${d.type}`])
      .call(drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles to nodes
    node.append('circle')
      .attr('r', d => Math.sqrt((d.value || 1) * 20))
      .attr('fill', d => d.type === 'component' ? '#4caf50' : '#2196f3');

    // Add labels to nodes
    node.append('text')
      .text(d => d.name)
      .attr('x', 6)
      .attr('y', 3)
      .attr('class', styles['node-label']);

    // Add tooltips
    node.append('title')
      .text(d => `${d.name}\nType: ${d.type}\nValue: ${d.value}`);

    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any, d: Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data, width, height]);

  return (
    <div className={styles['relationship-container']}>
      <h3>Component Relationships</h3>
      <div className={styles['relationship-controls']}>
        <button className={styles.button} onClick={() => {
          select(svgRef.current)
            .transition()
            .duration(750)
            .call(zoom<SVGSVGElement, unknown>().transform as any, zoom.identity);
        }}>
          Reset View
        </button>
      </div>
      <div className={styles['relationship-legend']}>
        <div className={styles['legend-item']}>
          <span className={styles['legend-color']} style={{ backgroundColor: '#4caf50' }} />
          <span>Component</span>
        </div>
        <div className={styles['legend-item']}>
          <span className={styles['legend-color']} style={{ backgroundColor: '#2196f3' }} />
          <span>Prop</span>
        </div>
      </div>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className={styles['relationship-svg']}
      />
    </div>
  );
};

export default ComponentRelationship; 