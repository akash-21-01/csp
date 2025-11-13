import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// --- Error Boundary ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("App Crashed:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center font-sans text-red-600 bg-white h-full flex flex-col items-center justify-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h1 className="text-xl font-bold mb-2">System Error</h1>
          <p className="text-gray-500 text-sm mb-4">We encountered an unexpected issue.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-gray-900 text-white rounded-xl shadow-lg">
            Restart App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Data ---
const STATIONS = [
  { id: 's1', name: 'PNBS (Bus Station)', lat: 16.5086, lng: 80.6183, type: 'hub' },
  { id: 's2', name: 'Benz Circle', lat: 16.5003, lng: 80.6539, type: 'hub' },
  { id: 's3', name: 'Besant Road', lat: 16.5153, lng: 80.6318, type: 'stop' },
  { id: 's4', name: 'Kanaka Durga Temple', lat: 16.5137, lng: 80.6054, type: 'stop' },
  { id: 's5', name: 'Railway Station', lat: 16.5186, lng: 80.6202, type: 'hub' },
  { id: 's6', name: 'Gannavaram Airport', lat: 16.5300, lng: 80.7400, type: 'hub' },
  { id: 's7', name: 'PVP Square', lat: 16.5024, lng: 80.6454, type: 'stop' },
  { id: 's8', name: 'Auto Nagar', lat: 16.4957, lng: 80.6800, type: 'stop' },
  { id: 's9', name: 'NTR Circle', lat: 16.5050, lng: 80.6480, type: 'stop' },
  { id: 's10', name: 'Ramavarappadu', lat: 16.5350, lng: 80.6650, type: 'hub' },
  { id: 's11', name: 'Gollapudi', lat: 16.5400, lng: 80.5800, type: 'stop' },
  { id: 's12', name: 'Siddhartha College', lat: 16.5000, lng: 80.6600, type: 'stop' },
  { id: 's13', name: 'Gunadala', lat: 16.5300, lng: 80.6500, type: 'stop' },
  { id: 's14', name: 'Milk Project', lat: 16.5280, lng: 80.6000, type: 'stop' },
  { id: 's15', name: 'KR Market', lat: 16.5120, lng: 80.6120, type: 'hub' },
  { id: 's16', name: 'Kanuru', lat: 16.4880, lng: 80.6950, type: 'stop' },
  { id: 's17', name: 'Penamaluru', lat: 16.4750, lng: 80.7250, type: 'hub' },
  { id: 's18', name: 'Vuyyuru', lat: 16.3700, lng: 80.8400, type: 'hub' },
];

const LINES = [
  { id: 'L_31J_11J', name: '31J / 11J', desc: 'Autonagar ↔ Milk Project', color: '#ea580c', type: 'bus', stations: ['s8', 's12', 's2', 's7', 's1', 's15', 's14'] },
  { id: 'L_222', name: '222 Exp', desc: 'Market ↔ Vuyyuru', color: '#7c3aed', type: 'bus', stations: ['s15', 's1', 's2', 's12', 's8', 's16', 's17', 's18'] },
  { id: 'L_10_23H', name: '10 / 23H', desc: 'Rly Station ↔ Penamaluru', color: '#0891b2', type: 'bus', stations: ['s5', 's1', 's2', 's12', 's8', 's16', 's17'] },
  { id: 'L_55', name: '55 Route', desc: 'Market ↔ Kanuru', color: '#db2777', type: 'bus', stations: ['s15', 's5', 's1', 's2', 's12', 's16'] },
  { id: 'L_3', name: 'No. 3', desc: 'PNBS ↔ Airport', color: '#16a34a', type: 'bus', stations: ['s1', 's3', 's9', 's2', 's12', 's10', 's6'] },
  { id: 'L_218', name: '218', desc: 'PNBS ↔ Vuyyuru', color: '#dc2626', type: 'bus', stations: ['s1', 's2', 's8', 's16', 's17', 's18'] },
  { id: 'L_M1', name: 'Metro M1', desc: 'Gollapudi ↔ Ramavarappadu', color: '#2563eb', type: 'metro', stations: ['s11', 's4', 's1', 's5', 's3', 's2', 's10'] }
];

// --- Icons ---
const Icons = {
  Map: ({ active }) => <svg width="24" height="24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "2"} viewBox="0 0 24 24"><path d="M9 20l-5.447 2.724A1 1 0 0 1 2 21.832V2.168a1 1 0 0 1 1.447-.894L9 4m0 16v-16m0 16l6-3m-6 3l-6-3m12 3V4m0 16l5.447 2.724A1 1 0 0 0 22 21.832V2.168a1 1 0 0 0-1.447-.894L15 4m0 0L9 4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Navigation: ({ active }) => <svg width="24" height="24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "2"} viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  User: ({ active }) => <svg width="24" height="24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "2"} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Ticket: ({ active }) => <svg width="24" height="24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "2"} viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2" strokeLinecap="round"/><circle cx="12" cy="12" r="2" strokeLinecap="round"/><path d="M6 12h.01M18 12h.01" strokeLinecap="round" strokeWidth="3"/></svg>,
  Wallet: ({ active }) => <svg width="24" height="24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "2"} viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M7 12h.01" /><path d="M7 16h.01" /><path d="M7 8h.01" /><path d="M16 12h2" /></svg>,
  Bus: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ArrowRight: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" strokeLinejoin="round"/><polyline points="12 5 19 12 12 19" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ArrowLeft: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  MapPin: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Plus: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  History: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="12 8 12 12 14 14"></polyline><path d="M3.05 11a9 9 0 1 1 .5 9m-.5-9v-5.5"></path></svg>,
  ChevronRight: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>,
  Alert: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
  Close: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
};

// 2. Simulation Logic
const useBusSimulation = () => {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    const initialBuses = LINES.map((line, idx) => {
      const busCount = line.type === 'metro' ? 2 : 2; 
      return Array(busCount).fill(null).map((_, i) => ({
        id: `BUS-${line.id}-${i}`,
        routeId: line.id,
        color: line.color,
        label: line.name,
        progress: Math.random(), 
        direction: Math.random() > 0.5 ? 1 : -1, 
        speed: 0.0005 + (Math.random() * 0.0005), 
      }));
    }).flat();
    setBuses(initialBuses);

    const interval = setInterval(() => {
      setBuses(prev => prev.map(bus => {
        let newProgress = bus.progress + (bus.speed * bus.direction);
        let newDirection = bus.direction;
        if (newProgress >= 1) { newProgress = 1; newDirection = -1; } 
        else if (newProgress <= 0) { newProgress = 0; newDirection = 1; }
        return { ...bus, progress: newProgress, direction: newDirection };
      }));
    }, 50); 

    return () => clearInterval(interval);
  }, []);

  const getBusPosition = useCallback((bus) => {
    const line = LINES.find(l => l.id === bus.routeId);
    if (!line) return null;
    
    const totalStations = line.stations.length;
    if (totalStations < 2) return null;

    const segmentLength = 1 / (totalStations - 1);
    const currentSegmentIndex = Math.floor(bus.progress / segmentLength);
    const nextSegmentIndex = Math.min(currentSegmentIndex + 1, totalStations - 1);
    
    const startId = line.stations[currentSegmentIndex];
    const endId = line.stations[nextSegmentIndex];

    if (!startId || !endId) return null; 

    const startStation = STATIONS.find(s => s.id === startId);
    const endStation = STATIONS.find(s => s.id === endId);

    if (!startStation || !endStation) return null; 

    const segmentProgress = (bus.progress - (currentSegmentIndex * segmentLength)) / segmentLength;
    const lat = startStation.lat + (endStation.lat - startStation.lat) * segmentProgress;
    const lng = startStation.lng + (endStation.lng - startStation.lng) * segmentProgress;
    return { lat, lng };
  }, []);

  return { buses, getBusPosition };
};

// 3. Pure React Tile Map (No Leaflet)
// --- Map Math Utils (Mercator Projection) ---
const TILE_SIZE = 256;
const project = (lat, lng, zoom) => {
  const n = Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * n * TILE_SIZE;
  const latRad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n * TILE_SIZE;
  return { x, y };
};

const RealMap = ({ mini = false, buses, getBusPosition, selectedRoute }) => {
    const containerRef = useRef(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

    // Vijayawada Config
    const centerLat = 16.5062;
    const centerLng = 80.6480;
    const zoom = mini ? 12 : 13;

    // Calculate Center in Pixels
    const centerPixel = useMemo(() => project(centerLat, centerLng, zoom), [zoom]);

    // Interaction Handlers
    const handleMouseDown = (e) => {
        if (mini) return;
        setIsDragging(true);
        setLastPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || mini) return;
        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => setIsDragging(false);
    
    // Touch Events for Mobile
    const handleTouchStart = (e) => {
        if (mini) return;
        setIsDragging(true);
        setLastPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    };
    
    const handleTouchMove = (e) => {
        if (!isDragging || mini) return;
        const dx = e.touches[0].clientX - lastPos.x;
        const dy = e.touches[0].clientY - lastPos.y;
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    };

    // Tile Generation
    const tiles = useMemo(() => {
        const numTiles = Math.pow(2, zoom);
        // Determine which tiles cover the view area based on centerPixel
        // We just load a fixed grid 5x5 around the center for simplicity
        const centerTileX = Math.floor(centerPixel.x / TILE_SIZE);
        const centerTileY = Math.floor(centerPixel.y / TILE_SIZE);
        
        const grid = [];
        const range = mini ? 2 : 3; // Load 3 tiles in each direction
        
        for (let x = centerTileX - range; x <= centerTileX + range; x++) {
            for (let y = centerTileY - range; y <= centerTileY + range; y++) {
                // Wrap X for world repetition if needed (not strictly needed for local city map)
                const safeX = ((x % numTiles) + numTiles) % numTiles; 
                grid.push({
                    x: x,
                    y: y,
                    src: mini 
                      ? `https://a.basemaps.cartocdn.com/dark_all/${zoom}/${safeX}/${y}.png`
                      : `https://tile.openstreetmap.org/${zoom}/${safeX}/${y}.png`,
                    style: {
                        position: 'absolute',
                        left: x * TILE_SIZE,
                        top: y * TILE_SIZE,
                        width: TILE_SIZE,
                        height: TILE_SIZE,
                    }
                });
            }
        }
        return grid;
    }, [centerPixel, zoom, mini]);

    // Calculate container size to center the map
    const containerWidth = containerRef.current ? containerRef.current.clientWidth : 400;
    const containerHeight = containerRef.current ? containerRef.current.clientHeight : 800;
    
    // Global Transform to center the specific coordinate + apply offset
    const mapStyle = {
        transform: `translate(${containerWidth/2 - centerPixel.x + offset.x}px, ${containerHeight/2 - centerPixel.y + offset.y}px)`,
        willChange: 'transform',
        cursor: isDragging ? 'grabbing' : (mini ? 'default' : 'grab')
    };

    return (
        <div 
            ref={containerRef} 
            className={`w-full h-full relative overflow-hidden ${mini ? 'bg-slate-900' : 'bg-gray-100'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
        >
            <div style={mapStyle} className="absolute top-0 left-0 w-0 h-0">
                {/* 1. Render Tiles */}
                {tiles.map(tile => (
                    <img 
                        key={`${tile.x}-${tile.y}`} 
                        src={tile.src} 
                        alt="" 
                        style={tile.style} 
                        className="select-none pointer-events-none" // Prevent image dragging
                    />
                ))}

                {/* 2. Render Route Lines (SVG Overlay) */}
                <svg className="absolute top-0 left-0 overflow-visible" style={{width: 1, height: 1}}>
                    {LINES.map(line => {
                         const points = line.stations.map(sid => {
                             const s = STATIONS.find(st => st.id === sid);
                             const p = project(s.lat, s.lng, zoom);
                             return `${p.x},${p.y}`;
                         }).join(' ');

                         const isSelected = selectedRoute?.id === line.id;
                         const isDimmed = selectedRoute && !isSelected;
                         
                         return (
                             <polyline 
                                key={line.id}
                                points={points}
                                fill="none"
                                stroke={line.color}
                                strokeWidth={mini ? 2 : (isSelected ? 6 : 3)}
                                strokeOpacity={mini ? 0.4 : (isDimmed ? 0.1 : 0.6)}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                             />
                         );
                    })}
                </svg>

                {/* 3. Render Stations */}
                {STATIONS.map(s => {
                    const p = project(s.lat, s.lng, zoom);
                    const isHub = s.type === 'hub';
                    return (
                        <div 
                            key={s.id} 
                            className="absolute flex flex-col items-center justify-center"
                            style={{ 
                                left: p.x, 
                                top: p.y, 
                                transform: 'translate(-50%, -50%)' 
                            }}
                        >
                            <div 
                                className={`rounded-full border border-white shadow-sm ${mini ? 'bg-white' : 'bg-slate-800'}`}
                                style={{
                                    width: isHub ? (mini?6:12) : (mini?4:8),
                                    height: isHub ? (mini?6:12) : (mini?4:8),
                                    opacity: mini ? 0.6 : 1
                                }}
                            />
                            {!mini && isHub && (
                                <div className="mt-1 bg-white px-1.5 py-0.5 rounded border border-gray-200 shadow text-[9px] font-bold text-gray-700 whitespace-nowrap">
                                    {s.name}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* 4. Render Buses */}
                {buses.map(bus => {
                    const pos = getBusPosition(bus);
                    if(!pos) return null;
                    const p = project(pos.lat, pos.lng, zoom);
                    
                    if (selectedRoute && bus.routeId !== selectedRoute.id) return null;

                    return (
                        <div
                            key={bus.id}
                            className="absolute transition-all duration-75 ease-linear"
                            style={{
                                left: p.x,
                                top: p.y,
                                transform: 'translate(-50%, -50%)',
                                zIndex: 50
                            }}
                        >
                             <div 
                                style={{
                                    backgroundColor: bus.color,
                                    width: mini ? 8 : 14,
                                    height: mini ? 8 : 14,
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                                }} 
                                className="rounded-full border-2 border-white" 
                             />
                        </div>
                    );
                })}
            </div>
            
            {!mini && <div className="absolute bottom-1 right-1 bg-white/80 px-2 py-0.5 text-[10px] rounded shadow z-50 pointer-events-none">© OpenStreetMap</div>}
            {!mini && <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium pointer-events-none animate-pulse">Drag to pan map</div>}
        </div>
    );
};

// --- Views ---

const LoginView = ({ onLogin }) => {
    const [phone, setPhone] = useState('');

    const handleLogin = () => {
        if(phone.length === 10) {
            onLogin({ name: 'Commuter', phone });
        }
    };

    return (
        <div className="h-full bg-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-indigo-50 to-white -z-10"></div>
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl mb-6 shadow-xl flex items-center justify-center text-white transform -rotate-6">
                <Icons.Bus />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MetroGo</h1>
            <p className="text-gray-500 mb-8 text-center">Vijayawada's Transit App</p>

            <div className="w-full max-w-xs">
                <div className="space-y-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
                        <span className="font-bold text-gray-400">+91</span>
                        <input 
                            type="tel" 
                            className="bg-transparent w-full outline-none font-medium text-lg" 
                            placeholder="99999 99999"
                            value={phone}
                            onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                        />
                    </div>
                    <button 
                        onClick={handleLogin}
                        disabled={phone.length !== 10}
                        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all active:scale-95"
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
};

const HomeView = ({ user, onSearch, onQuickAction, buses, getBusPosition }) => {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    return (
        <div className="flex flex-col h-full">
            <div className="relative h-[320px] bg-slate-900 overflow-hidden rounded-b-[3rem] shadow-2xl z-10">
                <div className="absolute inset-0">
                    {/* RealMap Mini View (Dark Mode) */}
                    <RealMap mini={true} buses={buses} getBusPosition={getBusPosition} />
                </div>
                {/* Lighter overlay so map is visible */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/10 to-white/90 pointer-events-none" />
                
                <div className="relative z-20 pt-12 px-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Hi, {user ? user.name : 'Traveler'} 👋</h1>
                            <p className="text-indigo-200 text-sm">Where are you going?</p>
                        </div>
                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-indigo-400">
                            {user ? user.name[0] : 'T'}
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-6 right-6 transform translate-y-1/2 z-30">
                    <div className="bg-white rounded-3xl shadow-xl p-5 border border-gray-100">
                        <div className="space-y-3">
                            <div className="relative">
                                <div className="absolute left-3 top-3.5 text-gray-400"><Icons.MapPin /></div>
                                <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 outline-none appearance-none">
                                    <option value="">From Location</option>
                                    {STATIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-3.5 text-gray-400"><Icons.Navigation /></div>
                                <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 outline-none appearance-none">
                                    <option value="">To Destination</option>
                                    {STATIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <button onClick={() => onSearch(from, to)} disabled={!from || !to || from === to} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform disabled:opacity-50">
                                Find Route <Icons.ArrowRight />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 pt-24 px-6 pb-24 overflow-y-auto">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Nearby Routes</h2>
                <div className="space-y-3">
                    {LINES.slice(0, 3).map(line => (
                        <div key={line.id} onClick={() => onQuickAction(line)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer">
                             <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md" style={{backgroundColor: line.color}}>
                                 {line.name.split(' ')[0]}
                             </div>
                             <div className="flex-1">
                                 <h3 className="font-bold text-gray-900 text-sm">{line.name}</h3>
                                 <p className="text-xs text-gray-500">{line.desc}</p>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ResultsView = ({ results, onBack, onBuy }) => {
    if (!results) return null;
    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="bg-white px-6 pt-12 pb-4 shadow-sm z-10">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 text-sm font-medium mb-4 hover:text-indigo-600">
                    <Icons.ArrowLeft /> Back
                </button>
                <h1 className="text-xl font-bold text-gray-900">Routes Found</h1>
            </div>
            <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
                {results.map((route) => (
                    <div key={route.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                             <div className="flex flex-wrap gap-2">
                                {route.lines.map((line, i) => (
                                    <span key={i} className="px-2 py-1 rounded-md text-xs font-bold text-white shadow-sm" style={{backgroundColor: line.color}}>{line.name}</span>
                                ))}
                            </div>
                            <span className="font-bold text-xl text-gray-900">₹{route.price}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div><span className="font-bold text-sm text-gray-900">{route.departure}</span></div>
                            <div className="text-xs font-bold text-indigo-600">{route.duration} min</div>
                            <div><span className="font-bold text-sm text-gray-900">{route.arrival}</span></div>
                        </div>
                        <button onClick={() => onBuy(route)} className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-bold shadow-lg active:scale-95 transition-transform">Buy Ticket</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const WalletView = ({ balance, onAddMoney, history }) => (
    <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-slate-900 text-white px-6 pt-12 pb-8 rounded-b-[2.5rem] shadow-2xl">
             <h1 className="text-xl font-bold opacity-80 mb-6">MetroGo Wallet</h1>
             <div className="flex items-end gap-1">
                 <span className="text-4xl font-bold">₹{balance}</span>
             </div>
             <p className="text-sm text-indigo-200 mt-1">Available Balance</p>
             <div className="grid grid-cols-2 gap-4 mt-8">
                 <button onClick={onAddMoney} className="py-3 bg-indigo-500 text-white font-bold rounded-xl text-sm shadow-lg flex items-center justify-center gap-2"><Icons.Plus /> Add Money</button>
                 <button className="py-3 bg-white/10 text-white font-bold rounded-xl text-sm border border-white/10 flex items-center justify-center gap-2"><Icons.History /> History</button>
             </div>
        </div>
        <div className="flex-1 px-6 py-6 overflow-y-auto pb-24">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Transactions</h2>
            <div className="space-y-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {history.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
                        <div>
                            <p className="font-bold text-sm text-gray-900">{tx.title}</p>
                            <p className="text-xs text-gray-400">{tx.date}</p>
                        </div>
                        <span className={`font-bold text-sm ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>{tx.type === 'credit' ? '+' : '-'}₹{tx.amount}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const SupportChat = ({ onClose }) => {
    const [msgs, setMsgs] = useState([{ id: 1, text: "Hi! How can I help you?", sender: 'bot' }]);
    const [input, setInput] = useState('');
    
    const send = () => {
        if(!input.trim()) return;
        setMsgs(p => [...p, { id: Date.now(), text: input, sender: 'user' }]);
        setInput('');
        setTimeout(() => setMsgs(p => [...p, { id: Date.now()+1, text: "We are checking this for you.", sender: 'bot' }]), 1000);
    };

    return (
        <div className="absolute inset-0 bg-white z-50 flex flex-col">
            <div className="bg-indigo-600 p-4 flex items-center justify-between text-white">
                <h2 className="font-bold">Support</h2>
                <button onClick={onClose}><Icons.Close /></button>
            </div>
            <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-3">
                {msgs.map(m => (
                    <div key={m.id} className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.sender === 'user' ? 'bg-indigo-600 text-white self-end ml-auto' : 'bg-white text-gray-800 border border-gray-200'}`}>{m.text}</div>
                ))}
            </div>
            <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                <input className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none" placeholder="Type..." value={input} onChange={e => setInput(e.target.value)} />
                <button onClick={send} className="w-10 h-10 bg-indigo-600 rounded-full text-white flex items-center justify-center"><Icons.ArrowRight /></button>
            </div>
        </div>
    );
};

// --- Main App ---
const MetroGoApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home'); 
  const [searchResults, setSearchResults] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [walletHistory, setWalletHistory] = useState([{ title: 'Welcome Bonus', date: 'Today', amount: 100, type: 'credit' }]);
  const [balance, setBalance] = useState(100);
  const [tickets, setTickets] = useState([]);
  const [showChat, setShowChat] = useState(false);

  const { buses, getBusPosition } = useBusSimulation();

  const handleLogin = (u) => { setUser(u); setIsLoggedIn(true); };

  const handleSearch = (fromId, toId) => {
    const relevantLines = LINES.filter(l => l.stations.includes(fromId) || l.stations.includes(toId));
    let displayLines = relevantLines.length > 0 ? relevantLines : [LINES[0], LINES[2]]; 
    setSearchResults([
      { id: 'r1', lines: [displayLines[0]], duration: 25, price: 25, departure: '10:10 AM', arrival: '10:35 AM' },
      { id: 'r2', lines: [LINES[3], LINES[2]], duration: 45, price: 40, departure: '10:15 AM', arrival: '11:00 AM' }
    ]);
    setCurrentView('results');
  };

  const handleBuy = (route) => {
      if(balance < route.price) { alert("Low Balance"); return; }
      setBalance(b => b - route.price);
      setTickets(t => [{id: Date.now(), lines: route.lines.map(l=>l.name), price: route.price}, ...t]);
      setWalletHistory(h => [{title: 'Ticket', date: 'Now', amount: route.price, type: 'debit'}, ...h]);
      setCurrentView('tickets');
  };

  if (!isLoggedIn) return <LoginView onLogin={handleLogin} />;

  return (
    <ErrorBoundary>
      <div className="font-sans h-screen w-full bg-white overflow-hidden flex flex-col relative max-w-md mx-auto shadow-2xl border-x border-gray-100">
        <div className="flex-1 relative h-full w-full overflow-hidden">
            {currentView === 'home' && <HomeView user={user} onSearch={handleSearch} onQuickAction={(l) => { setSelectedRoute(l); setCurrentView('map'); }} buses={buses} getBusPosition={getBusPosition} />}
            {currentView === 'results' && <ResultsView results={searchResults} onBack={() => setCurrentView('home')} onBuy={handleBuy} />}
            {currentView === 'map' && (
                <>
                    <div className="absolute top-4 left-4 z-[400]"><button onClick={() => { setSelectedRoute(null); setCurrentView('home'); }} className="bg-white p-3 rounded-full shadow-md"><Icons.ArrowLeft /></button></div>
                    {/* Real Interactive Map */}
                    <RealMap buses={buses} getBusPosition={getBusPosition} selectedRoute={selectedRoute} />
                    
                    {selectedRoute && (
                        <div className="absolute bottom-24 left-4 right-4 z-[400] flex flex-col justify-end pointer-events-none">
                             {/* Card Container */}
                             <div className="bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto max-h-[60vh] flex flex-col animate-bounce-in border border-gray-100">
                                {/* Header */}
                                <div className="p-5 bg-indigo-600 text-white shrink-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-xl">{selectedRoute.name}</h3>
                                            <p className="text-indigo-100 text-sm mt-1">{selectedRoute.desc}</p>
                                        </div>
                                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Live</span>
                                    </div>
                                </div>
                                
                                {/* Timeline Body */}
                                <div className="overflow-y-auto p-5 bg-white custom-scrollbar">
                                    <div className="relative ml-2 space-y-0">
                                        {/* Vertical Line */}
                                        <div className="absolute left-1.5 top-2 bottom-4 w-0.5 bg-gray-100"></div>
                                        
                                        {selectedRoute.stations.map((sid, i) => {
                                            const st = STATIONS.find(s => s.id === sid);
                                            // Mock Time Calculation
                                            const time = new Date();
                                            time.setMinutes(time.getMinutes() + (i * 7)); // 7 mins per stop
                                            const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                            
                                            return (
                                                <div key={i} className="relative flex items-start pb-8 last:pb-0 pl-8 group">
                                                    {/* Timeline Dot */}
                                                    <div className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm z-10 ${i === 0 ? 'bg-indigo-600 ring-4 ring-indigo-100' : (i === selectedRoute.stations.length - 1 ? 'bg-gray-900' : 'bg-gray-300')}`}></div>
                                                    
                                                    <div className="flex-1 flex justify-between items-start -mt-1">
                                                        <div>
                                                            <h4 className={`text-sm font-bold ${i === 0 ? 'text-indigo-600' : 'text-gray-900'}`}>{st.name}</h4>
                                                            <p className="text-xs text-gray-400 mt-0.5">{st.type === 'hub' ? 'Transit Hub' : 'Bus Stop'}</p>
                                                        </div>
                                                        <div className="text-xs font-bold text-gray-500 tabular-nums bg-gray-50 px-2 py-1 rounded">
                                                            {timeStr}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}
                </>
            )}
            {currentView === 'wallet' && <WalletView balance={balance} onAddMoney={() => { setBalance(b=>b+100); setWalletHistory(h=>[{title:'Topup', date:'Now', amount:100, type:'credit'}, ...h]) }} history={walletHistory} />}
            {currentView === 'tickets' && (
                <div className="p-6 bg-gray-50 h-full overflow-y-auto pb-24">
                    <h2 className="text-2xl font-bold mb-6">Tickets</h2>
                    {tickets.map(t => (
                        <div key={t.id} className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-200">
                            <div className="font-bold mb-2">{t.lines.join(' + ')}</div>
                            <div className="text-xs text-gray-500">Active • ₹{t.price}</div>
                        </div>
                    ))}
                </div>
            )}
            {currentView === 'profile' && (
                <div className="p-6 bg-gray-50 h-full">
                    <h1 className="text-2xl font-bold mb-6">Profile</h1>
                    <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 mb-6">
                         <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">{user.name[0]}</div>
                         <div><h2 className="font-bold">{user.name}</h2><p className="text-sm text-gray-500">+91 {user.phone}</p></div>
                    </div>
                    <button onClick={() => setShowChat(true)} className="w-full bg-white p-4 rounded-xl shadow-sm text-left mb-3">Help & Support</button>
                    <button onClick={() => setIsLoggedIn(false)} className="w-full bg-white p-4 rounded-xl shadow-sm text-left text-red-500">Log Out</button>
                </div>
            )}
        </div>

        <div className="fixed bottom-6 left-0 right-0 z-[1000] flex justify-center pointer-events-none">
          <div className="pointer-events-auto bg-white border border-gray-200 text-gray-400 rounded-full shadow-2xl flex justify-between items-center py-2 px-4 w-[90%] max-w-[320px]">
            {['home', 'map', 'wallet', 'tickets', 'profile'].map(id => (
                <button key={id} onClick={() => { setSelectedRoute(null); setCurrentView(id); }} className={`p-3 rounded-full transition-all ${currentView === id ? 'bg-indigo-600 text-white -translate-y-2 shadow-lg' : ''}`}>
                    {id === 'home' && <Icons.Navigation active={currentView===id}/>}
                    {id === 'map' && <Icons.Map active={currentView===id}/>}
                    {id === 'wallet' && <Icons.Wallet active={currentView===id}/>}
                    {id === 'tickets' && <Icons.Ticket active={currentView===id}/>}
                    {id === 'profile' && <Icons.User active={currentView===id}/>}
                </button>
            ))}
          </div>
        </div>
        
        {showChat && <SupportChat onClose={() => setShowChat(false)} />}
      </div>
      <style>{`
          @keyframes bounce-in { 0% { transform: translate(-50%, -100%); opacity: 0; } 60% { transform: translate(-50%, 10%); opacity: 1; } 100% { transform: translate(-50%, 0); opacity: 1; } }
          .animate-bounce-in { animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </ErrorBoundary>
  );
};

export default MetroGoApp;
