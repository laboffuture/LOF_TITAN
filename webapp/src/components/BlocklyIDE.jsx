import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';
import { 
  Cpu, 
  Settings, 
  Wifi, 
  Tv, 
  SlidersHorizontal, 
  Repeat, 
  Sigma, 
  Type, 
  ListOrdered, 
  XCircle, 
  Sparkles, 
  Clock, 
  Box, 
  Folder, 
  Globe, 
  RotateCcw, 
  RotateCw, 
  Moon, 
  Play, 
  Square,
  Upload, 
  Code, 
  Copy, 
  Check, 
  X,
  ChevronRight,
  Terminal,
  Trash2,
  Send,
  Save,
  FolderOpen
} from 'lucide-react';

import { registerCustomBlocks } from '../blockly/blocks/customBlocks';
import { registerPythonGenerators, generateTitanWorkspaceCode } from '../blockly/generators/pythonGenerator';
import { LunarTheme } from '../blockly/theme/lunarTheme';
import { toolboxDefinition } from '../blockly/toolbox/toolboxDefinition';
import '../blockly/blocklyCustom.css';

// Register custom blocks and generators once
let blocksRegistered = false;
function initBlockly() {
  if (!blocksRegistered) {
    Blockly.setLocale(En);
    registerCustomBlocks();
    registerPythonGenerators();
    blocksRegistered = true;
  }
}

export function BlocklyIDE({ isOpen, onClose, device, onUploadCode }) {
  const blocklyDivRef = useRef(null);
  const workspaceRef = useRef(null);
  const consoleBottomRef = useRef(null);
  const fileInputRef = useRef(null);

  const [pythonCode, setPythonCode] = useState('');
  const [showPythonDrawer, setShowPythonDrawer] = useState(false);
  const [showSerialMonitor, setShowSerialMonitor] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [serialInput, setSerialInput] = useState('');

  // Auto-scroll serial console when output changes
  useEffect(() => {
    if (autoScroll && consoleBottomRef.current) {
      consoleBottomRef.current.scrollTop = consoleBottomRef.current.scrollHeight;
    }
  }, [device?.consoleOutput, autoScroll, showSerialMonitor]);

  // Category Configuration matching the Lunar Light design
  const categories = [
    { name: "LOF TITAN", icon: Cpu, color: "#38bdf8", bg: "#f0f9ff", customId: "titan" },
    { name: "Sensors", icon: Sparkles, color: "#06b6d4", bg: "#ecfeff", customId: "sensors" },
    { name: "Motors", icon: Settings, color: "#a855f7", bg: "#faf5ff", customId: "motors" },
    { name: "IOT", icon: Wifi, color: "#0ea5e9", bg: "#f0f9ff", customId: "iot" },
    { name: "Display", icon: Tv, color: "#8b5cf6", bg: "#f5f3ff", customId: "display" },
    { name: "Logic", icon: SlidersHorizontal, color: "#64748b", bg: "#f8fafc", customId: "logic" },
    { name: "Loops", icon: Repeat, color: "#22c55e", bg: "#f0fdf4", customId: "loops" },
    { name: "Math", icon: Sigma, color: "#8b5cf6", bg: "#f5f3ff", customId: "math" },
    { name: "Text", icon: Type, color: "#14b8a6", bg: "#f0fdfa", customId: "text" },
    { name: "Lists", icon: ListOrdered, color: "#8b5cf6", bg: "#f5f3ff", customId: "lists" },
    { name: "Variables", icon: XCircle, color: "#ec4899", bg: "#fdf2f8", customId: "variables" },
    { name: "Functions", icon: Sparkles, color: "#8b5cf6", bg: "#f5f3ff", customId: "functions" },
    { name: "Timing", icon: Clock, color: "#0284c7", bg: "#f0f9ff", customId: "timing" },
    { name: "Machine", icon: Box, color: "#6366f1", bg: "#eef2ff", customId: "machine", hasChevron: true },
    { name: "Files", icon: Folder, color: "#3b82f6", bg: "#eff6ff", customId: "files" },
    { name: "Network and Internet", icon: Globe, color: "#2563eb", bg: "#eff6ff", customId: "network", hasChevron: true }
  ];

  useEffect(() => {
    if (!isOpen) return;

    initBlockly();

    const timeout = setTimeout(() => {
      if (!blocklyDivRef.current) return;

      if (workspaceRef.current) {
        workspaceRef.current.dispose();
      }

      const workspace = Blockly.inject(blocklyDivRef.current, {
        toolbox: toolboxDefinition,
        theme: LunarTheme,
        renderer: 'zelos',
        grid: {
          spacing: 24,
          length: 2,
          colour: '#CBD5E1',
          snap: true
        },
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.05,
          maxScale: 2.5,
          minScale: 0.4,
          scaleSpeed: 1.1
        },
        trashcan: true,
        move: {
          scrollbars: {
            horizontal: true,
            vertical: true
          },
          drag: true,
          wheel: false
        }
      });

      workspaceRef.current = workspace;

      // Safely ensure default HTML toolbox elements are hidden
      try {
        const defaultToolbox = workspace.getToolbox();
        if (defaultToolbox) {
          if (defaultToolbox.HtmlDiv) defaultToolbox.HtmlDiv.style.display = 'none';
          if (typeof defaultToolbox.getHtmlDiv === 'function') defaultToolbox.getHtmlDiv().style.display = 'none';
        }
      } catch (e) {}

      // Load saved workspace from localStorage or default initial blocks
      const savedWorkspaceStr = localStorage.getItem("titan_auto_workspace");
      let loaded = false;
      if (savedWorkspaceStr) {
        try {
          const parsed = JSON.parse(savedWorkspaceStr);
          Blockly.serialization.workspaces.load(parsed, workspace);
          loaded = true;
        } catch (e) {}
      }

      if (!loaded) {
        const initialJson = {
          blocks: {
            languageVersion: 0,
            blocks: [
              {
                type: "project_info",
                x: 320,
                y: 60,
                fields: {
                  AUTHOR: "User",
                  DESCRIPTION: "My project"
                }
              },
              {
                type: "titan_start",
                x: 320,
                y: 200,
                inputs: {
                  DO: {
                    block: {
                      type: "titan_repeat_while",
                      fields: { MODE: "WHILE" },
                      inputs: {
                        BOOL: {
                          block: {
                            type: "logic_boolean",
                            fields: { BOOL: "TRUE" }
                          }
                        },
                        DO: {
                          block: {
                            type: "titan_print",
                            inputs: {
                              TEXT: {
                                shadow: {
                                  type: "titan_text",
                                  fields: { TEXT: "trg" }
                                }
                              }
                            },
                            next: {
                              block: {
                                type: "titan_wait",
                                fields: {
                                  TIME: 1,
                                  UNIT: "SECONDS"
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            ]
          }
        };

        try {
          Blockly.serialization.workspaces.load(initialJson, workspace);
        } catch (err) {
          console.warn("Initial block load warning:", err);
        }
      }

      // Ensure flyout scale is strictly fixed at 0.85 independent of main canvas zoom
      const FIXED_FLYOUT_SCALE = 0.85;

      const fixFlyout = () => {
        const fl = workspace.getFlyout() || workspace.getToolbox()?.getFlyout();
        if (fl) {
          fl.autoClose = true;
          if (fl.workspace_) {
            fl.workspace_.scale = FIXED_FLYOUT_SCALE;
            // Lock flyout workspace scale so it stays fixed regardless of main canvas zoom
            fl.workspace_.setScale = function() {
              this.scale = FIXED_FLYOUT_SCALE;
              Blockly.WorkspaceSvg.prototype.setScale.call(this, FIXED_FLYOUT_SCALE);
            };
          }

          if (!fl._titanScrollFixed) {
            const origShow = fl.show ? fl.show.bind(fl) : null;
            if (origShow) {
              fl.show = function(xmlList) {
                origShow(xmlList);
                if (this.workspace_) {
                  this.workspace_.scale = FIXED_FLYOUT_SCALE;
                  Blockly.WorkspaceSvg.prototype.setScale.call(this.workspace_, FIXED_FLYOUT_SCALE);
                  if (typeof this.reflow === 'function') {
                    this.reflow();
                  }
                }
                if (this.scrollbar_) {
                  try {
                    this.scrollbar_.setVisible(true);
                    this.scrollbar_.resize();
                  } catch (e) {}
                }
              };
            }

            const origReflow = fl.reflow ? fl.reflow.bind(fl) : null;
            if (origReflow) {
              fl.reflow = function() {
                if (this.workspace_) {
                  this.workspace_.scale = FIXED_FLYOUT_SCALE;
                }
                origReflow();
                if (this.workspace_) {
                  this.workspace_.scale = FIXED_FLYOUT_SCALE;
                  Blockly.WorkspaceSvg.prototype.setScale.call(this.workspace_, FIXED_FLYOUT_SCALE);
                }
                if (this.scrollbar_) {
                  try {
                    this.scrollbar_.setVisible(true);
                    this.scrollbar_.resize();
                  } catch (e) {}
                }
              };
            }

            // Stop wheel events over the flyout from zooming or panning the main canvas
            if (fl.svgGroup_) {
              fl.svgGroup_.addEventListener('wheel', (evt) => {
                evt.stopPropagation();
              }, { passive: false });
            }

            fl._titanScrollFixed = true;
          }
        }
      };
      fixFlyout();

      const closeFlyout = () => {
        const tb = workspace.getToolbox();
        const fl = workspace.getFlyout() || tb?.getFlyout();
        if (tb) tb.clearSelection();
        if (fl) {
          fl.hide();
          if (typeof fl.setVisible === 'function') fl.setVisible(false);
          if (fl.scrollbar_) {
            try {
              fl.scrollbar_.setVisible(false);
            } catch (e) {}
          }
        }
        setSelectedCategory(null);
      };

      // Generate Python code on change & handle blockly events
      const updateCode = (e) => {
        try {
          const code = generateTitanWorkspaceCode(workspace);
          setPythonCode(code);
          // Auto-persist workspace state
          const state = Blockly.serialization.workspaces.save(workspace);
          localStorage.setItem("titan_auto_workspace", JSON.stringify(state));
        } catch (err) {
          console.error("Generator error:", err);
        }
        try {
          const hasUndo = Boolean(workspace.undoStack_ && workspace.undoStack_.length > 0);
          const hasRedo = Boolean(workspace.redoStack_ && workspace.redoStack_.length > 0);
          setCanUndo(hasUndo);
          setCanRedo(hasRedo);
        } catch (e) {}

        // Close flyout when a block is created, moved, or clicked on workspace
        if (e && (
          e.type === Blockly.Events.BLOCK_CREATE ||
          (e.type === Blockly.Events.BLOCK_DRAG && !e.isStart) ||
          e.type === Blockly.Events.BLOCK_MOVE ||
          e.type === Blockly.Events.CLICK ||
          e.type === Blockly.Events.SELECTED
        )) {
          closeFlyout();
        }
      };

      workspace.addChangeListener(updateCode);
      updateCode();

      // Close flyout whenever clicking on the workspace canvas or outside
      const handleWorkspaceClick = (evt) => {
        const target = evt.target;
        if (target && target.closest) {
          if (
            target.closest('.category-pill') ||
            target.closest('.blocklyFlyout') ||
            target.closest('.blocklyDropdownMenu') ||
            target.closest('.blocklyWidgetDiv') ||
            target.closest('.serial-panel') ||
            target.closest('.action-btn')
          ) {
            return;
          }
        }
        closeFlyout();
      };

      window.addEventListener('pointerdown', handleWorkspaceClick, { capture: true });
      window.addEventListener('mousedown', handleWorkspaceClick, { capture: true });

      Blockly.svgResize(workspace);
    }, 100);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('pointerdown', () => {}, { capture: true });
      window.removeEventListener('mousedown', () => {}, { capture: true });
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, [isOpen]);

  // Handle automatic workspace SVG resizing on container size changes & window resize
  useEffect(() => {
    if (!blocklyDivRef.current || !isOpen) return;

    const resizeWorkspace = () => {
      if (workspaceRef.current) {
        try {
          Blockly.svgResize(workspaceRef.current);
        } catch (e) {}
      }
    };

    const ro = new ResizeObserver(() => {
      resizeWorkspace();
    });
    ro.observe(blocklyDivRef.current);

    window.addEventListener('resize', resizeWorkspace);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', resizeWorkspace);
    };
  }, [isOpen]);

  // Trigger SVG resize smoothly during Python Code Drawer and Serial Monitor transitions
  useEffect(() => {
    if (!workspaceRef.current) return;

    try {
      Blockly.svgResize(workspaceRef.current);
    } catch (e) {}

    const t1 = setTimeout(() => {
      if (workspaceRef.current) Blockly.svgResize(workspaceRef.current);
    }, 50);
    const t2 = setTimeout(() => {
      if (workspaceRef.current) Blockly.svgResize(workspaceRef.current);
    }, 150);
    const t3 = setTimeout(() => {
      if (workspaceRef.current) Blockly.svgResize(workspaceRef.current);
    }, 300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [showPythonDrawer, showSerialMonitor]);

  // Handle Category Selection with toggle (click to open, click again to close)
  const handleCategoryClick = (cat) => {
    if (!workspaceRef.current) return;
    const toolbox = workspaceRef.current.getToolbox();
    const flyout = workspaceRef.current.getFlyout() || toolbox?.getFlyout();

    if (selectedCategory === cat.name) {
      setSelectedCategory(null);
      if (toolbox) toolbox.clearSelection();
      if (flyout) {
        flyout.hide();
        if (typeof flyout.setVisible === 'function') flyout.setVisible(false);
        if (flyout.scrollbar_) {
          try {
            flyout.scrollbar_.setVisible(false);
          } catch (e) {}
        }
      }
      return;
    }

    setSelectedCategory(cat.name);
    if (toolbox) {
      const items = toolbox.getToolboxItems();
      const targetIndex = items.findIndex(item => {
        const name = (typeof item.getName === 'function') ? item.getName() : (item.name_ || item.name);
        const id = (typeof item.getId === 'function') ? item.getId() : (item.id_ || item.customId);
        const defName = item.toolboxItemDef_?.name;
        const defId = item.toolboxItemDef_?.customId;
        return (
          name === cat.name ||
          id === cat.customId ||
          defName === cat.name ||
          defId === cat.customId ||
          (name && name.toLowerCase() === cat.name.toLowerCase())
        );
      });

      if (targetIndex !== -1) {
        toolbox.selectItemByPosition(targetIndex);
        const fl = workspaceRef.current?.getFlyout() || toolbox?.getFlyout();
        if (fl && fl.workspace_) {
          fl.workspace_.scale = 0.85;
          Blockly.WorkspaceSvg.prototype.setScale.call(fl.workspace_, 0.85);
          if (typeof fl.reflow === 'function') fl.reflow();
          if (fl.scrollbar_) {
            try {
              fl.scrollbar_.setVisible(true);
              fl.scrollbar_.resize();
            } catch (e) {}
          }
        }
      }
    }
  };

  const handleUndo = () => {
    if (workspaceRef.current) {
      workspaceRef.current.undo(false);
    }
  };

  const handleRedo = () => {
    if (workspaceRef.current) {
      workspaceRef.current.undo(true);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save Project to local file and storage
  const handleSaveProject = () => {
    if (!workspaceRef.current) return;
    try {
      const workspaceState = Blockly.serialization.workspaces.save(workspaceRef.current);
      const projectPayload = {
        format: "LOF_TITAN_PROJECT",
        version: "1.0",
        date: new Date().toISOString(),
        blocks: workspaceState,
        pythonCode: pythonCode
      };

      const jsonStr = JSON.stringify(projectPayload, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `titan_block_code_${new Date().toISOString().slice(0, 10)}.titan`;
      link.click();
      URL.revokeObjectURL(url);

      localStorage.setItem("titan_saved_project", jsonStr);
      setSaveStatus("Saved!");
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (e) {
      console.error("Save error:", e);
      alert("Failed to save project: " + e.message);
    }
  };

  // Open / Load saved project file
  const handleFileLoad = (e) => {
    const file = e.target.files?.[0];
    if (!file || !workspaceRef.current) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target.result;
        const data = JSON.parse(raw);
        const blocksData = data.blocks || data;
        workspaceRef.current.clear();
        Blockly.serialization.workspaces.load(blocksData, workspaceRef.current);
        setSaveStatus("Loaded!");
        setTimeout(() => setSaveStatus(null), 2500);
      } catch (err) {
        console.error("Load file error:", err);
        alert("Invalid project file: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleUploadToTitan = () => {
    if (onUploadCode) {
      onUploadCode(pythonCode);
    }
  };

  const handleSendSerialCommand = (e) => {
    e.preventDefault();
    if (!serialInput.trim() || !device) return;
    device.writeToSerial(serialInput + '\r\n');
    setSerialInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 backdrop-blur-md bg-slate-900/60 transition-all duration-300">
      
      {/* Hidden File Input for Opening Saved Projects */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileLoad} 
        accept=".titan,.json" 
        className="hidden" 
      />

      {/* Main Glassmorphic Container Card (Lunar Light Theme) */}
      <div className="relative w-full max-w-[1440px] h-[94vh] flex flex-col rounded-[28px] bg-gradient-to-br from-[#FDFEFE] to-[#F8FAFC] border border-[#E2E8F0] shadow-[0_20px_50px_rgba(0,0,0,0.25)] overflow-hidden">
        
        {/* Top Header Bar - Intelligent Responsive Layout */}
        <div className="flex flex-col xl:flex-row items-center justify-between border-b border-[#E2E8F0]/80 bg-white/90 backdrop-blur-md shrink-0 z-20">
          
          {/* Top Row on Mobile (Logo & Close Button), Left Side on Desktop */}
          <div className="flex items-center justify-between w-full xl:w-auto h-14 sm:h-16 px-3 sm:px-5">
            {/* Top Left: Glowing Moon Sphere Icon & LOF TITAN Logo */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden shadow-[0_0_15px_rgba(186,230,253,0.8)] border border-sky-200">
                <img 
                  src="/assets/lunar_sphere_icon.webp" 
                  alt="LOF TITAN Lunar" 
                  decoding="async"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/logo.webp";
                  }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-base tracking-wider text-slate-700">
                  LOF TITAN
                </span>
                <Sparkles size={14} className="text-slate-400 fill-slate-300/40" />
              </div>
            </div>

            {/* Close Button (Visible only on Mobile/Tablet in top row) */}
            <button 
              onClick={onClose} 
              className="xl:hidden p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-colors"
              title="Close Workspace"
            >
              <X size={20} />
            </button>
          </div>

          {/* Action Toolbar (Scrollable horizontally on mobile, flex row on desktop) */}
          <div className="flex items-center gap-2 sm:gap-3 w-full xl:w-auto overflow-x-auto scrollbar-hide px-3 sm:px-5 pb-2 xl:pb-0 shrink-0">
            
            {/* Center: Frosted Undo / Redo & Save / Load Project Tools */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Undo / Redo Glass Pill */}
              <div className="frosted-pill px-2.5 py-1 rounded-full flex items-center gap-2 text-slate-500 bg-slate-50 border border-slate-200 shrink-0">
                <button 
                  onClick={handleUndo} 
                  disabled={!canUndo}
                  className={`hover:text-slate-800 transition-colors p-1 rounded-full ${!canUndo ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100'}`}
                  title="Undo"
                >
                  <RotateCcw size={14} />
                </button>
                <div className="w-px h-3.5 bg-slate-300" />
                <button 
                  onClick={handleRedo} 
                  disabled={!canRedo}
                  className={`hover:text-slate-800 transition-colors p-1 rounded-full ${!canRedo ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100'}`}
                  title="Redo"
                >
                  <RotateCw size={14} />
                </button>
              </div>

              {/* Save / Open Project Pill */}
              <div className="frosted-pill px-3 py-1 rounded-full flex items-center gap-2.5 text-slate-600 bg-slate-50 border border-slate-200 shrink-0">
                <button 
                  onClick={handleSaveProject}
                  className="flex items-center gap-1.5 text-xs font-semibold hover:text-blue-600 transition-colors"
                  title="Save Block Code to File (.titan)"
                >
                  {saveStatus === "Saved!" ? <Check size={13} className="text-emerald-500" /> : <Save size={13} className="text-blue-500" />}
                  <span>{saveStatus || "Save"}</span>
                </button>
                <div className="w-px h-3.5 bg-slate-300" />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs font-semibold hover:text-purple-600 transition-colors"
                  title="Open Saved Project File"
                >
                  <FolderOpen size={13} className="text-purple-500" />
                  <span>Open</span>
                </button>
              </div>
            </div>

            <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

            {/* Run / Start Button */}
            <button 
              onClick={() => device?.sendCommand ? device.sendCommand('RUN') : null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-300 transition-all shadow-sm active:scale-95 shrink-0"
              title="Execute active Python code on LOF TITAN"
            >
              <Play size={13} className="fill-current text-emerald-500" />
              <span>Run</span>
            </button>

            {/* Stop Button */}
            <button 
              onClick={() => device?.sendCommand ? device.sendCommand('STOP') : null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-300 transition-all shadow-sm active:scale-95 shrink-0"
              title="Stop Rover / Program"
            >
              <Square size={12} className="fill-current text-rose-500" />
              <span>Stop</span>
            </button>

            {/* Reset Button */}
            <button 
              onClick={() => device?.sendCommand ? device.sendCommand('RESET') : null}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-all active:scale-95 shrink-0"
              title="Soft Reset TITAN"
            >
              <RotateCcw size={12} />
              <span className="hidden xl:inline">Reset</span>
            </button>

            {/* Serial Monitor Toggle Button */}
            <button 
              onClick={() => setShowSerialMonitor(!showSerialMonitor)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border shrink-0 ${
                showSerialMonitor 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Open Live Serial REPL Monitor"
            >
              <Terminal size={14} className={showSerialMonitor ? 'text-white' : 'text-emerald-500'} />
              <span className="hidden xl:inline">Serial</span>
            </button>

            {/* Python Code Drawer Toggle */}
            <button 
              onClick={() => setShowPythonDrawer(!showPythonDrawer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border shrink-0 ${
                showPythonDrawer 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Toggle Python Code Inspector"
            >
              <Code size={14} className={showPythonDrawer ? 'text-white' : 'text-blue-500'} />
              <span className="hidden xl:inline">Python</span>
            </button>

            {/* Run on TITAN Button */}
            <button 
              onClick={handleUploadToTitan}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0"
              title="Deploy and Upload MicroPython code directly to LOF TITAN"
            >
              <Upload size={13} />
              <span>Run on TITAN</span>
            </button>

            {/* Lunar Light Theme Pill */}
            <div className="hidden xl:flex frosted-pill px-3 py-1.5 rounded-full items-center gap-1.5 text-xs font-semibold text-slate-600 shrink-0">
              <Moon size={13} className="text-indigo-500" />
              <span>Lunar Light</span>
              <Sparkles size={11} className="text-purple-400" />
            </div>

            {/* Close Button (Visible only on Desktop in toolbar) */}
            <button 
              onClick={onClose} 
              className="hidden xl:flex p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-colors shrink-0"
              title="Close Workspace"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Area: Sidebar + Workspace + Drawers */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Left Custom Sidebar (Clean White Theme) */}
          <div className="w-[230px] shrink-0 bg-white border-r border-[#E2E8F0] flex flex-col justify-between relative overflow-hidden select-none z-10">
            
            {/* Category List */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => handleCategoryClick(cat)}
                    className={`category-pill w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                      isActive 
                        ? 'bg-slate-50 shadow-[0_2px_8px_rgba(148,163,184,0.2)] border-slate-200' 
                        : 'bg-transparent border-transparent hover:bg-slate-50/70 hover:border-slate-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-5 h-5 rounded-lg flex items-center justify-center"
                        style={{ color: cat.color }}
                      >
                        <IconComponent size={16} strokeWidth={2.2} />
                      </div>
                      <span 
                        style={{ 
                          color: cat.name === 'LOF TITAN' 
                            ? '#334155' 
                            : cat.color 
                        }}
                      >
                        {cat.name}
                      </span>
                    </div>

                    {cat.hasChevron && (
                      <ChevronRight size={12} className="text-slate-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Footer Section: LAB OF FUTURE Logo & Corner Lunar Landscape */}
            <div className="mt-auto shrink-0 flex flex-col items-center bg-white border-t border-slate-100/90 select-none">
              
              {/* Corner Lunar Landscape Artwork with Lowered Logo */}
              <div className="relative w-full h-28 overflow-hidden flex flex-col justify-between">
                
                {/* Official LAB OF FUTURE Logo (Lowered) */}
                <div className="w-full px-4 pt-2.5 z-10 flex items-center justify-center">
                  <img 
                    src="/assets/lab_of_future_logo.webp" 
                    alt="Lab of Future - Be Curious" 
                    decoding="async"
                    className="w-32 h-auto object-contain drop-shadow-sm hover:scale-105 transition-transform"
                  />
                </div>

                <img 
                  src="/assets/lunar_landscape.webp" 
                  alt="Lunar Landscape" 
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/85 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Center Workspace + Embedded Serial Monitor Layout */}
          <div className="flex-1 flex flex-col relative overflow-hidden bg-[#F8FAFC]">
            
            {/* Center Blockly Workspace */}
            <div className="flex-1 relative lunar-blockly-wrapper">
              <div ref={blocklyDivRef} className="absolute inset-0" />
            </div>

            {/* Integrated Serial Monitor Bottom Panel */}
            {showSerialMonitor && (
              <div className="serial-panel h-56 bg-[#0B0F19] border-t border-slate-700/80 flex flex-col z-20 shadow-[0_-5px_25px_rgba(0,0,0,0.3)] animate-fade-in shrink-0">
                
                {/* Serial Bar Header */}
                <div className="px-4 py-2 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Terminal size={15} className="text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">TITAN Serial REPL Monitor</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      device?.status === 'CONNECTED_IDLE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {device?.deviceName || device?.status || 'Device'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAutoScroll(!autoScroll)}
                      className={`text-[11px] px-2 py-0.5 rounded flex items-center gap-1.5 transition-colors ${
                        autoScroll ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}
                      title="Toggle auto-scroll"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${autoScroll ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      <span>Scroll</span>
                    </button>

                    <button
                      onClick={() => device?.clearConsole ? device.clearConsole() : null}
                      className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded transition-colors"
                      title="Clear Console Output"
                    >
                      <Trash2 size={14} />
                    </button>

                    <button
                      onClick={() => setShowSerialMonitor(false)}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                      title="Close Serial Monitor"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>

                {/* Serial Console Stream Output */}
                <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-emerald-400 selection:bg-emerald-500/30" ref={consoleBottomRef}>
                  {!device?.consoleOutput || device.consoleOutput.length === 0 ? (
                    <div className="text-slate-500 italic">Waiting for REPL serial output from LOF TITAN...</div>
                  ) : (
                    <pre className="whitespace-pre-wrap break-all leading-relaxed">{device.consoleOutput}</pre>
                  )}
                </div>

                {/* Serial Command Input Form */}
                <form onSubmit={handleSendSerialCommand} className="p-2 bg-[#0F172A] border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={serialInput}
                    onChange={(e) => setSerialInput(e.target.value)}
                    placeholder="Send command to TITAN REPL..."
                    className="flex-1 bg-[#060911] text-slate-100 text-xs px-3 py-1.5 rounded-lg border border-slate-700/60 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Send size={12} />
                    <span>Send</span>
                  </button>
                </form>

              </div>
            )}

          </div>

          {/* Right Slide-over Python Code Drawer */}
          {showPythonDrawer && (
            <div className="w-[420px] bg-[#0F172A] text-slate-200 border-l border-slate-800 flex flex-col z-20 animate-fade-in shadow-2xl shrink-0">
              
              <div className="px-4 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <Code size={16} className="text-sky-400" />
                  <span>Generated MicroPython Code</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button 
                    onClick={() => setShowPythonDrawer(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed text-sky-200 bg-[#0B0F19]">
                <pre className="whitespace-pre-wrap selection:bg-sky-500/30">
                  {pythonCode || "# Add blocks connected to TITAN Start to generate MicroPython code"}
                </pre>
              </div>

              <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex gap-2">
                <button
                  onClick={handleUploadToTitan}
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                >
                  <Upload size={14} />
                  <span>Run on TITAN</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
