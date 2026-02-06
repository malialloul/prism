import { useEffect, useRef, useState, useCallback } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    ToggleButton,
    ToggleButtonGroup,
    alpha,
    useTheme,
    Skeleton,
    Slider,
    Divider,
} from '@mui/material';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    applyNodeChanges,
    Node,
    Edge,
    NodeChange,
    getNodesBounds,
    getViewportForBounds,
} from 'reactflow';
import dagre from 'dagre';
import { toPng } from 'html-to-image';
import 'reactflow/dist/style.css';

import TableNode from './TableNode';
import CrowsFootEdge from './CrowsFootEdge';
import { SchemaService } from '../../../api/services/SchemaService';

// Icons
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ImageIcon from '@mui/icons-material/Image';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DrawIcon from '@mui/icons-material/Draw';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import TextFieldsIcon from '@mui/icons-material/TextFields';

// Drawing colors
const DRAWING_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#000000', '#FFFFFF'];

// Memoize nodeTypes and edgeTypes outside the component
const nodeTypes = { tableNode: TableNode };
const edgeTypes = { crowsFoot: CrowsFootEdge };

interface RelationshipGraphProps {
    databaseId: number;
}

interface SchemaInfo {
    [tableName: string]: {
        columns: Array<{ name: string; type: string }>;
        primaryKeys: string[];
        foreignKeys: Array<{
            columnName: string;
            foreignTable: string;
            foreignColumn: string;
        }>;
    };
}

const RelationshipGraph: React.FC<RelationshipGraphProps> = ({ databaseId }) => {
    const theme = useTheme();
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [layoutDirection, setLayoutDirection] = useState<'LR' | 'TB'>('LR');
    const [fullscreen, setFullscreen] = useState(false);
    const [pseudoFullscreen, setPseudoFullscreen] = useState(false);

    // Drawing/Whiteboard state
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingColor, setDrawingColor] = useState('#8B5CF6');
    const [brushSize, setBrushSize] = useState(3);
    const [drawingHistory, setDrawingHistory] = useState<ImageData[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isTextMode, setIsTextMode] = useState(false);
    const [textInput, setTextInput] = useState('');

    const buildGraph = useCallback((schema: SchemaInfo) => {
        const tableNames = Object.keys(schema);
        console.log('Building graph for tables:', tableNames);

        // Separate join tables (2+ FKs) from regular tables
        const joinTables = tableNames.filter((t) => (schema[t].foreignKeys || []).length >= 2);
        const regularTables = tableNames.filter((t) => !joinTables.includes(t));

        const posMap: Record<string, { x: number; y: number }> = {};
        const newNodes: Node[] = [];

        // Layout regular tables in a grid first
        regularTables.forEach((tableName, idx) => {
            const x = (idx % 4) * 320;
            const y = Math.floor(idx / 4) * 200;
            posMap[tableName] = { x, y };

            newNodes.push({
                id: tableName,
                type: 'tableNode',
                data: {
                    tableName,
                    columns: schema[tableName].columns || [],
                    primaryKeys: schema[tableName].primaryKeys || [],
                    foreignKeys: schema[tableName].foreignKeys || [],
                    showColumns: true,
                },
                position: { x, y },
            });
        });

        // Place join tables near their referenced tables
        joinTables.forEach((tableName, jIdx) => {
            const fks = schema[tableName].foreignKeys || [];
            const referenced = Array.from(new Set(fks.map((f) => f.foreignTable))).filter((r) => posMap[r]);
            let x: number, y: number;

            if (referenced.length > 0) {
                const avgX = referenced.reduce((acc, r) => acc + posMap[r].x, 0) / referenced.length;
                const avgY = referenced.reduce((acc, r) => acc + posMap[r].y, 0) / referenced.length;
                const offset = ((jIdx % 3) - 1) * 80;
                x = avgX + 160 + offset;
                y = avgY + 60;
            } else {
                const idx = regularTables.length + jIdx;
                x = (idx % 4) * 320;
                y = Math.floor(idx / 4) * 200;
            }

            posMap[tableName] = { x, y };
            newNodes.push({
                id: tableName,
                type: 'tableNode',
                data: {
                    tableName,
                    columns: schema[tableName].columns || [],
                    primaryKeys: schema[tableName].primaryKeys || [],
                    foreignKeys: schema[tableName].foreignKeys || [],
                    showColumns: true,
                },
                position: { x, y },
            });
        });

        // Create edges for foreign key relationships
        const newEdges: Edge[] = [];
        let edgeId = 0;

        Object.entries(schema).forEach(([tableName, tableInfo]) => {
            console.log(`Creating edges for ${tableName}, FKs:`, tableInfo.foreignKeys);
            tableInfo.foreignKeys?.forEach((fk) => {
                console.log(`  Checking FK: ${fk.columnName} -> ${fk.foreignTable}, exists in posMap: ${!!posMap[fk.foreignTable]}`);
                if (fk.foreignTable && posMap[fk.foreignTable]) {
                    newEdges.push({
                        id: `e${edgeId++}`,
                        source: tableName,
                        target: fk.foreignTable,
                        type: 'crowsFoot',
                        data: { label: `${fk.columnName}` },
                        sourceHandle: `${tableName}:${fk.columnName}`,
                        targetHandle: `${fk.foreignTable}:${fk.foreignColumn}`,
                        style: { stroke: '#8B5CF6' },
                    });
                }
            });
        });

        console.log('Created edges:', newEdges.length, newEdges);

        // Apply dagre layout
        const layoutedNodes = applyDagreLayout(newNodes, newEdges, layoutDirection);
        setNodes(layoutedNodes);
        setEdges(newEdges);
    }, [layoutDirection]);

    // Load schema and build graph
    const loadSchema = useCallback(async () => {
        if (!databaseId) return;

        setLoading(true);
        setError(null);

        try {
            // Get full schema with foreign key information
            const response = await SchemaService.getFullSchema(databaseId);
            const tables = response.tables || [];

            console.log('Tables loaded:', tables.length);

            // Also get detailed table info for foreign keys
            const schemaInfo: SchemaInfo = {};

            for (const table of tables) {
                try {
                    const details = await SchemaService.getTableDetails(databaseId, table.name);
                    const tableDetails = details.table;

                    console.log(`Table ${table.name} constraints:`, tableDetails.constraints);

                    const fkConstraints = tableDetails.constraints?.filter(c => c.type === 'FOREIGN KEY') || [];
                    console.log(`Table ${table.name} FK constraints:`, fkConstraints);

                    schemaInfo[table.name] = {
                        columns: tableDetails.columns.map(c => ({ name: c.name, type: c.type })),
                        primaryKeys: tableDetails.columns.filter(c => c.isPrimaryKey).map(c => c.name),
                        foreignKeys: fkConstraints
                            .map(c => {
                                // Use referencedTable and referencedColumns from ConstraintDto
                                const fk = {
                                    columnName: c.columns?.[0] || '',
                                    foreignTable: c.referencedTable || '',
                                    foreignColumn: c.referencedColumns?.[0] || '',
                                };
                                console.log(`  FK: ${fk.columnName} -> ${fk.foreignTable}.${fk.foreignColumn}`);
                                return fk;
                            })
                            .filter(fk => fk.columnName && fk.foreignTable),
                    };
                } catch (err) {
                    console.error(`Error getting details for ${table.name}:`, err);
                    // If we can't get details, use basic info
                    schemaInfo[table.name] = {
                        columns: table.columns,
                        primaryKeys: [],
                        foreignKeys: [],
                    };
                }
            }

            console.log('Schema info built:', schemaInfo);
            buildGraph(schemaInfo);
        } catch (err: any) {
            console.error('Error loading schema:', err);
            setError(err?.message || 'Failed to load schema');
        } finally {
            setLoading(false);
        }
    }, [databaseId, buildGraph]);


    const applyDagreLayout = useCallback((ns: Node[], es: Edge[], direction: 'LR' | 'TB' = 'LR'): Node[] => {
        try {
            const g = new dagre.graphlib.Graph();
            g.setDefaultEdgeLabel(() => ({}));
            g.setGraph({ rankdir: direction, nodesep: 80, ranksep: 120 });

            const nodeWidth = 260;
            const nodeHeight = 120;

            ns.forEach((n) => {
                g.setNode(n.id, { width: nodeWidth, height: nodeHeight });
            });

            es.forEach((e) => {
                if (e.source && e.target && e.source !== e.target) {
                    g.setEdge(e.source, e.target);
                }
            });

            dagre.layout(g);

            return ns.map((n) => {
                const p = g.node(n.id);
                if (!p) return n;
                return {
                    ...n,
                    position: { x: p.x - nodeWidth / 2, y: p.y - nodeHeight / 2 },
                };
            });
        } catch (err) {
            console.error('Dagre layout failed', err);
            return ns;
        }
    }, []);

    useEffect(() => {
        loadSchema();
    }, [loadSchema]);

    const onNodesChange = useCallback((changes: NodeChange[]) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, []);

    const handleLayoutChange = (_: React.MouseEvent<HTMLElement>, newDirection: 'LR' | 'TB' | null) => {
        if (newDirection) {
            setLayoutDirection(newDirection);
            if (nodes.length > 0) {
                const layoutedNodes = applyDagreLayout(nodes, edges, newDirection);
                setNodes(layoutedNodes);
            }
        }
    };

    const handleExportImage = async () => {
        if (!containerRef.current || nodes.length === 0) return;

        try {
            // Get the viewport element that contains all nodes
            const viewportEl = containerRef.current.querySelector('.react-flow__viewport') as HTMLElement;
            if (!viewportEl) return;

            // Calculate bounds of all nodes with padding
            const nodesBounds = getNodesBounds(nodes);
            const padding = 50;
            const imageWidth = nodesBounds.width + padding * 2;
            const imageHeight = nodesBounds.height + padding * 2;

            // Get viewport transform to fit all nodes
            const viewport = getViewportForBounds(
                nodesBounds,
                imageWidth,
                imageHeight,
                0.5,
                2,
                padding
            );

            const dataUrl = await toPng(viewportEl, {
                backgroundColor: theme.palette.background.default,
                width: imageWidth,
                height: imageHeight,
                style: {
                    width: `${imageWidth}px`,
                    height: `${imageHeight}px`,
                    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                },
            });

            const link = document.createElement('a');
            link.download = 'er-diagram.png';
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Export failed:', err);
        }
    };

    const handleFullscreen = async () => {
        if (!containerRef.current) return;

        if (document.fullscreenEnabled && containerRef.current.requestFullscreen) {
            if (!document.fullscreenElement) {
                await containerRef.current.requestFullscreen();
                setFullscreen(true);
            } else {
                await document.exitFullscreen();
                setFullscreen(false);
            }
        } else {
            setPseudoFullscreen(!pseudoFullscreen);
        }
    };

    useEffect(() => {
        const onFsChange = () => setFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && pseudoFullscreen) {
                setPseudoFullscreen(false);
            }
            if (e.key === 'Escape' && isDrawingMode) {
                setIsDrawingMode(false);
                setIsTextMode(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [pseudoFullscreen, isDrawingMode]);

    // Initialize canvas when entering drawing mode
    useEffect(() => {
        if (isDrawingMode && canvasRef.current && containerRef.current) {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;

            // Restore drawing if there's history
            if (historyIndex >= 0 && drawingHistory[historyIndex]) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.putImageData(drawingHistory[historyIndex], 0, 0);
                }
            }
        }
    }, [isDrawingMode, historyIndex, drawingHistory]);

    // Save to history helper
    const saveToHistory = useCallback(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        const newHistory = drawingHistory.slice(0, historyIndex + 1);
        newHistory.push(imageData);
        setDrawingHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [drawingHistory, historyIndex]);

    // Drawing handlers
    const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current || isTextMode) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = drawingColor;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, [drawingColor, brushSize, isTextMode]);

    const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !canvasRef.current || isTextMode) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.lineTo(x, y);
        ctx.stroke();
    }, [isDrawing, isTextMode]);

    const stopDrawing = useCallback(() => {
        if (isDrawing) {
            setIsDrawing(false);
            saveToHistory();
        }
    }, [isDrawing, saveToHistory]);

    // Handle canvas click for text mode
    const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isTextMode || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (textInput) {
            // Draw the text
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.font = `${brushSize * 6}px Inter, sans-serif`;
                ctx.fillStyle = drawingColor;
                ctx.fillText(textInput, x, y);
                saveToHistory();
            }
            setTextInput('');
        }
    }, [isTextMode, textInput, drawingColor, brushSize, saveToHistory]);

    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx && drawingHistory[historyIndex - 1]) {
                ctx.putImageData(drawingHistory[historyIndex - 1], 0, 0);
            }
        } else if (historyIndex === 0) {
            // Clear canvas
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx && canvasRef.current) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
            setHistoryIndex(-1);
        }
    }, [historyIndex, drawingHistory]);

    const handleRedo = useCallback(() => {
        if (historyIndex < drawingHistory.length - 1) {
            setHistoryIndex(historyIndex + 1);
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx && drawingHistory[historyIndex + 1]) {
                ctx.putImageData(drawingHistory[historyIndex + 1], 0, 0);
            }
        }
    }, [historyIndex, drawingHistory]);

    const handleClearCanvas = useCallback(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            saveToHistory();
        }
    }, [saveToHistory]);

    if (loading) {
        return (
            <Box sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Toolbar Skeleton */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        px: 2,
                        py: 1,
                        bgcolor: 'background.paper',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Skeleton variant="rounded" width={100} height={32} />
                        <Skeleton variant="rounded" width={40} height={32} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton variant="circular" width={32} height={32} />
                    </Box>
                </Box>

                {/* Graph Area Skeleton */}
                <Box sx={{
                    flex: 1,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}>
                    {/* Simulated table nodes skeleton */}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: 3,
                        maxWidth: '100%',
                    }}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Box
                                key={i}
                                sx={{
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Table header skeleton */}
                                <Box sx={{
                                    px: 2,
                                    py: 1.5,
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                }}>
                                    <Skeleton variant="text" width="60%" height={20} />
                                </Box>
                                {/* Table columns skeleton */}
                                <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {[1, 2, 3, 4].map((j) => (
                                        <Box key={j} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Skeleton variant="circular" width={16} height={16} />
                                            <Skeleton variant="text" width="40%" height={16} />
                                            <Skeleton variant="text" width="30%" height={16} sx={{ ml: 'auto' }} />
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

               
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2,
            }}>
                <Typography color="error">{error}</Typography>
                <IconButton onClick={loadSchema}>
                    <RefreshIcon />
                </IconButton>
            </Box>
        );
    }

    if (nodes.length === 0) {
        return (
            <Box sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2,
            }}>
                <AccountTreeIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                <Typography color="text.secondary">No tables found in this database</Typography>
            </Box>
        );
    }

    return (
        <Box
            ref={containerRef}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                ...(pseudoFullscreen && {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9999,
                    bgcolor: 'background.default',
                }),
            }}
        >
            {/* Header Toolbar */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    px: 2,
                    py: 1,
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    flexShrink: 0,
                }}
            >
                {/* Left Section - Layout & Drawing Toggle */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ToggleButtonGroup
                        size="small"
                        value={layoutDirection}
                        exclusive
                        onChange={handleLayoutChange}
                    >
                        <ToggleButton value="LR" sx={{ px: 1.5 }}>
                            <Tooltip title="Horizontal Layout">
                                <span>LR</span>
                            </Tooltip>
                        </ToggleButton>
                        <ToggleButton value="TB" sx={{ px: 1.5 }}>
                            <Tooltip title="Vertical Layout">
                                <span>TB</span>
                            </Tooltip>
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <Divider orientation="vertical" flexItem />

                    <Tooltip title={isDrawingMode ? 'Exit Drawing Mode' : 'Enable Drawing Mode'}>
                        <IconButton
                            size="small"
                            onClick={() => { setIsDrawingMode(!isDrawingMode); setIsTextMode(false); }}
                            sx={{
                                bgcolor: isDrawingMode ? 'primary.main' : 'transparent',
                                color: isDrawingMode ? 'primary.contrastText' : 'text.secondary',
                                '&:hover': {
                                    bgcolor: isDrawingMode ? 'primary.dark' : alpha(theme.palette.action.hover, 0.1),
                                },
                            }}
                        >
                            <DrawIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    {/* Drawing Tools - Show when drawing mode is active */}
                    {isDrawingMode && (
                        <>
                            <Divider orientation="vertical" flexItem />

                            {/* Pen / Text Toggle */}
                            <ToggleButtonGroup
                                size="small"
                                value={isTextMode ? 'text' : 'pen'}
                                exclusive
                                onChange={(_, v) => v && setIsTextMode(v === 'text')}
                            >
                                <ToggleButton value="pen" sx={{ px: 1 }}>
                                    <Tooltip title="Pen Tool">
                                        <DrawIcon fontSize="small" />
                                    </Tooltip>
                                </ToggleButton>
                                <ToggleButton value="text" sx={{ px: 1 }}>
                                    <Tooltip title="Text Tool">
                                        <TextFieldsIcon fontSize="small" />
                                    </Tooltip>
                                </ToggleButton>
                            </ToggleButtonGroup>

                            <Divider orientation="vertical" flexItem />

                            {/* Color Palette */}
                            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                {DRAWING_COLORS.map((color) => (
                                    <Tooltip key={color} title={color === '#FFFFFF' ? 'White' : color === '#000000' ? 'Black' : ''}>
                                        <Box
                                            onClick={() => setDrawingColor(color)}
                                            sx={{
                                                width: 20,
                                                height: 20,
                                                borderRadius: '50%',
                                                bgcolor: color,
                                                cursor: 'pointer',
                                                border: '2px solid',
                                                borderColor: drawingColor === color
                                                    ? 'primary.main'
                                                    : theme.palette.mode === 'light'
                                                        ? alpha('#000', 0.2)
                                                        : (color === '#FFFFFF' ? '#ddd' : alpha('#fff', 0.2)),
                                                boxShadow: drawingColor === color ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
                                                transition: 'all 0.15s ease',
                                                '&:hover': { transform: 'scale(1.2)' },
                                            }}
                                        />
                                    </Tooltip>
                                ))}
                            </Box>

                            <Divider orientation="vertical" flexItem />

                            {/* Brush Size */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        width: Math.max(6, brushSize),
                                        height: Math.max(6, brushSize),
                                        borderRadius: '50%',
                                        bgcolor: drawingColor,
                                        border: theme.palette.mode === 'light'
                                            ? `1px solid ${alpha('#000', 0.2)}`
                                            : (drawingColor === '#FFFFFF' ? '1px solid #ddd' : 'none'),
                                        maxWidth: 20,
                                        maxHeight: 20,
                                    }}
                                />
                                <Slider
                                    size="small"
                                    value={brushSize}
                                    onChange={(_, v) => setBrushSize(v as number)}
                                    min={1}
                                    max={20}
                                    sx={{ width: 60 }}
                                />
                            </Box>

                            <Divider orientation="vertical" flexItem />

                            {/* Undo / Redo / Clear */}
                            <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center' }}>
                                <Tooltip title="Undo">
                                    <span>
                                        <IconButton size="small" onClick={handleUndo} disabled={historyIndex < 0}>
                                            <UndoIcon fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title="Redo">
                                    <span>
                                        <IconButton size="small" onClick={handleRedo} disabled={historyIndex >= drawingHistory.length - 1}>
                                            <RedoIcon fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title="Clear Canvas">
                                    <IconButton size="small" onClick={handleClearCanvas} sx={{ color: 'error.main' }}>
                                        <DeleteSweepIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {/* Text Input */}
                            {isTextMode && (
                                <>
                                    <Divider orientation="vertical" flexItem />
                                    <input
                                        type="text"
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        placeholder="Type text, click to place..."
                                        style={{
                                            width: 160,
                                            padding: '6px 10px',
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: 6,
                                            fontSize: 13,
                                            outline: 'none',
                                            background: theme.palette.background.default,
                                            color: theme.palette.text.primary,
                                        }}
                                    />
                                </>
                            )}
                        </>
                    )}
                </Box>

                {/* Right Section - Actions & Stats */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {/* Stats */}
                    <Box sx={{ display: 'flex', gap: 2, mr: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            Tables: <strong>{nodes.length}</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Relations: <strong>{edges.length}</strong>
                        </Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem />

                    <Tooltip title="Refresh Schema">
                        <IconButton size="small" onClick={loadSchema}>
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Export as PNG">
                        <IconButton size="small" onClick={handleExportImage}>
                            <ImageIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={fullscreen || pseudoFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                        <IconButton size="small" onClick={handleFullscreen}>
                            {fullscreen || pseudoFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Body - Diagram Area */}
            <Box
                sx={{
                    flex: 1,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Drawing Canvas Overlay */}
                {isDrawingMode && (
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onClick={handleCanvasClick}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 5,
                            cursor: isTextMode ? 'text' : 'crosshair',
                            pointerEvents: 'auto',
                        }}
                    />
                )}

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    minZoom={0.1}
                    maxZoom={2}
                    defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                    style={{ pointerEvents: isDrawingMode ? 'none' : 'auto' }}
                >
                    <Background color={theme.palette.divider} gap={20} />
                    <Controls />
                    <MiniMap
                        nodeColor={() => '#8B5CF6'}
                        maskColor={alpha(theme.palette.background.default, 0.8)}
                    />
                </ReactFlow>
            </Box>
        </Box>
    );
};

export default RelationshipGraph;
