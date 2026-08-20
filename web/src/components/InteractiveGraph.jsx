import { useState } from 'react'
import { Terminal, Shield, CheckCircle2, XCircle, Search, ZoomIn, ZoomOut } from 'lucide-react'

const NODES = [
  // Core / Source Files (Ink/Dark)
  { id: 'gate', name: 'friction.gate', x: 130, y: 160, radius: 13, type: 'source', desc: 'CI check coordinator' },
  { id: 'cli', name: 'friction.cli', x: 70, y: 110, radius: 10, type: 'source', desc: 'Command line interface' },
  { id: 'arms', name: 'friction.arms', x: 90, y: 220, radius: 12, type: 'source', desc: 'Graph arm comparator' },
  { id: 'connectivity', name: 'friction.connectivity', x: 230, y: 190, radius: 11, type: 'source', desc: 'Call graph parser' },
  { id: 'subgraph', name: 'friction.subgraph', x: 250, y: 250, radius: 9, type: 'source', desc: 'Reachability engine' },
  { id: 'viz', name: 'friction.viz', x: 180, y: 270, radius: 11, type: 'source', desc: 'Graph visualizer' },
  { id: 'live', name: 'friction.live', x: 150, y: 80, radius: 11, type: 'source', desc: 'Live world model server' },
  { id: 'mcp', name: 'friction.mcp_server', x: 270, y: 100, radius: 12, type: 'source', desc: 'MCP server' },
  { id: 'triage', name: 'friction.triage', x: 200, y: 130, radius: 10, type: 'source', desc: 'Blast radius scorer' },
  
  // Changed Files (Orange)
  { id: 'delta', name: 'friction.delta', x: 190, y: 60, radius: 13, type: 'changed', desc: 'Changed code symbol' },
  { id: 'loader', name: 'friction.loader', x: 140, y: 200, radius: 10, type: 'changed', desc: 'Dynamic class loader' },

  // Tests (Gold/Olive)
  { id: 'test_gate', name: 'tests.test_gate', x: 420, y: 120, radius: 13, type: 'test', desc: 'Guarding test for Refusals' },
  { id: 'test_arms', name: 'tests.test_arms', x: 450, y: 200, radius: 12, type: 'test', desc: 'Guarding test for Parity' },
  { id: 'test_mcp', name: 'tests.test_mcp', x: 480, y: 90, radius: 10, type: 'test', desc: 'Guarding test for MCP tool schema' },
  { id: 'test_triage', name: 'tests.test_triage', x: 400, y: 280, radius: 11, type: 'test', desc: 'Guarding test for Triage blast bounds' },
  { id: 'test_live', name: 'tests.test_live', x: 490, y: 260, radius: 9, type: 'test', desc: 'Guarding test for Live model updates' },

  // Tiny network decoration nodes (Small dots)
  { id: 'd1', name: 'parsing.scip', x: 310, y: 60, radius: 4, type: 'dot', desc: 'SCIP indexing bindings' },
  { id: 'd2', name: 'parsing.pyright', x: 330, y: 125, radius: 5, type: 'dot', desc: 'Pyright semantic server' },
  { id: 'd3', name: 'common_cause', x: 350, y: 180, radius: 4, type: 'dot', desc: 'Common cause graph matcher' },
  { id: 'd4', name: 'baselines', x: 360, y: 240, radius: 5, type: 'dot', desc: 'Historical baselines' },
  { id: 'd5', name: 'fidelity', x: 280, y: 290, radius: 4, type: 'dot', desc: 'Fidelity tests evaluator' },
  { id: 'd6', name: 'throughput', x: 230, y: 310, radius: 5, type: 'dot', desc: 'Throughput statistics logger' },
  { id: 'd7', name: 'trace', x: 380, y: 310, radius: 4, type: 'dot', desc: 'AST walk execution trace' },
]

const EDGES = [
  // Core connections
  { source: 'cli', target: 'gate' },
  { source: 'gate', target: 'arms' },
  { source: 'gate', target: 'triage' },
  { source: 'gate', target: 'connectivity' },
  { source: 'triage', target: 'live' },
  { source: 'connectivity', target: 'subgraph' },
  { source: 'subgraph', target: 'viz' },
  { source: 'mcp', target: 'triage' },
  { source: 'mcp', target: 'gate' },
  
  // Changes connections
  { source: 'delta', target: 'live' },
  { source: 'loader', target: 'gate' },
  { source: 'loader', target: 'connectivity' },
  
  // Test paths
  { source: 'connectivity', target: 'd2' },
  { source: 'd2', target: 'test_gate' },
  { source: 'subgraph', target: 'd4' },
  { source: 'd4', target: 'test_arms' },
  { source: 'triage', target: 'd3' },
  { source: 'd3', target: 'test_triage' },
  { source: 'mcp', target: 'd1' },
  { source: 'd1', target: 'test_mcp' },
  { source: 'viz', target: 'd5' },
  { source: 'd5', target: 'test_live' },

  // Gaps / Dynamic matched paths (Dashed/Missing in Name-Matched arm, Solid in Type-Resolved)
  { source: 'gate', target: 'test_gate', gap: true },
  { source: 'arms', target: 'test_arms', gap: true },
  { source: 'live', target: 'test_live', gap: true },
]

export default function InteractiveGraph() {
  const [arm, setArm] = useState('type') // 'name' (Name-Matched) or 'type' (Type-Resolved)
  const [zoom, setZoom] = useState(1.0)
  const [hoveredNode, setHoveredNode] = useState(null)

  // Zoom actions
  const zoomIn = () => setZoom(z => Math.min(z + 0.15, 1.6))
  const zoomOut = () => setZoom(z => Math.max(z - 0.15, 0.6))
  const resetZoom = () => {
    setZoom(1.0)
    setArm(a => a === 'type' ? 'name' : 'type')
  }

  // Get active edges based on the current arm selection
  const activeEdges = EDGES.filter(e => {
    if (e.gap && arm === 'name') return false // Hide gaps in Name-Matched mode
    return true
  })

  // Check if a node is connected to the hovered node
  const isConnectedToHovered = (nodeId) => {
    if (!hoveredNode) return false
    if (nodeId === hoveredNode.id) return true
    return activeEdges.some(e => 
      (e.source === hoveredNode.id && e.target === nodeId) ||
      (e.target === hoveredNode.id && e.source === nodeId)
    )
  }

  // Node styles configuration
  const getNodeColor = (node) => {
    if (hoveredNode && node.id === hoveredNode.id) {
      if (node.type === 'changed') return 'var(--accent)'
      if (node.type === 'test') return '#c79e0a' // Gold
      return 'var(--ink)'
    }

    if (node.type === 'changed') return 'var(--accent)'
    if (node.type === 'test') return '#8b7d0c' // Olive gold
    if (node.type === 'dot') return '#7c7873'
    return 'var(--ink)'
  }

  return (
    <div className="box-dashed group/graph h-full min-h-[460px] flex flex-col justify-between overflow-visible relative">
      {/* Corner Brackets */}
      <span className="absolute top-[-3px] left-[-3px] w-3.5 h-3.5 border-t border-l border-ink/30 group-hover/graph:border-accent transition-all duration-300" />
      <span className="absolute top-[-3px] right-[-3px] w-3.5 h-3.5 border-t border-r border-ink/30 group-hover/graph:border-accent transition-all duration-300" />
      <span className="absolute bottom-[-3px] left-[-3px] w-3.5 h-3.5 border-b border-l border-ink/30 group-hover/graph:border-accent transition-all duration-300" />
      <span className="absolute bottom-[-3px] right-[-3px] w-3.5 h-3.5 border-b border-r border-ink/30 group-hover/graph:border-accent transition-all duration-300" />

      {/* Floating Header Panel - Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10">
        <div>
          <span className="micro-label flex items-center gap-1.5 mb-1 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full status-dot" style={{ background: arm === 'type' ? '#10b981' : '#f59e0b' }} />
            Active Arm: {arm === 'type' ? 'Type-Resolved' : 'Name-Matched'}
          </span>
          <h4 className="font-serif-display text-xl leading-none">AST Dependency Sandbox</h4>
        </div>
        <div className="flex items-center gap-1 bg-ink/5 p-1 rounded-full border border-ink/5">
          <button
            onClick={() => setArm('name')}
            className={`px-3 py-1 text-[11px] font-mono rounded-full transition-all ${
              arm === 'name' 
                ? 'bg-ink text-cream shadow-sm' 
                : 'text-ink-soft hover:bg-ink/5'
            }`}
          >
            Name-Matched
          </button>
          <button
            onClick={() => setArm('type')}
            className={`px-3 py-1 text-[11px] font-mono rounded-full transition-all ${
              arm === 'type' 
                ? 'bg-ink text-cream shadow-sm' 
                : 'text-ink-soft hover:bg-ink/5'
            }`}
          >
            Type-Resolved
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 w-full h-full relative overflow-hidden my-4 flex items-center justify-center min-h-[300px]">
        <svg 
          viewBox="0 0 580 340" 
          className="w-full h-full select-none transition-transform duration-300 origin-center"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Edges layer */}
          <g>
            {EDGES.map((edge, idx) => {
              const fromNode = NODES.find(n => n.id === edge.source)
              const toNode = NODES.find(n => n.id === edge.target)
              if (!fromNode || !toNode) return null

              const isGap = edge.gap
              const isHoveredRoute = hoveredNode && (edge.source === hoveredNode.id || edge.target === hoveredNode.id)
              const isActiveRoute = !isGap || arm === 'type'

              let strokeColor = 'rgba(22, 20, 19, 0.12)'
              if (isHoveredRoute) strokeColor = isGap ? 'var(--accent)' : 'var(--ink)'
              else if (isGap && arm === 'type') strokeColor = 'rgba(255, 87, 26, 0.45)'

              return (
                <line
                  key={`${edge.source}-${edge.target}-${idx}`}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={strokeColor}
                  strokeWidth={isHoveredRoute ? 2 : 1}
                  strokeDasharray={isGap ? '4 3' : 'none'}
                  className="transition-all duration-300"
                  style={{ opacity: !isActiveRoute ? 0.05 : 1 }}
                />
              )
            })}
          </g>

          {/* Nodes layer */}
          <g>
            {NODES.map(node => {
              const isHovered = hoveredNode && node.id === hoveredNode.id
              const isConnected = isConnectedToHovered(node.id)
              const fill = getNodeColor(node)
              
              return (
                <g 
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group/node"
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Outer pulse/glow on hover */}
                  {(isHovered || isConnected) && (
                    <circle
                      r={node.radius + 5}
                      fill={node.type === 'changed' ? 'rgba(255, 87, 26, 0.15)' : 'rgba(22, 20, 19, 0.08)'}
                      className="animate-ping"
                      style={{ animationDuration: '3s' }}
                    />
                  )}
                  
                  {/* Primary Node Circle */}
                  <circle
                    r={node.radius}
                    fill={fill}
                    className="transition-all duration-300 ease-out hover:scale-110"
                    style={{ 
                      stroke: isHovered ? '#fff' : 'none',
                      strokeWidth: isHovered ? 1.5 : 0
                    }}
                  />
                  
                  {/* Labels on non-tiny nodes */}
                  {node.type !== 'dot' && (
                    <text
                      y={node.radius + 14}
                      textAnchor="middle"
                      className="font-mono text-[9px] select-none transition-all duration-300 font-medium"
                      fill={isHovered ? 'var(--ink)' : 'rgba(22,20,19,0.7)'}
                      style={{ fontSize: isHovered ? '10px' : '9px' }}
                    >
                      {node.name.replace('friction.', '').replace('(Changed)', 'Δ')}
                    </text>
                  )}
                </g>
              )
            })}
          </g>

          {/* SVG Tooltip Box */}
          {hoveredNode && (
            <g transform={`translate(${hoveredNode.x > 380 ? hoveredNode.x - 170 : hoveredNode.x + 20}, ${hoveredNode.y > 260 ? hoveredNode.y - 65 : hoveredNode.y - 25})`}>
              <rect
                width={150}
                height={50}
                rx={4}
                fill="var(--ink)"
                filter="drop-shadow(0 4px 8px rgba(0,0,0,0.15))"
              />
              <text x={8} y={16} fill="var(--cream)" className="font-mono text-[10px] font-bold">
                {hoveredNode.name}
              </text>
              <text x={8} y={30} fill="rgba(250,249,246,0.6)" className="font-sans text-[8px]">
                Type: {hoveredNode.type.toUpperCase()}
              </text>
              <text x={8} y={42} fill="rgba(250,249,246,0.8)" className="font-sans text-[8px] font-medium">
                {hoveredNode.desc}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Footer Info & Interactive Dashboard Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pt-4 border-t border-line/40 z-10">
        <div className="max-w-xs font-mono text-[11px] leading-relaxed text-ink-soft">
          {arm === 'name' ? (
            <div className="flex items-start gap-2 text-amber-700 bg-amber-500/5 p-2 rounded border border-amber-500/10">
              <XCircle size={14} className="shrink-0 mt-0.5" />
              <span>
                <strong>Verdict: RUN_FULL (0.314 recall)</strong>. The name-matched arm misses the dashed edges entirely — fail-closed.
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-amber-700 bg-amber-500/5 p-2 rounded border border-amber-500/10">
              <XCircle size={14} className="shrink-0 mt-0.5" />
              <span>
                <strong>Verdict: RUN_FULL (0.419 recall)</strong>. Type resolution recovers the dashed edges — closer, still below the 0.95 bar. No graph class has earned autonomy yet.
              </span>
            </div>
          )}
        </div>

        {/* Action Controls matching the screenshot bottom-right */}
        <div className="flex items-center gap-1.5 self-end">
          <button 
            onClick={zoomOut}
            className="w-8 h-8 rounded-full border border-line bg-paper hover:bg-paper-deep text-ink flex items-center justify-center transition-colors active:scale-95 shadow-sm"
            aria-label="Zoom Out"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <button 
            onClick={zoomIn}
            className="w-8 h-8 rounded-full border border-line bg-paper hover:bg-paper-deep text-ink flex items-center justify-center transition-colors active:scale-95 shadow-sm"
            aria-label="Zoom In"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
          <button 
            onClick={resetZoom}
            className="w-8 h-8 rounded-full border border-line bg-paper hover:bg-paper-deep text-ink flex items-center justify-center transition-colors active:scale-95 shadow-sm"
            aria-label="Toggle Mode / Reset Zoom"
            title="Toggle Matching Arm / Reset"
          >
            <Search size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
