import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { Earthquake, MapHotspot, NewsMarker } from '../types';
import { Maximize, Minus, Plus, X, Radio } from 'lucide-react';

interface MapComponentProps {
  earthquakes: Earthquake[];
  hotspots: MapHotspot[];
  newsMarkers?: NewsMarker[];
}

const MapComponent: React.FC<MapComponentProps> = ({ earthquakes, hotspots, newsMarkers = [] }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // 1. Handle Resize
  useEffect(() => {
    if (!wrapperRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });
    
    resizeObserver.observe(wrapperRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // 2. Draw Map (Triggered on Dimensions or Data Change)
  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const { width, height } = dimensions;
    const now = Date.now();
    const NEW_THRESHOLD = 5 * 60 * 1000; // 5 minutes to be considered "fresh"
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append('g');

    // Projection
    const projection = d3.geoMercator()
      .scale(width / 6.5) 
      .translate([width / 2, height / 1.7]);

    const pathGenerator = d3.geoPath().projection(projection);

    zoomBehavior.current = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .translateExtent([[0, 0], [width, height]])
      .on('zoom', (event) => g.attr('transform', event.transform));

    svg.call(zoomBehavior.current);

    // 1. Background
    g.append('rect')
      .attr('width', width * 2)
      .attr('height', height * 2)
      .attr('transform', `translate(${-width/2}, ${-height/2})`)
      .attr('fill', '#09090b'); 
    
    // 2. Map Data
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((data: any) => {
        const countries = feature(data, data.objects.countries);

        // 3. Land Masses - Updated to Light Yellowish/Amber Tint
        g.selectAll('path.country')
          .data((countries as any).features)
          .enter()
          .append('path')
          .attr('class', 'country')
          .attr('d', pathGenerator as any)
          .attr('fill', '#26261a') // Dark, warm amber/yellow tint
          .attr('stroke', '#423825') // Lighter amber stroke
          .attr('stroke-width', 0.5)
          .on('mouseover', function() { d3.select(this).attr('fill', '#38301d'); }) // Slightly lighter on hover
          .on('mouseout', function() { d3.select(this).attr('fill', '#26261a'); })
          .on('click', () => setSelectedItem(null));

        // 4. Hotspots (Static, Minimal)
        hotspots.forEach(spot => {
          const coords = projection([spot.lon, spot.lat]);
          if (!coords) return;
          const [x, y] = coords;
          
          const group = g.append('g').attr('class', 'cursor-pointer').on('click', (e) => {
             e.stopPropagation();
             setSelectedItem({ type: 'hotspot', data: spot });
          });
          
          const color = spot.status === 'critical' ? '#ef4444' : '#d97706'; 

          // Minimal Ring
          group.append('circle')
            .attr('cx', x).attr('cy', y).attr('r', 3)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 1);

          // Dot
          group.append('circle')
            .attr('cx', x).attr('cy', y).attr('r', 1)
            .attr('fill', color);
        });

        // 5. NEWS ALERTS (Pulsing Beacons)
        newsMarkers.forEach(news => {
           const coords = projection([news.lon, news.lat]);
           if (!coords) return;
           const [x, y] = coords;
           
           const isNew = news.addedAt && (now - news.addedAt < NEW_THRESHOLD);

           const newsGroup = g.append('g').attr('class', 'cursor-pointer').on('click', (e) => {
               e.stopPropagation();
               setSelectedItem({ type: 'news', data: news });
           });

           const pulseColor = isNew ? '#ffffff' : '#3b82f6';
           const dotColor = isNew ? '#ffffff' : '#60a5fa';
           const duration = isNew ? '1s' : '3s';

           // Pulse Effect (Using CSS class or SVG animation)
           // Outer Fade Ring
           newsGroup.append('circle')
            .attr('cx', x).attr('cy', y).attr('r', 8)
            .attr('fill', pulseColor)
            .attr('opacity', 0.3)
            .append('animate')
            .attr('attributeName', 'r')
            .attr('values', '4;14')
            .attr('dur', duration)
            .attr('repeatCount', 'indefinite');
            
           newsGroup.select('circle')
             .append('animate')
             .attr('attributeName', 'opacity')
             .attr('values', '0.6;0')
             .attr('dur', duration)
             .attr('repeatCount', 'indefinite');

           // Core Dot
           newsGroup.append('circle')
             .attr('cx', x).attr('cy', y).attr('r', isNew ? 2.5 : 2)
             .attr('fill', dotColor);
        });

        // 6. Earthquakes (Simple Dots)
        earthquakes.forEach(eq => {
          const coords = projection([eq.lon, eq.lat]);
          if (!coords) return;
          const [x, y] = coords;
          
          const isNew = eq.addedAt && (now - eq.addedAt < NEW_THRESHOLD);

          const eqGroup = g.append('g').attr('class', 'cursor-pointer').on('click', (e) => {
             e.stopPropagation();
             setSelectedItem({ type: 'earthquake', data: eq });
          });
          
          let color = eq.mag > 6 ? '#ef4444' : '#fbbf24'; 
          if (isNew) color = '#facc15'; // Bright yellow for new earthquakes

          // Ping ring for new earthquakes
          if (isNew) {
            eqGroup.append('circle')
                .attr('cx', x).attr('cy', y).attr('r', eq.mag * 2)
                .attr('fill', 'none')
                .attr('stroke', color)
                .attr('stroke-width', 0.5)
                .attr('opacity', 1)
                .append('animate')
                .attr('attributeName', 'r')
                .attr('values', `${eq.mag};${eq.mag * 3}`)
                .attr('dur', '1.5s')
                .attr('repeatCount', 'indefinite');
                
            eqGroup.select('circle')
                .append('animate')
                .attr('attributeName', 'opacity')
                .attr('values', '1;0')
                .attr('dur', '1.5s')
                .attr('repeatCount', 'indefinite');
          }

          eqGroup.append('circle')
            .attr('cx', x).attr('cy', y).attr('r', eq.mag * 0.5)
            .attr('fill', isNew ? color : 'none')
            .attr('stroke', color)
            .attr('stroke-opacity', 0.8)
            .attr('stroke-width', 0.5);
        });
      });

  }, [earthquakes, hotspots, newsMarkers, dimensions]);

  const handleZoom = (factor: number) => {
    if (!svgRef.current || !zoomBehavior.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehavior.current.scaleBy, factor);
  };

  return (
    <div ref={wrapperRef} className="w-full h-full bg-panel relative overflow-hidden">
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {/* Zoom Control */}
      <div className="absolute top-3 right-3 flex flex-col gap-px bg-border rounded-sm overflow-hidden shadow-lg border border-border">
        <button onClick={() => handleZoom(1.3)} className="p-2 md:p-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 active:bg-zinc-700">
          <Plus size={16} className="md:w-3 md:h-3" />
        </button>
        <button onClick={() => handleZoom(0.7)} className="p-2 md:p-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 active:bg-zinc-700">
          <Minus size={16} className="md:w-3 md:h-3" />
        </button>
      </div>

      {/* Info Legend */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1 p-2 bg-zinc-950/80 border border-border backdrop-blur-sm pointer-events-none">
         <div className="flex flex-col gap-1 text-[9px] font-mono text-zinc-500">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> NEWS SIGNAL</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> NEW SIGNAL</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full border border-red-500"></span> CRITICAL ZONE</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full border border-amber-500"></span> WATCH</span>
            <span className="text-zinc-600 pt-1 border-t border-zinc-800">EQ: {earthquakes.length} | ALERTS: {newsMarkers.length}</span>
         </div>
      </div>

      {/* Details Panel */}
      {selectedItem && (
        <div className="absolute top-3 left-3 w-[calc(100%-24px)] md:w-64 bg-zinc-950 border border-border shadow-2xl p-0 z-20">
           <div className="flex justify-between items-center p-2 border-b border-border bg-zinc-900">
              <span className="text-[9px] font-mono uppercase font-bold text-zinc-400">
                {selectedItem.type === 'news' ? 'LIVE SIGNAL' : 'DETAILS'}
              </span>
              <button onClick={() => setSelectedItem(null)} className="text-zinc-500 hover:text-zinc-300 p-1"><X size={14}/></button>
           </div>
           <div className="p-3 font-mono">
              <h3 className="text-xs font-bold text-zinc-200 mb-2 uppercase">
                {selectedItem.type === 'hotspot' && selectedItem.data.name}
                {selectedItem.type === 'earthquake' && selectedItem.data.place}
                {selectedItem.type === 'news' && selectedItem.data.source}
              </h3>
              
              {selectedItem.type === 'hotspot' && (
                 <p className="text-[10px] text-zinc-500 leading-relaxed">{selectedItem.data.description}</p>
              )}

              {selectedItem.type === 'earthquake' && (
                 <div className="text-[10px] text-zinc-500">
                    <div className="flex justify-between mb-1"><span>MAG</span><span className="text-zinc-200">{selectedItem.data.mag}</span></div>
                    <div className="flex justify-between"><span>TIME</span><span>{new Date(selectedItem.data.time).toLocaleTimeString()}</span></div>
                 </div>
              )}

              {selectedItem.type === 'news' && (
                <div className="flex flex-col gap-2">
                    <p className="text-[10px] text-zinc-300 leading-relaxed font-sans">{selectedItem.data.title}</p>
                    <a href={selectedItem.data.url} target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-500 hover:text-blue-400 flex items-center gap-1 uppercase font-bold">
                        READ REPORT <Radio size={10} />
                    </a>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;