import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

interface CrowsFootEdgeData {
  label?: string;
}

const CrowsFootEdge: React.FC<EdgeProps<CrowsFootEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Calculate crow's foot position (at the target end)
  const footSize = 10;
  const angle = Math.atan2(targetY - sourceY, targetX - sourceX);

  // Three lines for the crow's foot
  const foot1X = targetX - footSize * Math.cos(angle - Math.PI / 6);
  const foot1Y = targetY - footSize * Math.sin(angle - Math.PI / 6);
  const foot2X = targetX - footSize * Math.cos(angle);
  const foot2Y = targetY - footSize * Math.sin(angle);
  const foot3X = targetX - footSize * Math.cos(angle + Math.PI / 6);
  const foot3Y = targetY - footSize * Math.sin(angle + Math.PI / 6);

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {/* Crow's foot (many side) */}
      <line
        x1={foot2X}
        y1={foot2Y}
        x2={foot1X}
        y2={foot1Y}
        style={{ stroke: style.stroke || '#8B5CF6', strokeWidth: 2 }}
      />
      <line
        x1={foot2X}
        y1={foot2Y}
        x2={targetX}
        y2={targetY}
        style={{ stroke: style.stroke || '#8B5CF6', strokeWidth: 2 }}
      />
      <line
        x1={foot2X}
        y1={foot2Y}
        x2={foot3X}
        y2={foot3Y}
        style={{ stroke: style.stroke || '#8B5CF6', strokeWidth: 2 }}
      />
      {/* Label */}
      {data?.label && (
        <text>
          <textPath
            href={`#${id}`}
            style={{ fontSize: 10, fill: '#6b7280' }}
            startOffset="50%"
            textAnchor="middle"
          >
            {data.label}
          </textPath>
        </text>
      )}
    </>
  );
};

export default CrowsFootEdge;
