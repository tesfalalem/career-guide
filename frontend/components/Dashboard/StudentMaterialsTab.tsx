import React, { useState, useEffect } from 'react';
import {
  FileText, Link2, Video, BookOpen, StickyNote,
  Download, ExternalLink, Loader2, FolderOpen,
  ChevronDown, ChevronRight, User
} from 'lucide-react';

const API = 'http://localhost/careerguide/backend/api';
const SERVE_BASE = 'http://localhost/careerguide/backend';

interface Material {
  id: number;
  title: string;
  description: string;
  resource_type: string;
  external_url?: string;
  file_path?: string;
  file_url?: string;
  module_name?: string;
  lesson_name?: string;
  notes?: string;
  teacher_name: string;
  created_at: string;
}

interface Props {
  courseId: string;
}

const TYPE_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  document: { icon: <FileText size={18} />, label: 'Document', color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30' },
  video:    { icon: <Video size={18} />,    label: 'Video',    color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-900/30' },
  link:     { icon: <Link2 size={18} />,    label: 'Link',     color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30' },
  note:     { icon: <StickyNote size={18}/>, label: 'Note',    color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30' },
  article:  { icon: <BookOpen size={18} />, label: 'Article',  color: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-900/30' },
  tutorial: { icon: <BookOpen size={18} />, label: 'Tutorial', color: 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30' },
};

const resolveFileUrl = (m: Material): string | null => {
  if (m.file_url) return m.file_url;
  if (m.file_path) return `${SERVE_BASE}/api/uploads/serve?file=${encodeURIComponent(m.file_path.split('/').pop() || '')}&type=resource`;
  if (m.external_url) return m.external_url;
  return null;
};

const StudentMaterialsTab: React.FC<Props> = ({ courseId }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch(`${API}/courses/${courseId}/teacher-materials`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setMaterials(list);
        // Auto-expand all groups
        const groups = new Set(list.map((m: Material) => m.module_name || '__general__'));
        setExpandedGroups(groups as Set<string>);
      })
      .catch(() => setMaterials([]))
      .finally(() => setLoading(false));
  }, [courseId]);

  const toggleGroup = (key: string) => {
    const next = new Set(expandedGroups);
    if (next.has(key)) next.delete(key); else next.add(key);
    setExpandedGroups(next);
  };

  const toggleNote = (id: number) => {
    const next = new Set(expandedNotes);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedNotes(next);
  };

  const grouped = materials.reduce<Record<string, Material[]>>((acc, m) => {
    const key = m.module_name || '__general__';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-careermap-teal" size={32} />
    </div>
  );

  if (materials.length === 0) return (
    <div className="text-center py-20">
      <FolderOpen size={56} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
      <p className="font-bold text-slate-500 text-lg">No teacher materials yet</p>
      <p className="text-slate-400 text-sm mt-1">
        Your teacher hasn't uploaded supplementary materials for this course yet.
      </p>
    </div>
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="w-10 h-10 bg-careermap-teal/10 rounded-xl flex items-center justify-center">
          <User size={20} className="text-careermap-teal" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">Teacher Materials</h3>
          <p className="text-xs text-slate-500">
            {materials.length} supplementary resource{materials.length !== 1 ? 's' : ''} from your teacher
          </p>
        </div>
      </div>

      {/* Grouped materials */}
      {Object.entries(grouped).map(([groupKey, items]) => {
        const label = groupKey === '__general__' ? 'General Materials' : groupKey;
        const isExpanded = expandedGroups.has(groupKey);

        return (
          <div key={groupKey} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {/* Group header */}
            <button
              onClick={() => toggleGroup(groupKey)}
              className="w-full flex items-center gap-3 px-5 py-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isExpanded
                ? <ChevronDown size={16} className="text-slate-400" />
                : <ChevronRight size={16} className="text-slate-400" />}
              <FolderOpen size={16} className="text-careermap-teal" />
              <span className="font-bold text-sm text-slate-700 dark:text-slate-300 flex-1 text-left">{label}</span>
              <span className="text-xs text-slate-400 font-semibold">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
            </button>

            {isExpanded && (
              <div className="p-4 space-y-3">
                {items.map(m => {
                  const meta = TYPE_META[m.resource_type] || TYPE_META['document'];
                  const url = resolveFileUrl(m);
                  const isNoteExpanded = expandedNotes.has(m.id);

                  return (
                    <div
                      key={m.id}
                      className={`border rounded-xl overflow-hidden transition-all ${meta.color}`}
                    >
                      <div className="flex items-start gap-4 p-4">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                          {meta.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-sm text-slate-800 dark:text-white">{m.title}</p>
                              {m.lesson_name && (
                                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-1 inline-block">
                                  📖 {m.lesson_name}
                                </span>
                              )}
                              {m.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{m.description}</p>
                              )}
                              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                <User size={10} /> {m.teacher_name}
                              </p>
                            </div>

                            {/* Action button */}
                            <div className="shrink-0">
                              {m.resource_type === 'note' ? (
                                <button
                                  onClick={() => toggleNote(m.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-all"
                                >
                                  {isNoteExpanded ? 'Collapse' : 'Read Note'}
                                </button>
                              ) : url ? (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-careermap-navy text-white rounded-lg text-xs font-bold hover:bg-[#023058] transition-all"
                                  onClick={async () => {
                                    // Track download
                                    await fetch(`${API}/resources/${m.id}/download`, { method: 'POST' }).catch(() => {});
                                  }}
                                >
                                  {m.resource_type === 'link' || m.external_url
                                    ? <><ExternalLink size={12} /> Open</>
                                    : <><Download size={12} /> Download</>}
                                </a>
                              ) : null}
                            </div>
                          </div>

                          {/* Expanded note content */}
                          {m.resource_type === 'note' && isNoteExpanded && m.notes && (
                            <div
                              className="mt-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-amber-100 dark:border-amber-900/30 text-sm text-slate-700 dark:text-slate-300 rich-content"
                              dangerouslySetInnerHTML={{ __html: m.notes }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StudentMaterialsTab;
