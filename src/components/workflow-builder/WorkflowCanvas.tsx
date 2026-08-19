import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap,
  useNodesState, useEdgesState, useReactFlow, addEdge,
  ConnectionMode,
  type Edge, type Node, type Connection, type FinalConnectionState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { StepNode } from "./StepNode";
import { DeletableEdge } from "./DeletableEdge";
import { NodeInspector } from "./NodeInspector";
import { StepPalette } from "./StepPalette";
import { TEMPLATE_LIST } from "./templates";
import type { StepNodeData, StepType, WorkflowGraph, WorkflowNode } from "./types";
import { STEP_META, EMPTY_WORKFLOW } from "./types";

const edgeTypes = { deletable: DeletableEdge };
import { Button } from "@/components/ui/button";
import { Trash2, LayoutTemplate } from "lucide-react";

type Props = {
  value: WorkflowGraph;
  onChange: (g: WorkflowGraph) => void;
  readOnly?: boolean;
};

const nodeTypes = {
  start: StepNode, call: StepNode, sms: StepNode, email: StepNode,
  wait: StepNode, voicemail: StepNode, notify: StepNode, book: StepNode, stop: StepNode,
};

const workflowEdgeStyle = { stroke: "var(--primary)", strokeWidth: 2 };

function getClientPoint(event: MouseEvent | TouchEvent) {
  if ("changedTouches" in event && event.changedTouches.length > 0) {
    return { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
  }
  if ("touches" in event && event.touches.length > 0) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }
  const mouseEvent = event as MouseEvent;
  return { x: mouseEvent.clientX, y: mouseEvent.clientY };
}

export function WorkflowCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <Inner {...props} />
    </ReactFlowProvider>
  );
}

function graphToRF(graph: WorkflowGraph, onDelete: (id: string) => void): { nodes: Node[]; edges: Edge[] } {
  return {
    nodes: graph.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: { ...n.data, __onDelete: () => onDelete(n.id) },
    })),
    edges: graph.edges.map((e) => ({
      id: e.id, source: e.source, target: e.target,
      sourceHandle: e.sourceHandle ?? undefined,
      targetHandle: e.targetHandle ?? undefined,
      label: e.label, animated: true, type: "deletable",
      style: workflowEdgeStyle,
    })),
  };
}

function Inner({ value, onChange, readOnly }: Props) {
  const wrapper = useRef<HTMLDivElement>(null);
  const rf = useReactFlow();
  const [selected, setSelected] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(value.nodes.length <= 1 && !readOnly);

  // Delete handler ref so node data callbacks always see latest state
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const deleteNode = useCallback((id: string) => {
    if (id === "start") return;
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelected((s) => (s === id ? null : s));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initial = useMemo(() => graphToRF(value, deleteNode), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  // Sync RF state outward as a plain graph (debounced via microtask coalesce)
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      onChangeRef.current({
        nodes: nodes.map((n) => ({
          id: n.id,
          type: (n.type as StepType) ?? "call",
          position: n.position,
          data: Object.fromEntries(
            Object.entries((n.data ?? {}) as Record<string, unknown>).filter(([k]) => !k.startsWith("__"))
          ) as StepNodeData,
        })),
        edges: edges.map((e) => ({
          id: e.id, source: e.source, target: e.target,
          sourceHandle: (e.sourceHandle as string | undefined) ?? undefined,
          targetHandle: (e.targetHandle as string | undefined) ?? undefined,
          label: typeof e.label === "string" ? e.label : undefined,
        })),
      });
    }, 50);
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current); };
  }, [nodes, edges]);

  // Replace internal state when caller supplies a wholly new graph (e.g. loaded from server).
  // We detect this by comparing node id sets.
  const lastSeenIdsRef = useRef<string>("");
  useEffect(() => {
    const ids = value.nodes.map((n) => n.id).sort().join("|");
    const current = nodes.map((n) => n.id).sort().join("|");
    if (ids !== current && ids !== lastSeenIdsRef.current) {
      const fresh = graphToRF(value, deleteNode);
      setNodes(fresh.nodes);
      setEdges(fresh.edges);
      lastSeenIdsRef.current = ids;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const connectToInput = useCallback((source: string, target: string, sourceHandle = "out", targetHandle = "input") => {
    if (!source || !target || source === target) return;
    setEdges((eds) => {
      // Replace any existing edge from the same source handle (one outgoing per branch)
      const filtered = eds.filter(
        (e) => !(e.source === source && (e.sourceHandle ?? "out") === sourceHandle),
      );
      return addEdge(
        {
          source,
          target,
          sourceHandle,
          targetHandle,
          id: `e-${source}-${sourceHandle}-${target}-${targetHandle}`,
          animated: true,
          type: "deletable",
          style: workflowEdgeStyle,
        },
        filtered,
      );
    });
  }, [setEdges]);

  const getNodeIdAtClientPoint = useCallback((clientX: number, clientY: number) => {
    const elementNodeId = document
      .elementFromPoint(clientX, clientY)
      ?.closest<HTMLElement>(".react-flow__node")
      ?.getAttribute("data-id");
    if (elementNodeId) return elementNodeId;

    const point = rf.screenToFlowPosition({ x: clientX, y: clientY });
    return nodes.find((node) => {
      const measured = (node as Node & { measured?: { width?: number; height?: number } }).measured;
      const width = node.width ?? measured?.width ?? 0;
      const height = node.height ?? measured?.height ?? 0;
      return width > 0 && height > 0 &&
        point.x >= node.position.x && point.x <= node.position.x + width &&
        point.y >= node.position.y && point.y <= node.position.y + height;
    })?.id ?? null;
  }, [nodes, rf]);

  const onConnect = useCallback((conn: Connection) => {
    if (!conn.source || !conn.target || conn.source === conn.target) return;
    const sourceHandle = conn.sourceHandle || "out";
    // If they dropped on the node body, force it to snap to the top input dot.
    const targetHandle = conn.targetHandle || "input";
    connectToInput(conn.source, conn.target, sourceHandle, targetHandle);
  }, [connectToInput]);

  const onConnectEnd = useCallback((event: MouseEvent | TouchEvent, state: FinalConnectionState) => {
    const hitValidInput = state.toHandle?.type === "target" && state.toHandle.id === "input";
    if (hitValidInput || !state.fromHandle || state.fromHandle.type !== "source") return;

    const { x, y } = getClientPoint(event);
    const source = state.fromNode?.id ?? state.fromHandle.nodeId;
    const sourceHandle = state.fromHandle.id || "out";
    const target = state.toHandle?.nodeId ?? getNodeIdAtClientPoint(x, y);
    const targetNode = nodes.find((node) => node.id === target);

    if (!target || target === source || targetNode?.type === "start") return;
    connectToInput(source, target, sourceHandle, "input");
  }, [connectToInput, getNodeIdAtClientPoint, nodes]);

  const isValidConnection = useCallback((conn: Connection | Edge) => {
    if (!conn.source || !conn.target || conn.source === conn.target) return false;
    // Allow if they hit the dot exactly, OR if they drop on the node body.
    return !conn.targetHandle || conn.targetHandle === "input";
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = (event.dataTransfer.getData("application/x-step-type") ||
                  event.dataTransfer.getData("text/plain")) as StepType;
    if (!type || !STEP_META[type] || type === "start") return;
    const position = rf.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const id = `${type}-${Date.now().toString(36)}`;
    const newNode: Node = {
      id, type, position,
      data: { label: STEP_META[type].label, dayOffset: 1, __onDelete: () => deleteNode(id) },
    };
    setNodes((nds) => nds.concat(newNode));
    setSelected(id);
  }, [rf, setNodes, deleteNode]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const updateNodeData = useCallback((id: string, patch: Partial<StepNodeData>) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));
  }, [setNodes]);

  const loadTemplate = (graph: WorkflowGraph) => {
    const fresh = graphToRF(graph, deleteNode);
    setNodes(fresh.nodes);
    setEdges(fresh.edges);
    lastSeenIdsRef.current = graph.nodes.map((n) => n.id).sort().join("|");
    setShowTemplates(false);
    setSelected(null);
    setTimeout(() => rf.fitView({ padding: 0.2, duration: 300 }), 50);
  };

  const clearAll = () => {
    const fresh = graphToRF(EMPTY_WORKFLOW, deleteNode);
    setNodes(fresh.nodes);
    setEdges(fresh.edges);
    lastSeenIdsRef.current = "start";
    setSelected(null);
  };

  const selectedNode = useMemo<WorkflowNode | null>(() => {
    const n = nodes.find((x) => x.id === selected);
    if (!n) return null;
    return {
      id: n.id,
      type: (n.type as StepType) ?? "call",
      position: n.position,
      data: Object.fromEntries(
        Object.entries((n.data ?? {}) as Record<string, unknown>).filter(([k]) => !k.startsWith("__"))
      ) as StepNodeData,
    };
  }, [nodes, selected]);

  if (readOnly) {
    return (
      <div className="h-[500px] rounded-xl border border-border bg-secondary/20 overflow-hidden">
        <ReactFlow
          nodes={nodes} edges={edges} nodeTypes={nodeTypes as any}
          fitView nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}
          panOnDrag zoomOnScroll={false}
        >
          <Background gap={20} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
      {showTemplates && (
        <div className="p-5 border-b border-border bg-secondary/30">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold tracking-tight">Start with a template</h3>
              <p className="text-xs text-muted-foreground">Pick a proven sequence and tweak it, or build from scratch.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowTemplates(false)}>
              Skip — build from scratch
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TEMPLATE_LIST.map((t) => (
              <button
                key={t.id}
                onClick={() => loadTemplate(t.graph)}
                className="text-left rounded-xl border border-border bg-card p-4 hover:border-primary hover:shadow-elevated transition"
              >
                <div className="flex items-center gap-2 mb-2">
                  <LayoutTemplate className="size-4 text-primary" />
                  <h4 className="font-semibold text-sm">{t.name}</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-3">
                  {t.graph.nodes.length - 1} steps
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-[200px_1fr_280px] min-h-[560px]">
        <aside className="border-r border-border bg-secondary/20 p-3 overflow-y-auto">
          <StepPalette />
          <div className="mt-4 pt-4 border-t border-border space-y-2">
            <Button variant="outline" size="sm" className="w-full" onClick={() => setShowTemplates(true)}>
              <LayoutTemplate className="size-4" /> Templates
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={clearAll}>
              <Trash2 className="size-4" /> Clear all
            </Button>
          </div>
        </aside>

        <div ref={wrapper} className="relative bg-background min-h-[560px]" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes as any}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectEnd={onConnectEnd}
            isValidConnection={isValidConnection}
            onNodeClick={(_, n) => setSelected(n.id)}
            onPaneClick={() => setSelected(null)}
            connectionMode={ConnectionMode.Strict}
            connectionRadius={75}
            deleteKeyCode={["Backspace", "Delete"]}
            edgesFocusable
            elementsSelectable
            fitView
            defaultEdgeOptions={{ animated: true, type: "deletable", style: workflowEdgeStyle }}
          >
            <Background gap={20} size={1} />
            <Controls />
            <MiniMap pannable zoomable nodeColor={(n) => STEP_META[(n.type as StepType) ?? "call"]?.color ?? "#94a3b8"} />
          </ReactFlow>
        </div>

        <aside className="border-l border-border bg-secondary/20 p-4 overflow-y-auto">
          <NodeInspector
            node={selectedNode}
            onChange={updateNodeData}
            onDelete={deleteNode}
            onClose={() => setSelected(null)}
          />
        </aside>
      </div>
    </div>
  );
}
