import React, { useState, useMemo } from 'react';
import { Role, User, CompanyBranding } from '../types';
import { Avatar } from './Avatar';
import { 
  Users, 
  GitFork, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Edit2, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Building, 
  MapPin, 
  Briefcase, 
  Info,
  ShieldAlert,
  ArrowRight,
  CheckCircle,
  Award,
  Layers,
  Sparkles,
  Printer,
  Download
} from 'lucide-react';

interface HierarchyViewProps {
  roles: Role[];
  users: User[];
  onUpdateRoles: (roles: Role[]) => void;
  onUpdateUsers: (users: User[]) => void;
  branding?: CompanyBranding;
}

const getDeptColor = (deptName: string) => {
  const norm = (deptName || '').toLowerCase();
  if (norm.includes('director')) return 'from-rose-500 to-pink-600 border-rose-300 text-rose-700 bg-rose-50';
  if (norm.includes('account') || norm.includes('fin')) return 'from-indigo-500 to-blue-600 border-indigo-300 text-indigo-700 bg-indigo-50';
  if (norm.includes('billing') || norm.includes('vendor')) return 'from-violet-500 to-purple-600 border-purple-300 text-purple-700 bg-purple-50';
  if (norm.includes('warehouse') || norm.includes('logis')) return 'from-amber-500 to-orange-600 border-amber-300 text-amber-700 bg-amber-50';
  if (norm.includes('sales')) return 'from-emerald-500 to-teal-600 border-emerald-300 text-emerald-700 bg-emerald-50';
  if (norm.includes('crm') || norm.includes('customer')) return 'from-sky-500 to-cyan-600 border-sky-300 text-sky-700 bg-sky-50';
  if (norm.includes('admin') || norm.includes('it')) return 'from-slate-500 to-slate-600 border-slate-300 text-slate-700 bg-slate-50';
  return 'from-cyan-500 to-teal-600 border-cyan-300 text-cyan-700 bg-cyan-50';
};

const getDeptStyle = (deptName: string) => {
  const norm = (deptName || '').toLowerCase();
  if (norm.includes('director') || norm.includes('md') || norm.includes('mdo')) {
    return {
      barBg: 'bg-gradient-to-b from-rose-500 to-pink-600',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      cardBg: 'bg-rose-50/40 hover:bg-rose-50/70',
      textColor: 'text-rose-950',
      borderColor: 'border-rose-200/80 hover:border-rose-400',
      glowColor: 'shadow-rose-100',
      icon: '👑'
    };
  }
  if (norm.includes('account') || norm.includes('fin')) {
    return {
      barBg: 'bg-gradient-to-b from-indigo-500 to-blue-600',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      cardBg: 'bg-indigo-50/40 hover:bg-indigo-50/70',
      textColor: 'text-indigo-950',
      borderColor: 'border-indigo-200/80 hover:border-indigo-400',
      glowColor: 'shadow-indigo-100',
      icon: '📊'
    };
  }
  if (norm.includes('billing') || norm.includes('vendor')) {
    return {
      barBg: 'bg-gradient-to-b from-violet-500 to-purple-600',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200/80',
      cardBg: 'bg-purple-50/40 hover:bg-purple-50/70',
      textColor: 'text-purple-950',
      borderColor: 'border-purple-200/80 hover:border-purple-400',
      glowColor: 'shadow-purple-100',
      icon: '🧾'
    };
  }
  if (norm.includes('warehouse') || norm.includes('logis') || norm.includes('store')) {
    return {
      barBg: 'bg-gradient-to-b from-amber-500 to-orange-600',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200/80',
      cardBg: 'bg-amber-50/40 hover:bg-amber-50/70',
      textColor: 'text-amber-950',
      borderColor: 'border-amber-200/80 hover:border-amber-400',
      glowColor: 'shadow-amber-100',
      icon: '📦'
    };
  }
  if (norm.includes('sales') || norm.includes('marketing')) {
    return {
      barBg: 'bg-gradient-to-b from-emerald-500 to-teal-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      cardBg: 'bg-emerald-50/40 hover:bg-emerald-50/70',
      textColor: 'text-emerald-950',
      borderColor: 'border-emerald-200/80 hover:border-emerald-400',
      glowColor: 'shadow-emerald-100',
      icon: '📈'
    };
  }
  if (norm.includes('crm') || norm.includes('customer') || norm.includes('service')) {
    return {
      barBg: 'bg-gradient-to-b from-sky-500 to-cyan-600',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200/80',
      cardBg: 'bg-sky-50/40 hover:bg-sky-50/70',
      textColor: 'text-sky-950',
      borderColor: 'border-sky-200/80 hover:border-sky-400',
      glowColor: 'shadow-sky-100',
      icon: '🤝'
    };
  }
  if (norm.includes('admin') || norm.includes('it') || norm.includes('hr') || norm.includes('resource')) {
    return {
      barBg: 'bg-gradient-to-b from-slate-500 to-slate-600',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-200/80',
      cardBg: 'bg-slate-50 hover:bg-slate-100/50',
      textColor: 'text-slate-950',
      borderColor: 'border-slate-200 hover:border-slate-350',
      glowColor: 'shadow-slate-100',
      icon: '⚙️'
    };
  }
  // Default fallback
  return {
    barBg: 'bg-gradient-to-b from-cyan-500 to-teal-600',
    badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
    cardBg: 'bg-cyan-50/40 hover:bg-cyan-50/70',
    textColor: 'text-cyan-950',
    borderColor: 'border-cyan-200/80 hover:border-cyan-400',
    glowColor: 'shadow-cyan-100',
    icon: '🏢'
  };
};

export default function HierarchyView({
  roles,
  users,
  onUpdateRoles,
  onUpdateUsers,
  branding
}: HierarchyViewProps) {
  // Config States
  const [viewMode, setViewMode] = useState<'roles' | 'employees'>('roles');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [zoomScale, setZoomScale] = useState(0.95);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  // Editor states
  const [isEditing, setIsEditing] = useState(false);
  const [newParentId, setNewParentId] = useState<string>('');
  const [editError, setEditError] = useState<string | null>(null);

  // Handlers for zoom
  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.05, 1.3));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.05, 0.6));
  const handleResetZoom = () => {
    setZoomScale(0.95);
    setCollapsedNodes(new Set());
    setSearchQuery('');
    setSelectedNodeId(null);
    setFocusedNodeId(null);
  };

  // Toggle Collapse
  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes(prev => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  // Lineage Highlighting
  const activeItems = useMemo(() => {
    return viewMode === 'roles' 
      ? roles.map(r => ({ id: r.id, reportsTo: r.reportsTo }))
      : users.map(u => ({ id: u.id, reportsTo: u.reportsTo }));
  }, [viewMode, roles, users]);

  const highlightedLineage = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    const lineage = new Set<string>([hoveredNodeId]);

    // 1. Trace Ancestors Upwards
    let currentId = hoveredNodeId;
    let safeguard = 0;
    while (currentId && safeguard < 100) {
      safeguard++;
      const item = activeItems.find(i => i.id === currentId);
      if (item?.reportsTo) {
        lineage.add(item.reportsTo);
        currentId = item.reportsTo;
      } else {
        break;
      }
    }

    // 2. Trace Descendants Downwards
    const collectDescendants = (id: string) => {
      const children = activeItems.filter(i => i.reportsTo === id);
      children.forEach(c => {
        lineage.add(c.id);
        collectDescendants(c.id);
      });
    };
    collectDescendants(hoveredNodeId);

    return lineage;
  }, [hoveredNodeId, activeItems]);

  // Check Circular Dependencies / Loops in Org Chart
  const wouldCreateCircularDependency = (nodeId: string, potentialParentId: string): boolean => {
    if (!potentialParentId) return false;
    if (nodeId === potentialParentId) return true;

    let currentId = potentialParentId;
    const visited = new Set<string>();
    let safeguard = 0;

    while (currentId && safeguard < 100) {
      safeguard++;
      if (visited.has(currentId)) return true;
      visited.add(currentId);

      if (currentId === nodeId) return true;

      const item = activeItems.find(i => i.id === currentId);
      currentId = item?.reportsTo || '';
    }

    return false;
  };

  // Save reportsTo relationship
  const handleSaveRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNodeId) return;

    if (wouldCreateCircularDependency(selectedNodeId, newParentId)) {
      setEditError("⚠️ Invalid reporting structure! This change would cause a circular reporting loop (e.g., A reports to B, B reports to A). Please choose a different manager.");
      return;
    }

    setEditError(null);

    if (viewMode === 'roles') {
      const updatedRoles = roles.map(r => {
        if (r.id === selectedNodeId) {
          return { ...r, reportsTo: newParentId || undefined };
        }
        return r;
      });
      onUpdateRoles(updatedRoles);
    } else {
      const updatedUsers = users.map(u => {
        if (u.id === selectedNodeId) {
          return { ...u, reportsTo: newParentId || undefined };
        }
        return u;
      });
      onUpdateUsers(updatedUsers);
    }

    setIsEditing(false);
    setSelectedNodeId(null);
  };

  // Recursive Tree structures builder
  const rolesTree = useMemo(() => {
    if (focusedNodeId && viewMode === 'roles') {
      const match = roles.find(r => r.id === focusedNodeId);
      return match ? [match] : [];
    }
    const roleIds = new Set(roles.map(r => r.id));
    // Root nodes are those with no reportsTo, or reporting to a role that doesn't exist
    const roots = roles.filter(r => !r.reportsTo || !roleIds.has(r.reportsTo));
    
    // Sort root nodes (e.g., put MD at the absolute top)
    roots.sort((a, b) => {
      if (a.id === 'role_md') return -1;
      if (b.id === 'role_md') return 1;
      return a.name.localeCompare(b.name);
    });

    return roots;
  }, [roles, focusedNodeId, viewMode]);

  const usersTree = useMemo(() => {
    if (focusedNodeId && viewMode === 'employees') {
      const match = users.find(u => u.id === focusedNodeId);
      return match ? [match] : [];
    }
    const userIds = new Set(users.map(u => u.id));
    const roots = users.filter(u => !u.reportsTo || !userIds.has(u.reportsTo));
    
    // Sort roots (put Harish Rathi/Director or Aashish Sahu/Admin at top)
    roots.sort((a, b) => {
      if (a.id === 'usr_owner_harish') return -1;
      if (b.id === 'usr_owner_harish') return 1;
      return a.name.localeCompare(b.name);
    });

    return roots;
  }, [users, focusedNodeId, viewMode]);

  // Selected detail nodes
  const selectedRole = useMemo(() => {
    if (viewMode !== 'roles' || !selectedNodeId) return null;
    return roles.find(r => r.id === selectedNodeId) || null;
  }, [viewMode, selectedNodeId, roles]);

  const selectedUser = useMemo(() => {
    if (viewMode !== 'employees' || !selectedNodeId) return null;
    return users.find(u => u.id === selectedNodeId) || null;
  }, [viewMode, selectedNodeId, users]);

  const focusedNodeName = useMemo(() => {
    if (!focusedNodeId) return null;
    if (viewMode === 'roles') {
      return roles.find(r => r.id === focusedNodeId)?.name || null;
    } else {
      return users.find(u => u.id === focusedNodeId)?.name || null;
    }
  }, [focusedNodeId, viewMode, roles, users]);

  // Options for parent roles dropdown
  const parentRoleOptions = useMemo(() => {
    if (!selectedNodeId) return [];
    return roles.filter(r => r.id !== selectedNodeId && !wouldCreateCircularDependency(selectedNodeId, r.id));
  }, [selectedNodeId, roles, activeItems]);

  // Options for parent users dropdown
  const parentUserOptions = useMemo(() => {
    if (!selectedNodeId) return [];
    return users.filter(u => u.id !== selectedNodeId && !wouldCreateCircularDependency(selectedNodeId, u.id));
  }, [selectedNodeId, users, activeItems]);

  // Advanced Print Function
  const printHierarchy = () => {
    setExportNotification("In the print window destination, select 'Save as PDF' to generate and download a formal PDF file of the hierarchy!");
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to generate the print layout.");
      return;
    }

    const companyTitle = branding?.companyName || "Rathi Buildmart / MDO / Build Mart";
    const hasImageLogo = branding?.logoType === 'image' && branding?.logoValue;
    const emojiOrTextLogo = branding?.logoType === 'emoji' ? branding?.logoValue : (branding?.companyAbbreviation || 'M');
    
    // Builds a recursive, beautiful HTML representation of reporting structures
    const buildNestedHTML = (items: any[], parentId: string | undefined, level: number): string => {
      const levelChildren = items.filter(item => {
        if (!parentId) {
          const itemIds = new Set(items.map(x => x.id));
          return !item.reportsTo || !itemIds.has(item.reportsTo);
        }
        return item.reportsTo === parentId;
      });

      if (levelChildren.length === 0) return '';

      let html = `<ul style="list-style-type: none; padding-left: ${level === 0 ? '0' : '26px'}; margin: 4px 0; border-left: ${level === 0 ? 'none' : '1.5px dashed #cbd5e1'};">`;
      for (const child of levelChildren) {
        const subtext = viewMode === 'roles' 
          ? `<span style="font-size: 11px; color: #475569; font-weight: 500; font-family: sans-serif; background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">${child.department}</span>`
          : `<span style="font-size: 11px; color: #0284c7; font-weight: 500; font-family: sans-serif; margin-left: 8px;">— ${roles.find(r => r.id === child.roleId)?.name || 'Unassigned'} (${child.department})</span>`;

        html += `
          <li style="margin: 6px 0; position: relative; padding-left: 8px;">
            <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px; font-family: system-ui, -apple-system, sans-serif; padding: 4px 8px; background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 6px; width: fit-content; max-width: 100%;">
              <span style="font-size: 13px; font-weight: 700; color: #1e293b;">• ${child.name}</span>
              ${subtext}
            </div>
            ${buildNestedHTML(items, child.id, level + 1)}
          </li>
        `;
      }
      html += '</ul>';
      return html;
    };

    const getDescendantIds = (parentId: string): Set<string> => {
      const descendants = new Set<string>([parentId]);
      const collect = (id: string) => {
        const children = (viewMode === 'roles' ? roles : users).filter(x => x.reportsTo === id);
        children.forEach(c => {
          descendants.add(c.id);
          collect(c.id);
        });
      };
      collect(parentId);
      return descendants;
    };

    const focusedDescendants = focusedNodeId ? getDescendantIds(focusedNodeId) : null;

    let treeDataHTML = '';
    if (focusedNodeId) {
      const focusedItem = (viewMode === 'roles' ? roles : users).find(x => x.id === focusedNodeId);
      if (focusedItem) {
        const subtext = viewMode === 'roles' 
          ? `<span style="font-size: 11px; color: #475569; font-weight: 500; font-family: sans-serif; background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">${focusedItem.department}</span>`
          : `<span style="font-size: 11px; color: #0284c7; font-weight: 500; font-family: sans-serif; margin-left: 8px;">— ${roles.find(r => r.id === (focusedItem as any).roleId)?.name || 'Unassigned'} (${focusedItem.department})</span>`;

        treeDataHTML = `
          <ul style="list-style-type: none; padding-left: 0; margin: 4px 0;">
            <li style="margin: 6px 0; position: relative; padding-left: 8px;">
              <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px; font-family: system-ui, -apple-system, sans-serif; padding: 6px 12px; background-color: #f0fdf4; border: 1.5px solid #10b981; border-radius: 6px; width: fit-content; max-width: 100%;">
                <span style="font-size: 13px; font-weight: 900; color: #166534;">🎯 FOCUSED SUBTREE ROOT: ${focusedItem.name}</span>
                ${subtext}
              </div>
              ${buildNestedHTML(viewMode === 'roles' ? roles : users, focusedNodeId, 1)}
            </li>
          </ul>
        `;
      }
    } else {
      treeDataHTML = viewMode === 'roles' 
        ? buildNestedHTML(roles, undefined, 0)
        : buildNestedHTML(users, undefined, 0);
    }

    const dateStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const listToRender = (viewMode === 'roles' ? roles : users).filter(item => {
      if (focusedDescendants) {
        return focusedDescendants.has(item.id);
      }
      return true;
    });

    const activeListHTML = listToRender.map((item, index) => {
      const parentName = viewMode === 'roles' 
        ? (roles.find(r => r.id === item.reportsTo)?.name || 'None (Absolute Top)')
        : (users.find(u => u.id === item.reportsTo)?.name || 'None (Absolute Top)');
        
      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-size: 11px; font-family: monospace; color: #64748b; text-align: center;">#${index + 1}</td>
          <td style="padding: 10px; font-weight: bold; font-size: 12px; color: #0f172a;">${item.name}</td>
          <td style="padding: 10px; font-size: 11px; color: #334155;">${item.department}</td>
          <td style="padding: 10px; font-size: 11px; color: #475569;">${viewMode === 'roles' ? (item as any).description || '-' : (item as any).email || '-'}</td>
          <td style="padding: 10px; font-size: 11px; font-weight: 600; color: #10b981;">${parentName}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${companyTitle} - Org Hierarchy Report</title>
          <style>
            @media print {
              body { margin: 1cm; color: #1e293b; background-color: #ffffff; }
              .no-print { display: none !important; }
              .page-break { page-break-before: always; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1e293b;
              margin: 30px auto;
              max-width: 950px;
              padding: 0 15px;
              line-height: 1.4;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px solid #10b981;
              padding-bottom: 15px;
              margin-bottom: 25px;
            }
            .logo-placeholder {
              width: 44px;
              height: 44px;
              background-color: #10b981;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 900;
              font-size: 18px;
            }
            .title-section h1 {
              margin: 0;
              font-size: 20px;
              font-weight: 900;
              letter-spacing: -0.02em;
              color: #0f172a;
              text-transform: uppercase;
            }
            .title-section p {
              margin: 2px 0 0 0;
              font-size: 10px;
              color: #64748b;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .meta-block {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 12px;
              margin-bottom: 25px;
            }
            .meta-item h5 {
              margin: 0;
              font-size: 9px;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .meta-item p {
              margin: 2px 0 0 0;
              font-size: 12px;
              font-weight: 700;
              color: #334155;
            }
            .section-title {
              font-size: 13px;
              font-weight: 800;
              color: #0f172a;
              text-transform: uppercase;
              border-bottom: 1.5px solid #cbd5e1;
              padding-bottom: 4px;
              margin-bottom: 12px;
              letter-spacing: -0.01em;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th {
              background-color: #f1f5f9;
              text-align: left;
              padding: 8px 10px;
              font-size: 9px;
              font-weight: 800;
              text-transform: uppercase;
              color: #475569;
              border-bottom: 2px solid #cbd5e1;
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; text-align: right;">
            <button onclick="window.print()" style="background-color: #10b981; color: white; border: none; padding: 8px 16px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              🖨️ Open Print Options / Save to PDF
            </button>
          </div>

          <div class="header-container">
            <div class="title-section">
              <p>${companyTitle}</p>
              <h1>Corporate Reporting Hierarchy</h1>
            </div>
            ${hasImageLogo ? `<img src="${branding?.logoValue}" style="height: 44px; max-width: 180px; object-fit: contain;" />` : `
              <div class="logo-placeholder">${emojiOrTextLogo}</div>
            `}
          </div>

          <div class="meta-block">
            <div class="meta-item">
              <h5>Date Compiled</h5>
              <p>${dateStr}</p>
            </div>
            <div class="meta-item">
              <h5>View Scope</h5>
              <p>${viewMode === 'roles' ? "Designation Roles Mapping" : "Active Workforce Network"}</p>
            </div>
            <div class="meta-item">
              <h5>Structure Count</h5>
              <p>${viewMode === 'roles' ? `${roles.length} Dynamic Roles` : `${users.length} Active Employees`}</p>
            </div>
          </div>

          <div class="section-title">1. Organization Visualization Chart</div>
          <div style="background-color: #ffffff; padding: 10px 0; margin-bottom: 30px;">
            ${treeDataHTML}
          </div>

          <div class="page-break"></div>

          <div class="section-title" style="margin-top: 20px;">2. Tabular Reporting Ledger</div>
          <table>
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">Idx</th>
                <th>Name / Description</th>
                <th>Department</th>
                <th>${viewMode === 'roles' ? "Core Responsibilities" : "Official Email"}</th>
                <th>Supervisor / Reports To</th>
              </tr>
            </thead>
            <tbody>
              ${activeListHTML}
            </tbody>
          </table>

          <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between;">
            <span>Generated dynamically by AI Workspace Directory Engine</span>
            <span>Rathi Group Corporate Registry</span>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 400);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // CSV Export Method
  const downloadCSV = () => {
    let csvContent = "";
    if (viewMode === 'roles') {
      const headers = ["Designation ID", "Designation Name", "Department", "Reports To ID", "Reports To Designation", "Description"];
      const rows = roles.map(role => {
        const reportsToRole = roles.find(r => r.id === role.reportsTo);
        return [
          `"${role.id}"`,
          `"${role.name.replace(/"/g, '""')}"`,
          `"${role.department.replace(/"/g, '""')}"`,
          `"${role.reportsTo || ''}"`,
          `"${reportsToRole ? reportsToRole.name.replace(/"/g, '""') : 'N/A'}"`,
          `"${(role.description || '').replace(/"/g, '""')}"`
        ];
      });
      csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    } else {
      const headers = ["Employee ID", "Full Name", "Email", "Department", "Focus Entity", "Primary Role Name", "Status", "Manager ID", "Manager Name"];
      const rows = users.map(user => {
        const manager = users.find(u => u.id === user.reportsTo);
        const roleObj = roles.find(r => r.id === user.roleId);
        return [
          `"${user.id}"`,
          `"${user.name.replace(/"/g, '""')}"`,
          `"${user.email.replace(/"/g, '""')}"`,
          `"${(user.department || '').replace(/"/g, '""')}"`,
          `"${(user.focusEntity || '').replace(/"/g, '""')}"`,
          `"${roleObj ? roleObj.name.replace(/"/g, '""') : 'Unassigned'}"`,
          `"${user.status}"`,
          `"${user.reportsTo || ''}"`,
          `"${manager ? manager.name.replace(/"/g, '""') : 'N/A'}"`
        ];
      });
      csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Corporate_Hierarchy_${viewMode}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Export Method
  const downloadJSON = () => {
    const payload = {
      exportDate: new Date().toISOString(),
      viewMode,
      company: branding?.companyName || "Rathi Buildmart",
      data: viewMode === 'roles' ? roles : users
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload, null, 2))}`;
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", `Corporate_Hierarchy_${viewMode}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // RENDER RECURSIVE TREE COMPONENT
  const renderRoleNode = (role: Role) => {
    const directChildren = roles.filter(r => r.reportsTo === role.id);
    const hasChildren = directChildren.length > 0;
    const isCollapsed = collapsedNodes.has(role.id);
    
    // Search highlight status
    const matchesSearch = searchQuery 
      ? role.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        role.department.toLowerCase().includes(searchQuery.toLowerCase()) || 
        role.description.toLowerCase().includes(searchQuery.toLowerCase())
      : false;

    const isHovered = hoveredNodeId === role.id;
    const isInLineage = highlightedLineage.has(role.id);
    const isSelected = selectedNodeId === role.id;

    // Get count of employees holding this role
    const holdingEmployeesCount = users.filter(u => u.roleId === role.id).length;

    // Department Specific custom style
    const deptStyle = getDeptStyle(role.department);

    return (
      <div className="flex flex-col items-center select-none" key={role.id}>
        {/* Node Box */}
        <div 
          onClick={() => {
            if (selectedNodeId === role.id) {
              setSelectedNodeId(null);
              setNewParentId('');
            } else {
              setSelectedNodeId(role.id);
              setNewParentId(role.reportsTo || '');
            }
            setEditError(null);
            setIsEditing(false);
          }}
          onMouseEnter={() => setHoveredNodeId(role.id)}
          onMouseLeave={() => setHoveredNodeId(null)}
          className={`relative flex flex-col items-center justify-between p-3.5 pl-6 rounded-xl border w-56 cursor-pointer text-left transition-all duration-300 overflow-hidden ${
            isSelected 
              ? 'bg-slate-900 text-white border-slate-950 shadow-xl scale-[1.03] z-20 ring-4 ring-emerald-400/25'
              : matchesSearch
              ? 'bg-amber-50 text-slate-900 border-amber-400 shadow-md ring-4 ring-amber-200 z-10'
              : isInLineage
              ? `${deptStyle.cardBg} ${deptStyle.borderColor} text-slate-900 shadow-sm border-l-2`
              : `${deptStyle.cardBg} ${deptStyle.borderColor} text-slate-800 hover:shadow-md hover:scale-[1.01]`
          }`}
        >
          {/* Vertical Color stripe on the left edge */}
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${deptStyle.barBg}`} />

          {/* Tagline Badge */}
          <div className="w-full flex items-center justify-between gap-1 mb-2">
            <span className={`text-[8px] uppercase font-mono font-black tracking-wider px-1.5 py-0.5 rounded border flex items-center gap-1 ${
              isSelected 
                ? 'bg-white/20 text-white border-white/20'
                : deptStyle.badgeBg
            }`}>
              <span>{deptStyle.icon}</span>
              <span>{role.department}</span>
            </span>
            {holdingEmployeesCount > 0 && (
              <span className={`text-[8.5px] font-semibold flex items-center gap-0.5 font-mono ${
                isSelected ? 'text-emerald-300' : 'text-slate-500'
              }`}>
                👥 {holdingEmployeesCount}
              </span>
            )}
          </div>

          {/* Role Designation Name */}
          <h4 className={`text-[11px] font-black leading-tight font-display tracking-tight w-full break-words ${isSelected ? 'text-white' : 'text-slate-900'}`}>
            {role.name}
          </h4>

          {/* Quick Sub-items summary */}
          <div className={`w-full border-t mt-2.5 pt-2 flex items-center justify-between text-[9px] font-medium font-sans ${isSelected ? 'border-white/10' : 'border-slate-100'}`}>
            <span className={isSelected ? 'text-slate-300' : 'text-slate-400'}>
              🛠️ {role.skillRequirements.length} Skill{role.skillRequirements.length !== 1 ? 's' : ''}
            </span>
            <span className={`flex items-center gap-0.5 font-bold ${
              isSelected ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              <Sparkles className="w-3 h-3" /> SOP Active
            </span>
          </div>

          {/* Hover highlight halo line */}
          {isInLineage && !isSelected && (
            <div className="absolute inset-0 border-2 border-emerald-400 rounded-xl pointer-events-none animate-pulse"></div>
          )}

          {/* Search Glow effect */}
          {matchesSearch && (
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 text-[8px] text-white font-black items-center justify-center">✓</span>
            </span>
          )}

          {/* Interactive Collapse toggle button */}
          {hasChildren && (
            <button 
              onClick={(e) => toggleCollapse(role.id, e)}
              className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border flex items-center justify-center shadow-xs transition hover:scale-110 z-20 cursor-pointer ${
                isSelected
                  ? 'bg-white text-emerald-700 border-slate-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
              }`}
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-emerald-600" />
              )}
            </button>
          )}
        </div>

        {/* Child Sub-trees */}
        {hasChildren && !isCollapsed && (
          <div className="flex flex-col items-center mt-6">
            {/* Parent branch line down */}
            <div className={`w-0.5 h-5 transition-colors duration-300 ${
              isHovered || (isInLineage && hoveredNodeId) ? 'bg-emerald-500' : 'bg-slate-300'
            }`}></div>

            {/* Row of Child nodes */}
            <div className="flex gap-6 relative">
              {directChildren.map((child, idx) => {
                const childIsInLineage = highlightedLineage.has(child.id);
                const isHoverLineActive = (isHovered || (isInLineage && hoveredNodeId)) && childIsInLineage;

                return (
                  <div key={child.id} className="flex flex-col items-center relative">
                    {/* Horizontal Connector Line bar */}
                    {directChildren.length > 1 && (
                      <div className="absolute top-0 left-0 right-0 flex w-full">
                        <div className={`w-1/2 border-t transition-colors duration-300 ${
                          idx === 0 ? 'border-transparent' : isHoverLineActive ? 'border-emerald-500 border-t-2' : 'border-slate-300'
                        }`}></div>
                        <div className={`w-1/2 border-t transition-colors duration-300 ${
                          idx === directChildren.length - 1 ? 'border-transparent' : isHoverLineActive ? 'border-emerald-500 border-t-2' : 'border-slate-300'
                        }`}></div>
                      </div>
                    )}

                    {/* Child vertical line up to meet horizontal line */}
                    <div className={`w-0.5 h-5 transition-colors duration-300 mx-auto ${
                      isHoverLineActive ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}></div>

                    {renderRoleNode(child)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // RENDER WORKFORCE / EMPLOYEE TREE NODE
  const renderUserNode = (user: User) => {
    const directChildren = users.filter(u => u.reportsTo === user.id);
    const hasChildren = directChildren.length > 0;
    const isCollapsed = collapsedNodes.has(user.id);

    // Search matches
    const matchesSearch = searchQuery
      ? user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (roles.find(r => r.id === user.roleId)?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      : false;

    const isHovered = hoveredNodeId === user.id;
    const isInLineage = highlightedLineage.has(user.id);
    const isSelected = selectedNodeId === user.id;

    const userRoleObj = roles.find(r => r.id === user.roleId);

    // Get department styles
    const deptStyle = getDeptStyle(user.department);

    return (
      <div className="flex flex-col items-center select-none" key={user.id}>
        {/* User Card */}
        <div 
          onClick={() => {
            if (selectedNodeId === user.id) {
              setSelectedNodeId(null);
              setNewParentId('');
            } else {
              setSelectedNodeId(user.id);
              setNewParentId(user.reportsTo || '');
            }
            setEditError(null);
            setIsEditing(false);
          }}
          onMouseEnter={() => setHoveredNodeId(user.id)}
          onMouseLeave={() => setHoveredNodeId(null)}
          className={`relative flex flex-col p-3.5 pl-6 rounded-xl border w-56 cursor-pointer text-left transition-all duration-300 overflow-hidden ${
            isSelected 
              ? 'bg-slate-900 text-white border-slate-950 shadow-xl scale-[1.03] z-20 ring-4 ring-emerald-400/25'
              : matchesSearch
              ? 'bg-amber-50 text-slate-900 border-amber-400 shadow-md ring-4 ring-amber-200 z-10'
              : isInLineage
              ? `${deptStyle.cardBg} ${deptStyle.borderColor} text-slate-900 shadow-sm border-l-2`
              : `${deptStyle.cardBg} ${deptStyle.borderColor} text-slate-800 hover:shadow-md hover:scale-[1.01]`
          }`}
        >
          {/* Vertical Color stripe on the left edge */}
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${deptStyle.barBg}`} />

          {/* Avatar and Info Header */}
          <div className="flex items-center gap-2.5 mb-2.5">
            <Avatar 
              src={user.avatarUrl} 
              name={user.name} 
              className="w-9 h-9 border-2 border-white shadow-3xs" 
            />
            <div className="min-w-0 flex-1">
              <h4 className={`text-[11.5px] font-black leading-tight truncate font-display tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                {user.name}
              </h4>
              <p className={`text-[8.5px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                {user.email}
              </p>
            </div>
          </div>

          {/* Department and Profile description */}
          <div className={`space-y-1.5 pt-1.5 border-t w-full ${isSelected ? 'border-white/10' : 'border-slate-100/50'}`}>
            <div className="flex items-center justify-between gap-1 w-full">
              <span className={`text-[8.5px] font-black tracking-tight truncate ${isSelected ? 'text-slate-200' : 'text-slate-700'}`}>
                💼 {userRoleObj?.name || 'Assigned Profile'}
              </span>
            </div>
            
            <div className="flex items-center gap-1 justify-between w-full">
              <span className={`text-[7.5px] font-mono uppercase px-1.5 py-0.5 rounded border tracking-wide truncate flex items-center gap-1 ${
                isSelected 
                  ? 'bg-white/20 text-white border-white/20'
                  : deptStyle.badgeBg
              }`}>
                <span>{deptStyle.icon}</span>
                <span>{user.department}</span>
              </span>
              <span className={`text-[8px] font-semibold flex items-center gap-0.5 truncate ${
                isSelected ? 'text-emerald-300' : 'text-slate-500'
              }`}>
                📍 {user.focusEntity.replace('Rathi Buildmart ', '')}
              </span>
            </div>
          </div>

          {/* Hover highlight glow */}
          {isInLineage && !isSelected && (
            <div className="absolute inset-0 border-2 border-emerald-400 rounded-xl pointer-events-none animate-pulse"></div>
          )}

          {/* Search Glow */}
          {matchesSearch && (
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 text-[8px] text-white font-black items-center justify-center">✓</span>
            </span>
          )}

          {/* Collapse Indicator */}
          {hasChildren && (
            <button 
              onClick={(e) => toggleCollapse(user.id, e)}
              className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border flex items-center justify-center shadow-xs transition hover:scale-110 z-20 cursor-pointer ${
                isSelected
                  ? 'bg-white text-emerald-700 border-slate-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
              }`}
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-emerald-600" />
              )}
            </button>
          )}
        </div>

        {/* Recursive Children Rows */}
        {hasChildren && !isCollapsed && (
          <div className="flex flex-col items-center mt-6">
            {/* vertical connector */}
            <div className={`w-0.5 h-5 transition-colors duration-300 ${
              isHovered || (isInLineage && hoveredNodeId) ? 'bg-emerald-500' : 'bg-slate-300'
            }`}></div>

            {/* Horizontal connection line */}
            <div className="flex gap-6 relative">
              {directChildren.map((child, idx) => {
                const childIsInLineage = highlightedLineage.has(child.id);
                const isHoverLineActive = (isHovered || (isInLineage && hoveredNodeId)) && childIsInLineage;

                return (
                  <div key={child.id} className="flex flex-col items-center relative">
                    {/* Horizontal Connector Line bar */}
                    {directChildren.length > 1 && (
                      <div className="absolute top-0 left-0 right-0 flex w-full">
                        <div className={`w-1/2 border-t transition-colors duration-300 ${
                          idx === 0 ? 'border-transparent' : isHoverLineActive ? 'border-emerald-500 border-t-2' : 'border-slate-300'
                        }`}></div>
                        <div className={`w-1/2 border-t transition-colors duration-300 ${
                          idx === directChildren.length - 1 ? 'border-transparent' : isHoverLineActive ? 'border-emerald-500 border-t-2' : 'border-slate-300'
                        }`}></div>
                      </div>
                    )}

                    {/* vertical down line to card */}
                    <div className={`w-0.5 h-5 transition-colors duration-300 mx-auto ${
                      isHoverLineActive ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}></div>

                    {renderUserNode(child)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="flex flex-col lg:flex-row gap-6 relative min-h-[500px]">
      
      {/* LEFT TREE CANVAS CONTAINER */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col relative min-h-[600px]">
        
        {/* HEADER PANEL: Switcher and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5 relative z-30">
          <div>
            <h3 className="font-display text-lg font-black flex items-center gap-2">
              <GitFork className="w-5 h-5 text-emerald-500 transform rotate-180 animate-pulse-slow" />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 bg-clip-text text-transparent">
                ORGANIZATION HIERARCHY MAP
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Visualize reporting workflows, track career pathways, and edit supervisor associations dynamically.
            </p>
            {/* Colorful Directory Metrics */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-750 border border-emerald-150/60 shadow-3xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>{roles.length} Designation Roles</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-50 text-indigo-750 border border-indigo-150/60 shadow-3xs">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>{users.length} Active Employees</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-50 text-rose-700 border border-rose-150/60 shadow-3xs">
                👑 Rathi Group Registry
              </span>
            </div>
          </div>

          {/* VIEW MODE SWAPPER BUTTONS & EXPORT ACTIONS */}
          <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => {
                  setViewMode('roles');
                  setSelectedNodeId(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10.5px] font-black transition cursor-pointer select-none ${
                  viewMode === 'roles'
                    ? 'bg-white text-slate-850 shadow-3xs text-slate-900 border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                Designation Roles
              </button>
              <button
                onClick={() => {
                  setViewMode('employees');
                  setSelectedNodeId(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10.5px] font-black transition cursor-pointer select-none ${
                  viewMode === 'employees'
                    ? 'bg-white text-slate-850 shadow-3xs text-slate-900 border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                Workforce employees
              </button>
            </div>

            {/* PRINT & DOWNLOAD DROPDOWN BUTTON */}
            <div className="relative z-40">
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-55 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold transition cursor-pointer shadow-3xs"
              >
                <Download className="w-3.5 h-3.5 animate-bounce-slow" />
                <span>Export & Print</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-75" />
              </button>

              {showExportDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setShowExportDropdown(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-30 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                    <div className="px-3 py-1 border-b border-slate-100 mb-1">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono">Control Directory</span>
                    </div>
                    
                    <button
                      onClick={() => {
                        printHierarchy();
                        setShowExportDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition text-left cursor-pointer font-bold"
                    >
                      <Printer className="w-4 h-4 text-emerald-600" />
                      <span>📄 Print & Save as PDF</span>
                    </button>

                    <button
                      onClick={() => {
                        downloadCSV();
                        setShowExportDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition text-left cursor-pointer font-bold"
                    >
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>📊 Export to CSV (Excel)</span>
                    </button>

                    <button
                      onClick={() => {
                        downloadJSON();
                        setShowExportDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition text-left cursor-pointer font-bold"
                    >
                      <RefreshCw className="w-4 h-4 text-teal-600" />
                      <span>📁 Download Schema JSON</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* CONTROL STRIP: Zooming, searching and statistics */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-200/60 mb-6 relative z-10">
          {/* Zoom controls */}
          <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-between sm:justify-start">
            <span className="text-[10px] uppercase font-bold font-mono text-slate-400">Scale Canvas</span>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold w-12 text-center bg-white border border-slate-200 py-1 rounded-md text-slate-700 select-none">
                {Math.round(zoomScale * 100)}%
              </span>
              <button 
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={handleResetZoom}
                title="Reset Map State"
                className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-rose-600 text-slate-500 transition cursor-pointer ml-1.5 flex items-center gap-1 text-[10px] font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          {/* Subtree Focus Dropdown Selector */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-start">
            <span className="text-[10px] uppercase font-bold font-mono text-slate-400 whitespace-nowrap">Focused Tree:</span>
            <select
              value={focusedNodeId || ''}
              onChange={(e) => {
                const val = e.target.value;
                setFocusedNodeId(val ? val : null);
                if (val) {
                  setSelectedNodeId(val);
                }
              }}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-500 font-sans font-bold text-slate-700 shadow-3xs max-w-[210px] cursor-pointer"
            >
              <option value="">-- Complete Org Hierarchy --</option>
              {viewMode === 'roles' ? (
                [...roles]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))
              ) : (
                [...users]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))
              )}
            </select>
          </div>

          {/* Live Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={viewMode === 'roles' ? "Search dynamic designations..." : "Search workforce names..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:border-emerald-500 transition shadow-3xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {focusedNodeId && focusedNodeName && (
          <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl text-[9px] font-bold font-mono tracking-wider">🎯 FOCUS ACTIVE</span>
              <div>
                <p className="text-xs font-black text-slate-900">
                  Isolating reporting structure for: <span className="text-indigo-700 font-extrabold">{focusedNodeName}</span>
                </p>
                <p className="text-[10px] text-slate-500 font-medium font-sans">
                  Showing only direct and indirect subordinate team members in a single isolated subtree view.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  printHierarchy();
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <Printer className="w-3.5 h-3.5" />
                Print & Save Subtree PDF
              </button>
              <button
                type="button"
                onClick={() => setFocusedNodeId(null)}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-rose-600 border border-rose-200 rounded-xl text-[10px] font-extrabold cursor-pointer transition flex items-center gap-1"
              >
                Clear Focus
              </button>
            </div>
          </div>
        )}

        {/* CORE INTERACTIVE TREE CANVAS AREA */}
        <div className="flex-1 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20 p-8 overflow-auto min-h-[480px] max-h-[800px] scrollbar-thin">
          <div 
            className="transition-transform duration-200 transform origin-top pt-4 mx-auto w-fit min-w-max flex flex-col items-center"
            style={{ transform: `scale(${zoomScale})` }}
          >
            {viewMode === 'roles' ? (
              <div className="flex gap-16 items-start justify-center">
                {rolesTree.map(role => renderRoleNode(role))}
              </div>
            ) : (
              <div className="flex gap-16 items-start justify-center">
                {usersTree.map(user => renderUserNode(user))}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER CANVAS CAPTIONS */}
        <div className="mt-4 flex flex-wrap gap-4 items-center justify-between text-[10px] text-slate-400 font-sans font-medium">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            Tip: Hover over any card to trace its reporting lineage. Click any card to edit.
          </span>
          <div className="flex gap-3 items-center">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-white border border-slate-200 rounded-xs"></span> Standard</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-50 border border-emerald-400 rounded-xs"></span> Active Lineage</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-50 border border-amber-400 rounded-xs"></span> Search Match</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE DETAILS AND EDITOR PANEL */}
      <div className="w-full lg:w-80 shrink-0 space-y-4">
        
        {/* CARD DETAIL PREVIEW */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-left">
          <h4 className="font-display text-sm font-black text-slate-900 border-b pb-3 mb-4 flex items-center gap-2 uppercase tracking-tight">
            <span>ℹ️</span> Details Inspector
          </h4>

          {viewMode === 'roles' && selectedRole ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[9px] uppercase font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  {selectedRole.department}
                </span>
                <h3 className="font-display text-base font-extrabold text-slate-900 mt-2 leading-tight">
                  {selectedRole.name}
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 italic font-sans">
                  ID: {selectedRole.id}
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border font-sans space-y-2">
                <h5 className="font-bold text-[10px] uppercase font-mono text-slate-400">Description / Focus</h5>
                <p className="text-slate-650 leading-relaxed text-[11px]">
                  {selectedRole.description || "No description provided."}
                </p>
              </div>

              <div className="space-y-2 font-sans">
                <h5 className="font-bold text-[10px] uppercase font-mono text-slate-400">Reports To (Supervisor)</h5>
                {selectedRole.reportsTo ? (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-700 truncate">
                      {roles.find(r => r.id === selectedRole.reportsTo)?.name || selectedRole.reportsTo}
                    </span>
                  </div>
                ) : (
                  <p className="text-slate-405 text-slate-400 italic">Is at the apex (Does not report to any other role).</p>
                )}
              </div>

              <div className="space-y-2 font-sans">
                <h5 className="font-bold text-[10px] uppercase font-mono text-slate-400">Required Skills ({selectedRole.skillRequirements.length})</h5>
                <div className="flex flex-wrap gap-1">
                  {selectedRole.skillRequirements.map((skill, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                      {skill}
                    </span>
                  ))}
                  {selectedRole.skillRequirements.length === 0 && (
                    <span className="text-slate-400 italic">No skill sets defined.</span>
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              {!isEditing && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setFocusedNodeId(selectedRole.id)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-[11px] shadow-3xs"
                  >
                    <GitFork className="w-3.5 h-3.5" /> Isolate & Focus Subtree
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-[11px]"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Modify Reporting Officer
                  </button>
                </div>
              )}
            </div>
          ) : viewMode === 'employees' && selectedUser ? (
            <div className="space-y-4 text-xs font-sans">
              <div className="flex items-center gap-3">
                <Avatar 
                  src={selectedUser.avatarUrl} 
                  name={selectedUser.name} 
                  className="w-12 h-12 border-2 border-emerald-50" 
                />
                <div>
                  <h3 className="font-display text-sm font-extrabold text-slate-950">
                    {selectedUser.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 truncate">
                    {selectedUser.email}
                  </p>
                  <span className="text-[8.5px] uppercase font-mono font-black text-cyan-700 bg-cyan-50 border border-cyan-100 px-1.5 py-0.2 rounded mt-1.5 inline-block">
                    {selectedUser.department}
                  </span>
                </div>
              </div>

              <div className="space-y-2 border-t pt-3">
                <h5 className="font-bold text-[10px] uppercase font-mono text-slate-400">Corporate Role Designation</h5>
                <div className="p-2.5 bg-slate-50 rounded-lg border flex items-center gap-2">
                  <Award className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-700">
                    {roles.find(r => r.id === selectedUser.roleId)?.name || 'Standard Trainee'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-[10px] uppercase font-mono text-slate-400">Reports To (Supervisor)</h5>
                {selectedUser.reportsTo ? (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-700 truncate">
                      {users.find(u => u.id === selectedUser.reportsTo)?.name || selectedUser.reportsTo}
                    </span>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No assigned supervisor (Apex Director status).</p>
                )}
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-[10px] uppercase font-mono text-slate-400">Office Branch</h5>
                <div className="flex items-center gap-1.5 text-slate-650 font-medium">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{selectedUser.focusEntity}</span>
                </div>
              </div>

              {/* ACTIONS */}
              {!isEditing && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setFocusedNodeId(selectedUser.id)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-[11px] shadow-3xs"
                  >
                    <GitFork className="w-3.5 h-3.5" /> Isolate & Focus Subtree
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-[11px]"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Modify Reporting Officer
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 space-y-3 font-sans text-slate-400">
              <GitFork className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <p className="text-xs">No active node selected.</p>
              <p className="text-[10px] text-slate-405 text-slate-400 leading-relaxed max-w-xs mx-auto">
                Click on any node/profile in the chart to inspect its department, responsibilities, and to adjust reporting relationships.
              </p>
            </div>
          )}
        </div>

        {/* INTERACTIVE RELATIONSHIP EDITOR */}
        {isEditing && selectedNodeId && (
          <div className="bg-white rounded-3xl border border-amber-300 p-6 shadow-sm text-left ring-2 ring-amber-100">
            <h4 className="font-display text-sm font-black text-amber-850 flex items-center gap-2 uppercase tracking-tight text-amber-800">
              <Edit2 className="w-4 h-4" /> Reporting Editor
            </h4>
            <p className="text-[10px] text-slate-500 mt-1 font-sans leading-relaxed">
              Alter reporting lines for <span className="font-black text-slate-800">{viewMode === 'roles' ? selectedRole?.name : selectedUser?.name}</span>.
            </p>

            <form onSubmit={handleSaveRelationship} className="space-y-4 mt-4 font-sans text-xs">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono mb-1">
                  Select Supervisor / Reports To Parent:
                </label>
                <select
                  value={newParentId}
                  onChange={(e) => {
                    setNewParentId(e.target.value);
                    setEditError(null);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:border-amber-500 outline-none cursor-pointer"
                >
                  <option value="">[None - Is Apex Root / Director]</option>
                  
                  {viewMode === 'roles' 
                    ? parentRoleOptions.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.department})</option>
                      ))
                    : parentUserOptions.map(u => (
                        <option key={u.id} value={u.id}>{u.name} - {roles.find(ro => ro.id === u.roleId)?.name || 'Trainee'}</option>
                      ))
                  }
                </select>
              </div>

              {editError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-lg text-[10px] leading-relaxed flex items-start gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-650 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-1.5 rounded-lg transition cursor-pointer text-center text-[11px]"
                >
                  Save Map
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditError(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-lg transition cursor-pointer text-[11px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* EXPORT NOTIFICATION TOAST */}
      {exportNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 text-white px-4 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="text-base">💡</div>
          <div className="flex-1 text-xs font-sans leading-relaxed text-left">
            <p className="font-extrabold text-[11px] text-emerald-400 uppercase tracking-wider mb-0.5">Print / PDF Export</p>
            <p className="text-slate-300">{exportNotification}</p>
          </div>
          <button 
            onClick={() => setExportNotification(null)}
            className="text-slate-400 hover:text-white transition cursor-pointer text-xs font-bold shrink-0 ml-1.5"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
}
