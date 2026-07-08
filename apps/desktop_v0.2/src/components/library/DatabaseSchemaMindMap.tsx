import React, { useState, useRef, useEffect } from "react";
import { Database, Key, Link, Play, Pause, Zap, ZoomIn, ZoomOut, Maximize2, Move } from "lucide-react";

interface TableField {
  name: string;
  type: string;
  isPrimary: boolean;
  isForeign: boolean;
  references?: string;
}

interface SchemaTable {
  name: string;
  rowCount: number;
  diskSize: string;
  description: string;
  dbType: "SQL" | "NoSQL - KeyValue" | "NoSQL - Document";
  fields: TableField[];
}

interface DBFlow {
  id: string;
  name: string;
  source: string;
  target: string;
  sourceField: string;
  targetField: string;
  type: "session" | "stream" | "logs" | "audit";
  activeRate: string;
  color: string;
  dotColor: string;
  strokeColor: string;
  description: string;
}

interface ClickPacket {
  id: number;
  flowId: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface NodePosition {
  x: number;
  y: number;
}

export const DatabaseSchemaMindMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Switchable Schema State: "sql" vs "nosql"
  const [schemaType, setSchemaType] = useState<"sql" | "nosql">("sql");

  // Infinite Canvas Pan & Zoom States
  const [scale, setScale] = useState<number>(0.85);
  const [pan, setPan] = useState<NodePosition>({ x: 40, y: 30 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<NodePosition>({ x: 0, y: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      if (width < 600) {
        setScale(width / 750);
        setPan({ x: 10, y: 20 });
      }
    }
  }, []);

  // 1. SQL Schema Table positions
  const [sqlPositions, setSqlPositions] = useState<Record<string, NodePosition>>({
    departments: { x: 40, y: 40 },
    instructors: { x: 40, y: 250 },
    students: { x: 290, y: 40 },
    courses: { x: 290, y: 250 },
    enrollments: { x: 540, y: 40 },
    exams: { x: 540, y: 250 },
    attendance: { x: 290, y: 450 }
  });

  // 2. NoSQL Schema Collection positions
  const [nosqlPositions, setNosqlPositions] = useState<Record<string, NodePosition>>({
    redis_sessions: { x: 50, y: 50 },
    student_resumes: { x: 300, y: 50 },
    course_materials: { x: 550, y: 50 },
    audit_logs: { x: 170, y: 260 },
    rate_limiter: { x: 430, y: 260 }
  });

  const [activeDragNode, setActiveDragNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<NodePosition>({ x: 0, y: 0 });

  const [selectedTable, setSelectedTable] = useState<string>("students");
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [hoveredField, setHoveredField] = useState<{ tableName: string; fieldName: string } | null>(null);
  
  // Flows currently selected in UI
  const [selectedFlowIds, setSelectedFlowIds] = useState<string[]>([
    "flow-student-enroll",
    "flow-course-enroll",
    "flow-instructor-dept",
    "flow-course-dept",
    "flow-student-att",
    "flow-exam-course",
    "flow-redis-auth",
    "flow-mongo-resume"
  ]);

  const [trafficLoad, setTrafficLoad] = useState<number>(4); 
  const [viewMode, setViewMode] = useState<"visual" | "ddl" | "relations">("visual");
  const [isFlowAnimating, setIsFlowAnimating] = useState(true);
  const [isBursting, setIsBursting] = useState(false);
  
  const [clickPackets, setClickPackets] = useState<ClickPacket[]>([]);

  const CARD_WIDTH = 144;
  const HEADER_HEIGHT = 32;
  const ROW_HEIGHT = 20;

  // SQL tables definition
  const sqlTables: SchemaTable[] = [
    {
      name: "departments",
      rowCount: 8,
      diskSize: "16 KB",
      dbType: "SQL",
      description: "University administration departments (e.g. Computer Science, Mathematics).",
      fields: [
        { name: "id", type: "UUID", isPrimary: true, isForeign: false },
        { name: "name", type: "String", isPrimary: false, isForeign: false },
        { name: "code", type: "String (Unique)", isPrimary: false, isForeign: false }
      ]
    },
    {
      name: "instructors",
      rowCount: 45,
      diskSize: "48 KB",
      dbType: "SQL",
      description: "University faculties, instructors, and tenure statuses mapped to departments.",
      fields: [
        { name: "id", type: "UUID", isPrimary: true, isForeign: false },
        { name: "first_name", type: "String", isPrimary: false, isForeign: false },
        { name: "last_name", type: "String", isPrimary: false, isForeign: false },
        { name: "department_id", type: "UUID", isPrimary: false, isForeign: true, references: "departments.id" }
      ]
    },
    {
      name: "students",
      rowCount: 1450,
      diskSize: "210 KB",
      dbType: "SQL",
      description: "Main student profile registration containing enrollment dates and emails.",
      fields: [
        { name: "id", type: "UUID", isPrimary: true, isForeign: false },
        { name: "email", type: "String", isPrimary: false, isForeign: false },
        { name: "first_name", type: "String", isPrimary: false, isForeign: false },
        { name: "last_name", type: "String", isPrimary: false, isForeign: false }
      ]
    },
    {
      name: "courses",
      rowCount: 120,
      diskSize: "64 KB",
      dbType: "SQL",
      description: "University syllabus courses containing credit weightings and departments.",
      fields: [
        { name: "id", type: "UUID", isPrimary: true, isForeign: false },
        { name: "title", type: "String", isPrimary: false, isForeign: false },
        { name: "credits", type: "Integer", isPrimary: false, isForeign: false },
        { name: "department_id", type: "UUID", isPrimary: false, isForeign: true, references: "departments.id" }
      ]
    },
    {
      name: "enrollments",
      rowCount: 12500,
      diskSize: "820 KB",
      dbType: "SQL",
      description: "Links students with courses in a many-to-many relationship along with grades.",
      fields: [
        { name: "id", type: "UUID", isPrimary: true, isForeign: false },
        { name: "student_id", type: "UUID", isPrimary: false, isForeign: true, references: "students.id" },
        { name: "course_id", type: "UUID", isPrimary: false, isForeign: true, references: "courses.id" },
        { name: "grade", type: "Decimal", isPrimary: false, isForeign: false }
      ]
    },
    {
      name: "exams",
      rowCount: 480,
      diskSize: "110 KB",
      dbType: "SQL",
      description: "Test schedules, exam dates, and maximum scores for courses.",
      fields: [
        { name: "id", type: "UUID", isPrimary: true, isForeign: false },
        { name: "course_id", type: "UUID", isPrimary: false, isForeign: true, references: "courses.id" },
        { name: "max_score", type: "Integer", isPrimary: false, isForeign: false },
        { name: "exam_date", type: "Timestamp", isPrimary: false, isForeign: false }
      ]
    },
    {
      name: "attendance",
      rowCount: 45000,
      diskSize: "3.4 MB",
      dbType: "SQL",
      description: "Tracks student daily class check-in status (Present/Absent/Late).",
      fields: [
        { name: "id", type: "UUID", isPrimary: true, isForeign: false },
        { name: "student_id", type: "UUID", isPrimary: false, isForeign: true, references: "students.id" },
        { name: "course_id", type: "UUID", isPrimary: false, isForeign: true, references: "courses.id" },
        { name: "status", type: "String", isPrimary: false, isForeign: false }
      ]
    }
  ];

  // NoSQL collections definition
  const nosqlTables: SchemaTable[] = [
    {
      name: "redis_sessions",
      rowCount: 120,
      diskSize: "4 KB",
      dbType: "NoSQL - KeyValue",
      description: "Fast in-memory Redis session storage caching active auth portal login tokens.",
      fields: [
        { name: "token_key", type: "String", isPrimary: true, isForeign: false },
        { name: "student_id", type: "UUID", isPrimary: false, isForeign: false },
        { name: "ttl_secs", type: "Integer", isPrimary: false, isForeign: false }
      ]
    },
    {
      name: "student_resumes",
      rowCount: 850,
      diskSize: "1.8 MB",
      dbType: "NoSQL - Document",
      description: "MongoDB unstructured document store containing student curriculum vitae resumes.",
      fields: [
        { name: "_id", type: "ObjectId", isPrimary: true, isForeign: false },
        { name: "student_id", type: "UUID", isPrimary: false, isForeign: false },
        { name: "resume_json", type: "JSON", isPrimary: false, isForeign: false }
      ]
    },
    {
      name: "course_materials",
      rowCount: 320,
      diskSize: "8.4 MB",
      dbType: "NoSQL - Document",
      description: "MongoDB collection containing lecture PDF links, JSON slides, and syllabus files.",
      fields: [
        { name: "_id", type: "ObjectId", isPrimary: true, isForeign: false },
        { name: "course_id", type: "UUID", isPrimary: false, isForeign: false },
        { name: "syllabus_doc", type: "JSON", isPrimary: false, isForeign: false }
      ]
    },
    {
      name: "audit_logs",
      rowCount: 84000,
      diskSize: "12.4 MB",
      dbType: "NoSQL - Document",
      description: "MongoDB collections writing raw security audit events, IP addresses, and user-agent logs.",
      fields: [
        { name: "id", type: "ObjectId", isPrimary: true, isForeign: false },
        { name: "actor_id", type: "UUID", isPrimary: false, isForeign: true, references: "redis_sessions.student_id" },
        { name: "action", type: "String", isPrimary: false, isForeign: false }
      ]
    },
    {
      name: "rate_limiter",
      rowCount: 200,
      diskSize: "8 KB",
      dbType: "NoSQL - KeyValue",
      description: "Redis counter caching client IP API access limits to prevent spam.",
      fields: [
        { name: "ip_key", type: "String", isPrimary: true, isForeign: false },
        { name: "request_count", type: "Integer", isPrimary: false, isForeign: false },
        { name: "limiter_ref", type: "String", isPrimary: false, isForeign: true, references: "redis_sessions.token_key" }
      ]
    }
  ];

  // SQL Flows
  const sqlFlows: DBFlow[] = [
    {
      id: "flow-student-enroll",
      name: "Student Enroll Link",
      source: "students",
      target: "enrollments",
      sourceField: "id",
      targetField: "student_id",
      type: "session",
      activeRate: "5.4/sec",
      color: "stroke-sky-500",
      dotColor: "bg-sky-400 shadow-[0_0_8px_#38bdf8]",
      strokeColor: "#38bdf8",
      description: "Assigns registered student IDs into the course enrollment catalog."
    },
    {
      id: "flow-course-enroll",
      name: "Course Enroll Link",
      source: "courses",
      target: "enrollments",
      sourceField: "id",
      targetField: "course_id",
      type: "stream",
      activeRate: "12.8/sec",
      color: "stroke-purple-500",
      dotColor: "bg-purple-400 shadow-[0_0_8px_#a855f7]",
      strokeColor: "#a855f7",
      description: "Connects curriculum courses directly with enrollment registration records."
    },
    {
      id: "flow-instructor-dept",
      name: "Faculty Dept Assignment",
      source: "departments",
      target: "instructors",
      sourceField: "id",
      targetField: "department_id",
      type: "audit",
      activeRate: "1.2/sec",
      color: "stroke-emerald-500",
      dotColor: "bg-emerald-400 shadow-[0_0_8px_#34d399]",
      strokeColor: "#34d399",
      description: "Maps instructors to their primary employing academic department."
    },
    {
      id: "flow-course-dept",
      name: "Curriculum Dept Link",
      source: "departments",
      target: "courses",
      sourceField: "id",
      targetField: "department_id",
      type: "logs",
      activeRate: "2.5/sec",
      color: "stroke-amber-500",
      dotColor: "bg-amber-405 shadow-[0_0_8px_#f59e0b]",
      strokeColor: "#f59e0b",
      description: "Validates department budgets for course syllabus plans."
    },
    {
      id: "flow-student-att",
      name: "Attendance Auditing",
      source: "students",
      target: "attendance",
      sourceField: "id",
      targetField: "student_id",
      type: "session",
      activeRate: "35.2/sec",
      color: "stroke-sky-500",
      dotColor: "bg-sky-400 shadow-[0_0_8px_#38bdf8]",
      strokeColor: "#38bdf8",
      description: "Tracks student check-ins during daily campus audits."
    },
    {
      id: "flow-exam-course",
      name: "Exam Grade Evaluation",
      source: "courses",
      target: "exams",
      sourceField: "id",
      targetField: "course_id",
      type: "stream",
      activeRate: "8.1/sec",
      color: "stroke-purple-500",
      dotColor: "bg-purple-400 shadow-[0_0_8px_#a855f7]",
      strokeColor: "#a855f7",
      description: "Extracts tests schedules and ties them to course syllabus keys."
    }
  ];

  // NoSQL Flows
  const nosqlFlows: DBFlow[] = [
    {
      id: "flow-redis-auth",
      name: "Rate Limit Token Check",
      source: "redis_sessions",
      target: "rate_limiter",
      sourceField: "token_key",
      targetField: "limiter_ref",
      type: "session",
      activeRate: "42.1/sec",
      color: "stroke-sky-500",
      dotColor: "bg-sky-400 shadow-[0_0_8px_#38bdf8]",
      strokeColor: "#38bdf8",
      description: "Cross-checks active auth token keys with Redis rate limiter counters."
    },
    {
      id: "flow-mongo-resume",
      name: "Resume Audit Log",
      source: "redis_sessions",
      target: "audit_logs",
      sourceField: "student_id",
      targetField: "actor_id",
      type: "audit",
      activeRate: "2.4/sec",
      color: "stroke-emerald-500",
      dotColor: "bg-emerald-400 shadow-[0_0_8px_#34d399]",
      strokeColor: "#34d399",
      description: "Writes access security logs whenever a student profile resume is queried."
    }
  ];

  // Active configurations based on current schema selector
  const schemaTables = schemaType === "sql" ? sqlTables : nosqlTables;
  const databaseFlows = schemaType === "sql" ? sqlFlows : nosqlFlows;
  const positions = schemaType === "sql" ? sqlPositions : nosqlPositions;

  const activeTable = schemaTables.find(t => t.name === selectedTable) || schemaTables[0];

  // Switch schema trigger
  const handleSchemaSwitch = (type: "sql" | "nosql") => {
    setSchemaType(type);
    setSelectedTable(type === "sql" ? "students" : "redis_sessions");
    setScale(0.85);
    setPan({ x: 40, y: 30 });
  };

  // Zoom Controllers
  const handleZoomIn = () => setScale(s => Math.min(2, s + 0.1));
  const handleZoomOut = () => setScale(s => Math.max(0.4, s - 0.1));
  const handleZoomReset = () => {
    setScale(0.85);
    setPan({ x: 40, y: 30 });
  };

  // Canvas Mouse Actions
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Do NOT trigger panning if clicking buttons, input range sliders, select toggles, or key/link elements
    if (target.closest("button") || target.closest("select") || target.closest("input") || target.closest(".cursor-pointer")) {
      return;
    }
    
    // Otherwise, click anywhere on blank space starts panning!
    setIsPanning(true);
    setPanStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (activeDragNode) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      if (schemaType === "sql") {
        setSqlPositions(prev => ({
          ...prev,
          [activeDragNode]: { x: newX, y: newY }
        }));
      } else {
        setNosqlPositions(prev => ({
          ...prev,
          [activeDragNode]: { x: newX, y: newY }
        }));
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setActiveDragNode(null);
  };

  const handleStartDrag = (e: React.MouseEvent, nodeName: string) => {
    setActiveDragNode(nodeName);
    const pos = positions[nodeName];
    setDragOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    });
    e.stopPropagation();
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsPanning(false);
      setActiveDragNode(null);
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  const getFieldYOffset = (tableName: string, fieldName: string) => {
    const table = schemaTables.find(t => t.name === tableName);
    if (!table) return 0;
    const fieldIndex = table.fields.findIndex(f => f.name === fieldName);
    if (fieldIndex === -1) return 0;
    return HEADER_HEIGHT + (fieldIndex * ROW_HEIGHT) + (ROW_HEIGHT / 2);
  };

  const getFlowCoordinates = (flow: DBFlow) => {
    const s = positions[flow.source];
    const t = positions[flow.target];
    if (!s || !t) return { startX: 0, startY: 0, endX: 0, endY: 0 };

    const startY = s.y + getFieldYOffset(flow.source, flow.sourceField);
    const endY = t.y + getFieldYOffset(flow.target, flow.targetField);

    let startX = 0;
    let endX = 0;

    if (s.x + CARD_WIDTH / 2 < t.x + CARD_WIDTH / 2) {
      startX = s.x + CARD_WIDTH;
      endX = t.x;
    } else {
      startX = s.x;
      endX = t.x + CARD_WIDTH;
    }

    return { startX, startY, endX, endY };
  };

  const getOrthogonalPath = (flow: DBFlow) => {
    const { startX, startY, endX, endY } = getFlowCoordinates(flow);
    if (startX === 0) return "";

    const midX = (startX + endX) / 2;
    return `M ${startX},${startY} L ${midX},${startY} L ${midX},${endY} L ${endX},${endY}`;
  };

  const spawnManualPacket = (flowId: string) => {
    const flow = databaseFlows.find(f => f.id === flowId);
    if (!flow) return;

    const { startX, startY, endX, endY } = getFlowCoordinates(flow);

    const id = Date.now() + Math.random();
    const packet: ClickPacket = {
      id,
      flowId,
      startX,
      startY,
      endX,
      endY
    };

    setClickPackets(prev => [...prev, packet]);
    setTimeout(() => {
      setClickPackets(prev => prev.filter(p => p.id !== id));
    }, 1200);
  };

  const handleNodeClick = (tableName: string) => {
    setSelectedTable(tableName);
    if (schemaType === "sql") {
      if (tableName === "students") {
        spawnManualPacket("flow-student-enroll");
        spawnManualPacket("flow-student-att");
      } else if (tableName === "courses") {
        spawnManualPacket("flow-course-enroll");
        spawnManualPacket("flow-exam-course");
      } else if (tableName === "departments") {
        spawnManualPacket("flow-instructor-dept");
        spawnManualPacket("flow-course-dept");
      }
    } else {
      if (tableName === "redis_sessions") {
        spawnManualPacket("flow-redis-auth");
        spawnManualPacket("flow-mongo-resume");
      }
    }
  };

  const triggerBurst = () => {
    if (isBursting) return;
    setIsBursting(true);
    databaseFlows.forEach((flow, i) => {
      setTimeout(() => {
        spawnManualPacket(flow.id);
      }, i * 120);
    });
    setTimeout(() => {
      setIsBursting(false);
    }, 1200);
  };

  const activeQueries = trafficLoad * 12 + (isBursting ? 70 : 0) + clickPackets.length * 3;
  const totalThroughput = (trafficLoad * 5.2 + (isBursting ? 38.5 : 0) + clickPackets.length * 1.5).toFixed(1);
  const avgLatency = Math.max(5, Math.round(45 / trafficLoad + (isBursting ? 18 : 0)));

  const toggleFlow = (flowId: string) => {
    setSelectedFlowIds(prev => 
      prev.includes(flowId) ? prev.filter(id => id !== flowId) : [...prev, flowId]
    );
  };

  const isRelationConnected = (tableName: string) => {
    if (tableName === activeTable.name) return true;
    const activeRefs = activeTable.fields.some(f => f.isForeign && f.references?.startsWith(tableName));
    if (activeRefs) return true;
    const targetTable = schemaTables.find(t => t.name === tableName);
    const targetRefs = targetTable?.fields.some(f => f.isForeign && f.references?.startsWith(activeTable.name));
    return !!targetRefs;
  };

  const isHoverConnected = (tableName: string) => {
    if (!hoveredTable) return true;
    if (tableName === hoveredTable) return true;
    const isDirectRef = schemaTables.find(t => t.name === hoveredTable)?.fields.some(f => f.isForeign && f.references?.startsWith(tableName));
    if (isDirectRef) return true;
    const isReferencingUs = schemaTables.find(t => t.name === tableName)?.fields.some(f => f.isForeign && f.references?.startsWith(hoveredTable));
    return !!isReferencingUs;
  };

  const getFieldFlowColor = (tableName: string, fieldName: string) => {
    if (hoveredField) {
      if (hoveredField.tableName === tableName && hoveredField.fieldName === fieldName) {
        return "text-purple-400 font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] bg-purple-500/10";
      }
      const hoveredTableData = schemaTables.find(t => t.name === hoveredField.tableName);
      const hoveredFieldData = hoveredTableData?.fields.find(f => f.name === hoveredField.fieldName);
      
      if (hoveredFieldData?.isForeign && hoveredFieldData.references) {
        const [refTable, refField] = hoveredFieldData.references.split(".");
        if (refTable === tableName && refField === fieldName) {
          return "text-purple-400 font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] bg-purple-500/10";
        }
      }

      const currentFieldData = schemaTables.find(t => t.name === tableName)?.fields.find(f => f.name === fieldName);
      if (currentFieldData?.isForeign && currentFieldData.references) {
        const [refTable, refField] = currentFieldData.references.split(".");
        if (refTable === hoveredField.tableName && refField === hoveredField.fieldName) {
          return "text-purple-400 font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] bg-purple-500/10";
        }
      }
    }

    for (const flowId of selectedFlowIds) {
      const flow = databaseFlows.find(f => f.id === flowId);
      if (!flow) continue;
      
      if (flow.source === tableName && flow.sourceField === fieldName) {
        return flow.type === "session" ? "text-sky-400" : flow.type === "stream" ? "text-purple-400" : flow.type === "logs" ? "text-amber-400" : "text-emerald-400";
      }
      if (flow.target === tableName && flow.targetField === fieldName) {
        return flow.type === "session" ? "text-sky-400 font-bold" : flow.type === "stream" ? "text-purple-400 font-bold" : flow.type === "logs" ? "text-amber-400 font-bold" : "text-emerald-400 font-bold";
      }
    }
    return null;
  };

  return (
    <div className="flex flex-col border border-white/[0.05] bg-[#090a0f] p-4 rounded-2xl w-full max-w-4xl text-left gap-4 relative overflow-hidden">
      
      {/* High-performance CSS keyframe for dynamic click packets */}
      <style>{`
        @keyframes manualPacketMove {
          0% { transform: scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: scale(0.6); opacity: 0; }
        }
        .click-packet-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          z-index: 40;
          pointer-events: none;
          box-shadow: 0 0 10px currentColor;
        }
      `}</style>

      {/* Decorative Blur Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.04] pb-4 z-10">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-sky-500/10 border border-sky-500/20">
              <Database className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                Database Schema Mind Map
                <span className="text-[7.5px] font-bold px-1.5 py-0.2 bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[#38bdf8] rounded-full">Zoom & Pan</span>
              </span>
              <p className="text-[8.5px] text-gray-500 font-mono mt-0.5">University Database Architecture Systems</p>
            </div>
          </div>
        </div>

        {/* Schema Switcher: SQL vs NoSQL Toggle */}
        <div className="flex bg-black/45 border border-white/10 p-0.5 rounded-lg">
          <button
            onClick={() => handleSchemaSwitch("sql")}
            className={`px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              schemaType === "sql"
                ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            SQL Relational
          </button>
          <button
            onClick={() => handleSchemaSwitch("nosql")}
            className={`px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              schemaType === "nosql"
                ? "bg-rose-500/10 text-rose-450 border border-rose-500/20 shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            NoSQL Cache & Doc
          </button>
        </div>

        {/* View mode buttons & actions */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={triggerBurst}
            disabled={isBursting}
            className="px-2 py-1 rounded border border-amber-500/25 bg-amber-500/10 text-amber-455 hover:text-white text-[8px] font-mono flex items-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-40"
          >
            <Zap className="w-2.5 h-2.5" />
            Burst System Loads
          </button>

          <button
            onClick={() => setIsFlowAnimating(!isFlowAnimating)}
            className="px-2 py-1 rounded border border-white/5 bg-white/5 text-gray-400 hover:text-white text-[8px] font-mono flex items-center gap-1 cursor-pointer transition-all active:scale-95"
          >
            {isFlowAnimating ? <Pause className="w-2.5 h-2.5 text-sky-400" /> : <Play className="w-2.5 h-2.5 text-gray-500" />}
            {isFlowAnimating ? "Pause Auto" : "Start Auto"}
          </button>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          <div className="flex bg-black/40 border border-white/5 p-0.5 rounded-lg">
            {(["visual", "ddl", "relations"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  viewMode === mode
                    ? "bg-white/5 text-white border border-white/5"
                    : "text-gray-555 hover:text-gray-400"
                }`}
              >
                {mode === "visual" ? "Mind Map" : mode === "ddl" ? "SQL DDL" : "Relations"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live System Diagnostics Dashboard Bar */}
      {viewMode === "visual" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/35 border border-white/5 p-3 rounded-xl text-[9px] font-mono z-10 relative">
          <div className="flex flex-col">
            <span className="text-gray-555 text-[7px] uppercase font-bold tracking-wider">Mind Map Zoom Scale</span>
            <span className="text-sky-400 font-bold text-[11px] mt-0.5 flex items-center gap-1">
              <Move className="w-3.5 h-3.5" /> {(scale * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex flex-col border-l border-white/5 pl-3">
            <span className="text-gray-555 text-[7px] uppercase font-bold tracking-wider">Active Queries</span>
            <span className="text-white font-bold text-[11px] mt-0.5">{activeQueries} req/s</span>
          </div>
          <div className="flex flex-col border-l border-white/5 pl-3">
            <span className="text-gray-555 text-[7px] uppercase font-bold tracking-wider">Avg Latency</span>
            <span className="text-purple-400 font-bold text-[11px] mt-0.5">{avgLatency} ms</span>
          </div>
          <div className="flex flex-col border-l border-white/5 pl-3">
            <span className="text-gray-555 text-[7px] uppercase font-bold tracking-wider">Live Output Rate</span>
            <span className="text-emerald-400 font-bold text-[11px] mt-0.5">{totalThroughput} MB/s</span>
          </div>

          <div className="absolute right-3 top-3 text-[7.5px] text-gray-500 font-semibold uppercase tracking-wider animate-pulse hidden md:block">
            💡 Scroll-zoom | Drag background to Pan | Drag table headers
          </div>
        </div>
      )}

      {/* Flow Selection Controller */}
      {viewMode === "visual" && (
        <div className="flex flex-wrap gap-2 items-center bg-black/20 border border-white/5 p-2 rounded-xl text-[9px] font-mono z-10">
          <span className="text-gray-555 uppercase font-bold text-[8px] mr-1">
            Toggle Flows (Check together):
          </span>
          {databaseFlows.map((flow) => {
            const isActive = selectedFlowIds.includes(flow.id);
            return (
              <button
                key={flow.id}
                onClick={() => toggleFlow(flow.id)}
                className={`px-2 py-1 rounded-lg border text-[8.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive 
                    ? `${flow.color} bg-white/5 ring-1 ring-white/10`
                    : "bg-transparent border-white/5 text-gray-555 hover:text-gray-300 hover:border-white/10"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  flow.type === "session" ? "bg-sky-400" : flow.type === "stream" ? "bg-purple-400" : flow.type === "logs" ? "bg-amber-400" : "bg-emerald-400"
                }`} />
                {flow.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Board view */}
      <div className="flex flex-col lg:flex-row gap-4 z-10">
        
        {/* VIEW 1: Infinite Grid Mind Map Canvas */}
        {viewMode === "visual" && (
          <div 
            ref={containerRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            className="flex-1 bg-[#06070a] border border-white/[0.03] rounded-xl relative overflow-hidden h-[420px] select-none cursor-grab active:cursor-grabbing"
          >
            
            {/* SVG Dot grid background replicating React Flow / Figma */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <svg className="w-full h-full">
                <defs>
                  <pattern 
                    id="grid-dots" 
                    width={20 * scale} 
                    height={20 * scale} 
                    patternUnits="userSpaceOnUse"
                    patternTransform={`translate(${pan.x}, ${pan.y})`}
                  >
                    <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.12)" />
                  </pattern>
                </defs>
                <rect id="grid-dots-rect" width="100%" height="100%" fill="url(#grid-dots)" />
              </svg>
            </div>

            {/* Transform Layer that translates and scales all nodes & lines together */}
            <div 
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                transformOrigin: "0 0",
                width: "100%",
                height: "100%",
                position: "absolute"
              }}
            >
              {/* SVG Dynamic curve path overlay inside scaled layer */}
              <svg className="absolute inset-0 w-[1000px] h-[700px] pointer-events-none">
                {databaseFlows.map(flow => {
                  const isActive = selectedFlowIds.includes(flow.id);
                  const { startX, startY, endX, endY } = getFlowCoordinates(flow);
                  if (startX === 0) return null;

                  const isHoveredRelation = hoveredField && (
                    (hoveredField.tableName === flow.source && hoveredField.fieldName === flow.sourceField) ||
                    (hoveredField.tableName === flow.target && hoveredField.fieldName === flow.targetField)
                  );

                  const pathString = getOrthogonalPath(flow);
                  const opacityClass = !isActive ? "opacity-5" : (hoveredField && !isHoveredRelation) ? "opacity-15" : "opacity-100";

                  return (
                    <g key={flow.id} className={`transition-all duration-300 ${opacityClass}`}>
                      {/* Dark under-line backdrop path to give high separation contrast */}
                      <path 
                        d={pathString}
                        stroke="#06070a"
                        strokeWidth="5"
                        strokeLinejoin="round"
                        fill="none"
                      />
                      {/* Actual colored connection line */}
                      <path 
                        d={pathString}
                        stroke={isHoveredRelation ? "#a855f7" : flow.strokeColor}
                        strokeWidth={isHoveredRelation ? "2.5" : "1.2"}
                        strokeLinejoin="round"
                        fill="none"
                      />
                      {/* Small circular connector plug/port points at both endpoints of the line */}
                      <circle cx={startX} cy={startY} r="3" fill="#090a0f" stroke={isHoveredRelation ? "#a855f7" : flow.strokeColor} strokeWidth="1.5" />
                      <circle cx={endX} cy={endY} r="3" fill="#090a0f" stroke={isHoveredRelation ? "#a855f7" : flow.strokeColor} strokeWidth="1.5" />
                    </g>
                  );
                })}
              </svg>

              {/* Click-spawned packet rendering */}
              {clickPackets.map(packet => {
                const flow = databaseFlows.find(f => f.id === packet.flowId);
                if (!flow) return null;
                const colorStyle = flow.id === "flow-student-enroll" ? "#38bdf8" : flow.id === "flow-course-enroll" ? "#a855f7" : flow.id === "flow-instructor-dept" ? "#34d399" : "#f59e0b";
                
                return (
                  <div 
                    key={packet.id}
                    className="click-packet-dot"
                    style={{
                      backgroundColor: colorStyle,
                      color: colorStyle,
                      animation: "manualPacketMove 1.2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards",
                      left: `${packet.endX}px`,
                      top: `${packet.endY}px`,
                      transition: "left 1.2s cubic-bezier(0.1, 0.8, 0.3, 1), top 1.2s cubic-bezier(0.1, 0.8, 0.3, 1)"
                    }}
                  />
                );
              })}

              {/* Floating Live Speed and Latency Badges in the middle of flows */}
              {databaseFlows.map(flow => {
                const isActive = selectedFlowIds.includes(flow.id);
                if (!isActive) return null;

                const { startX, startY, endX, endY } = getFlowCoordinates(flow);
                if (startX === 0) return null;

                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;

                const speedVal = flow.id === "flow-student-enroll" ? 1.2 : flow.id === "flow-course-enroll" ? 4.5 : flow.id === "flow-instructor-dept" ? 0.8 : 0.5;

                return (
                  <div 
                    key={`${flow.id}-badge`}
                    onClick={() => spawnManualPacket(flow.id)}
                    style={{
                      left: `${midX}px`,
                      top: `${midY}px`,
                      transform: "translate(-50%, -50%)"
                    }}
                    className={`absolute bg-[#090a0f]/95 border px-2 py-0.5 rounded text-[7px] font-mono flex items-center gap-1 z-30 cursor-pointer transition-all select-none shadow-md ${
                      flow.id === "flow-student-enroll" ? "border-sky-500/25 text-sky-400 hover:border-sky-400" :
                      flow.id === "flow-course-enroll" ? "border-purple-500/25 text-purple-400 hover:border-purple-400" :
                      flow.id === "flow-instructor-dept" ? "border-emerald-500/25 text-emerald-405 hover:border-emerald-400" :
                      "border-amber-500/25 text-amber-400 hover:border-amber-400"
                    }`}
                    title="Click to spawn packet"
                  >
                    <span>⚡ {(trafficLoad * speedVal).toFixed(1)} MB/s</span>
                  </div>
                );
              })}

              {/* Render table cards at absolute pixel coordinate positions state */}
              {schemaTables.map((table) => {
                const isSelected = table.name === selectedTable;
                const isConnected = isRelationConnected(table.name);
                const isFade = hoveredTable ? !isHoverConnected(table.name) : false;

                const hasActiveFlow = selectedFlowIds.some(flowId => {
                  const flow = databaseFlows.find(f => flowId === f.id);
                  return flow ? (flow.source === table.name || flow.target === table.name) : false;
                });

                // Distinct color scheme based on DB Category (SQL vs NoSQL)
                const isNoSQL = table.dbType.startsWith("NoSQL");
                
                let borderStyle = "border-white/5 bg-[#08090d]/95 text-gray-400 scale-95";
                let glow = "";
                
                if (isNoSQL) {
                  borderStyle = isSelected 
                    ? "border-rose-500 bg-[#0c0a0d] text-white scale-100 ring-1 ring-rose-500/20 shadow-xl"
                    : "border-rose-500/25 bg-[#0a080a]/95 text-gray-300 scale-98 shadow-md";
                  glow = isSelected ? "shadow-[0_4px_24px_rgba(244,63,94,0.08)]" : "";
                } else if (hasActiveFlow && selectedFlowIds.length > 0) {
                  borderStyle = "border-purple-500/30 bg-[#0a0c12] text-white scale-100 ring-1 ring-white/5 shadow-xl";
                  glow = "shadow-[0_4px_24px_rgba(168,85,247,0.08)]";
                } else if (isSelected) {
                  borderStyle = "border-sky-500/30 bg-[#0a0c12] text-white scale-100 ring-1 ring-sky-500/10 shadow-xl";
                  glow = "shadow-[0_4px_24px_rgba(56,189,248,0.1)]";
                } else if (isConnected) {
                  borderStyle = "border-purple-500/20 bg-[#08090d]/95 text-gray-300 scale-98";
                }

                const pos = positions[table.name] || { x: 50, y: 50 };

                return (
                  <div
                    key={table.name}
                    onMouseEnter={() => setHoveredTable(table.name)}
                    onMouseLeave={() => setHoveredTable(null)}
                    style={{
                      left: `${pos.x}px`,
                      top: `${pos.y}px`,
                      position: "absolute"
                    }}
                    className={`w-[144px] border rounded-lg overflow-hidden cursor-pointer transition-all duration-100 z-20 ${borderStyle} ${glow} ${
                      isFade ? "opacity-20 blur-[0.3px] scale-90 saturate-50 animate-pulse" : "opacity-100"
                    }`}
                  >
                    {/* Card Draggable Header */}
                    <div 
                      onMouseDown={(e) => handleStartDrag(e, table.name)}
                      style={{ height: `${HEADER_HEIGHT}px` }}
                      className={`px-3 flex items-center justify-between border-b cursor-grab active:cursor-grabbing select-none ${
                        isSelected 
                          ? isNoSQL ? "bg-rose-500/10 border-rose-500/20 text-rose-400 font-bold" : "bg-sky-500/10 border-sky-500/20 text-sky-400 font-bold"
                          : isNoSQL ? "bg-rose-500/[0.02] border-rose-500/10 text-rose-300/90 font-semibold" : "bg-white/[0.02] border-white/5 text-gray-300 font-semibold"
                      }`}
                      title="Drag header to move table"
                    >
                      <div className="flex flex-col text-left leading-none justify-center">
                        <span className="text-[9px] font-mono uppercase tracking-wider">{table.name}</span>
                        <span className="text-[5.5px] text-gray-550 font-bold uppercase tracking-widest mt-0.5">{table.dbType}</span>
                      </div>
                      <span className="text-[6.5px] text-gray-500 font-mono font-semibold">{table.diskSize}</span>
                    </div>

                    {/* Table fields list */}
                    <div className="flex flex-col bg-[#090a0e]/60 divide-y divide-white/[0.02] select-none">
                      {table.fields
                        .map(f => {
                          const flowColor = getFieldFlowColor(table.name, f.name);
                          return (
                            <div 
                              key={f.name} 
                              onClick={() => handleNodeClick(table.name)}
                              onMouseEnter={() => setHoveredField({ tableName: table.name, fieldName: f.name })}
                              onMouseLeave={() => setHoveredField(null)}
                              style={{ height: `${ROW_HEIGHT}px` }}
                              className={`flex items-center justify-between text-[8px] font-mono leading-none cursor-pointer hover:bg-white/[0.03] px-3 transition-colors ${
                                flowColor ? flowColor : ""
                              }`}
                            >
                              <span className="flex items-center gap-1.5 overflow-hidden">
                                {f.isPrimary && <Key className="w-2.5 h-2.5 text-amber-450 flex-shrink-0" />}
                                {f.isForeign && <Link className="w-2.5 h-2.5 text-purple-500/60 flex-shrink-0" />}
                                <span className="truncate max-w-[80px]">
                                  {f.name}
                                </span>
                              </span>
                              <span className="text-gray-555 text-[6.5px] font-semibold">{f.type.split(" ")[0]}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Floating Zoom & Pan Control HUD panel in corner */}
            <div className="absolute bottom-3 left-3 flex items-center bg-black/85 border border-white/10 rounded-lg p-0.5 shadow-xl z-30 select-none gap-0.5">
              <button 
                onClick={handleZoomIn}
                className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/5 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleZoomOut}
                className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/5 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleZoomReset}
                className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/5 transition-colors cursor-pointer text-[8px] font-bold font-mono px-2"
                title="Reset View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

        {/* VIEW 2: Raw DDL View */}
        {viewMode === "ddl" && (
          <div className="flex-1 bg-black/40 border border-white/[0.03] p-4 rounded-xl font-mono text-[9px] text-gray-350 leading-relaxed overflow-y-auto h-[420px] scrollbar-thin select-text">
            <span className="text-[8px] font-bold text-gray-600 block uppercase mb-2 border-b border-white/5 pb-1">SQL DDL Schema definition</span>
            <div className="flex flex-col gap-3">
              {schemaTables.map(t => (
                <div key={t.name} className="flex flex-col">
                  <span className="text-sky-400 font-bold">CREATE TABLE <span className="text-white">{t.name}</span> (</span>
                  {t.fields.map((f, i) => (
                    <span key={f.name} className="pl-4 text-gray-400">
                      {f.name} {f.type === "UUID" ? "UUID" : f.type.toUpperCase()}{f.isPrimary ? " PRIMARY KEY" : ""}{i < t.fields.length - 1 ? "," : ""}
                      {f.isForeign && <span className="text-purple-400/80"> -- REFERENCES {f.references}</span>}
                    </span>
                  ))}
                  <span className="text-sky-400">);</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: Relationship Schema Table view */}
        {viewMode === "relations" && (
          <div className="flex-1 bg-black/40 border border-white/[0.03] p-4 rounded-xl font-mono text-[9px] text-gray-355 leading-relaxed overflow-y-auto h-[420px] scrollbar-thin">
            <span className="text-[8px] font-bold text-gray-600 block uppercase mb-2 border-b border-white/5 pb-1">Schema Relationship Catalog</span>
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-4 gap-2 font-bold text-gray-455 border-b border-white/5 pb-1">
                <span>Source Node</span>
                <span>Foreign Key</span>
                <span className="text-center">Type</span>
                <span>Referenced Node</span>
              </div>
              {schemaTables.flatMap(t => 
                t.fields.filter(f => f.isForeign).map(f => (
                  <div key={f.name} className="grid grid-cols-4 gap-2 py-1 border-b border-white/[0.02] hover:bg-white/[0.01] items-center transition-colors">
                    <span className="text-white font-semibold">{t.name}</span>
                    <span className="text-purple-400">{f.name}</span>
                    <span className="text-center text-[8px] text-gray-500 font-bold bg-white/5 px-1 py-0.2 rounded border border-white/10 w-fit mx-auto">One-To-Many</span>
                    <span className="text-sky-400 font-semibold">{f.references?.split(".")[0]}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Selected Table / Flow details drawer */}
        <div className="w-full lg:w-72 flex flex-col border border-white/5 bg-[#0b0c10]/60 p-4 rounded-xl gap-3.5 relative overflow-hidden h-[420px]">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-2.5">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider truncate">Table: {activeTable.name}</span>
            </div>
            <span className="text-[7.5px] font-mono text-gray-550">{activeTable.diskSize}</span>
          </div>

          <div className="flex flex-col gap-1 text-[9.5px]">
            <span className="text-[7.5px] text-gray-500 font-bold uppercase tracking-wider">Description</span>
            <p className="text-gray-350 leading-relaxed font-sans">{activeTable.description}</p>
          </div>

          {/* Traffic Load Simulation Controller Slider */}
          <div className="flex flex-col gap-1.5 bg-black/40 border border-white/5 p-3 rounded-xl text-[9px] font-mono">
            <div className="flex justify-between items-center text-[7.5px] font-bold text-gray-500 uppercase tracking-wider">
              <span>Traffic Load Multiplier</span>
              <span className="text-white font-mono font-bold">{trafficLoad}x</span>
            </div>
            <input 
              type="range"
              min="1"
              max="10"
              value={trafficLoad}
              onChange={(e) => setTrafficLoad(parseInt(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer h-1 bg-white/10 rounded-lg outline-none"
            />
            <div className="flex justify-between text-[7px] text-gray-655 mt-1 font-sans">
              <span>1x (1 Handshake)</span>
              <span>10x (10 Active)</span>
            </div>
          </div>

          {/* Active Flow Connections on this table */}
          <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[120px] scrollbar-thin">
            <span className="text-[7.5px] text-gray-500 font-bold uppercase tracking-wider">Active Flow References</span>
            <div className="flex flex-col gap-1.5">
              {databaseFlows
                .filter(flow => selectedFlowIds.includes(flow.id) && (flow.source === activeTable.name || flow.target === activeTable.name))
                .map(flow => (
                  <div key={flow.id} className="flex flex-col gap-1 bg-black/45 border border-white/5 p-2 rounded-xl text-[8.5px] font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-[8px]">{flow.name}</span>
                      <span className="text-[7px] text-emerald-455 bg-emerald-500/10 px-1 rounded font-bold uppercase">Active</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-450 border-t border-white/[0.03] pt-1 mt-0.5 text-[7.5px]">
                      <span>{flow.source}.{flow.sourceField} ➔</span>
                      <span className="text-sky-400 font-semibold">{flow.target}.{flow.targetField}</span>
                    </div>
                  </div>
                ))}
              {databaseFlows.filter(flow => selectedFlowIds.includes(flow.id) && (flow.source === activeTable.name || flow.target === activeTable.name)).length === 0 && (
                <div className="text-[8px] text-gray-655 italic bg-black/10 border border-white/5 p-2 rounded-lg text-center">
                  No active flow linkages selected.
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-auto pt-2.5 border-t border-white/[0.04]">
            <button
              onClick={() => alert(`SQL Create Command:\n\nCREATE TABLE ${activeTable.name} (\n` + 
                activeTable.fields.map(f => `  ${f.name} ${f.type === "UUID" ? "UUID" : "VARCHAR(255)"}${f.isPrimary ? " PRIMARY KEY" : ""}`).join(",\n") + 
                `\n);`
              )}
              className="flex-1 py-1 text-[8px] font-bold uppercase tracking-wider text-gray-400 hover:text-white border border-white/5 bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
            >
              Copy SQL Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
