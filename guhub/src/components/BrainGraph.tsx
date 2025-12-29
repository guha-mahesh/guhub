import { useRef, useState, useCallback, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { nodes } from '../data/graphNodes';
import { links } from '../data/graphLinks';
import { galaxies, type GalaxyType } from '../data/galaxyData';
import './BrainGraph.css';

interface NodeObject {
  id: string;
  name: string;
  galaxy: GalaxyType;
  x?: number;
  y?: number;
  z?: number;
}

interface BrainGraphProps {
  externalHoveredGalaxy?: GalaxyType | null;
}

const BrainGraph = ({ externalHoveredGalaxy = null }: BrainGraphProps) => {
  const graphRef = useRef<any>(null);
  const [internalHoveredGalaxy, setInternalHoveredGalaxy] = useState<GalaxyType | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeObject | null>(null);

  // Use external hover if provided, otherwise use internal
  const hoveredGalaxy = externalHoveredGalaxy ?? internalHoveredGalaxy;

  useEffect(() => {
    if (graphRef.current) {
      // Camera settings - zoomed way out for full overview
      const distance = 1200;
      graphRef.current.cameraPosition({ z: distance });

      // Let simulation run briefly then stop it to prevent constant movement
      setTimeout(() => {
        if (graphRef.current) {
          graphRef.current.d3Force('charge').strength(0);
          graphRef.current.d3Force('link').strength(0);
        }
      }, 3000);
    }
  }, []);

  const handleZoomIn = () => {
    if (graphRef.current) {
      const currentPos = graphRef.current.cameraPosition();
      graphRef.current.cameraPosition({ z: currentPos.z - 200 }, 300);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      const currentPos = graphRef.current.cameraPosition();
      graphRef.current.cameraPosition({ z: currentPos.z + 200 }, 300);
    }
  };

  const handleNodeHover = useCallback((node: NodeObject | null) => {
    if (node) {
      setInternalHoveredGalaxy(node.galaxy);
    } else {
      setInternalHoveredGalaxy(null);
    }
  }, []);

  const handleNodeClick = useCallback((node: NodeObject) => {
    setSelectedNode(node);
  }, []);

  const getNodeOpacity = (node: NodeObject) => {
    if (!hoveredGalaxy) return 1.0;
    return node.galaxy === hoveredGalaxy ? 1.0 : 0.1;
  };

  const getLinkOpacity = (link: any) => {
    if (!hoveredGalaxy) return 0.3;
    const sourceNode = nodes.find(n => n.id === link.source.id || n.id === link.source);
    const targetNode = nodes.find(n => n.id === link.target.id || n.id === link.target);
    if (sourceNode?.galaxy === hoveredGalaxy || targetNode?.galaxy === hoveredGalaxy) {
      return 0.5;
    }
    return 0.05;
  };

  return (
    <div className="brainGraphContainer">
      <ForceGraph3D
        ref={graphRef}
        graphData={{ nodes, links }}
        nodeLabel="name"
        nodeColor={(node: any) => {
          const opacity = getNodeOpacity(node);
          const color = galaxies[node.galaxy as GalaxyType].color;
          return `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${opacity})`;
        }}
        nodeVal={5}
        nodeOpacity={1}
        onNodeHover={handleNodeHover}
        onNodeClick={handleNodeClick}
        linkColor={(link: any) => {
          const opacity = getLinkOpacity(link);
          return `rgba(255, 192, 203, ${opacity})`;
        }}
        linkWidth={1}
        linkOpacity={1}
        backgroundColor="#2f0a0a"
        showNavInfo={false}
        enableNodeDrag={true}
        enableNavigationControls={true}
        controlType="orbit"
        cooldownTime={3000}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />

      <div className="zoomControls">
        <button className="zoomButton" onClick={handleZoomIn} title="Zoom In">+</button>
        <button className="zoomButton" onClick={handleZoomOut} title="Zoom Out">-</button>
      </div>

      {selectedNode && (
        <div className="nodeModal">
          <button
            className="closeModal"
            onClick={() => setSelectedNode(null)}
          >
            ×
          </button>
          <h2>{selectedNode.name}</h2>
          <p className="galaxyLabel" style={{ color: galaxies[selectedNode.galaxy].color }}>
            {galaxies[selectedNode.galaxy].name}
          </p>
          {(selectedNode as any).description && (
            <p className="nodeDescription">{(selectedNode as any).description}</p>
          )}
        </div>
      )}

      {selectedNode && (
        <div
          className="modalOverlay"
          onClick={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
};

export default BrainGraph;
