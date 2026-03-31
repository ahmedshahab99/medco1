'use client'
import React, { useState } from 'react';
import { 
  Tag, Users, Filter, Plus, Trash2, Edit2, 
  Search, Save, X, ChevronDown, MoreVertical, 
  Activity, Calendar, DollarSign, UserCheck 
} from 'lucide-react';

// --- MOCK DATA (Arabic) ---
const INITIAL_TAGS = [
  { id: 1, name: 'VIP', color: 'bg-purple-100 text-purple-700 border-purple-200', count: 12 },
  { id: 2, name: 'مريض مزمن', color: 'bg-red-100 text-red-700 border-red-200', count: 45 },
  { id: 3, name: 'متابعة مطلوبة', color: 'bg-amber-100 text-amber-700 border-amber-200', count: 8 },
  { id: 4, name: 'جديد', color: 'bg-blue-100 text-blue-700 border-blue-200', count: 120 },
];

const INITIAL_SEGMENTS = [
  { 
    id: 101, 
    name: 'مرضى السكري غير المتابعين', 
    description: 'مرضى السكري الذين لم يأتوا منذ 3 أشهر',
    count: 18,
    rules: [
      { id: 1, field: 'tag', operator: 'equals', value: 'مريض مزمن', logic: 'AND' },
      { id: 2, field: 'last_visit', operator: 'older_than', value: '90', logic: 'AND' }
    ]
  },
  { 
    id: 102, 
    name: 'مرضى الأسنان النشطين', 
    description: 'زيارات أكثر من 3 في آخر 6 أشهر',
    count: 54,
    rules: [
      { id: 1, field: 'visit_count', operator: 'greater_than', value: '3', logic: 'AND' },
      { id: 2, field: 'last_visit', operator: 'newer_than', value: '180', logic: 'AND' }
    ]
  }
];

// --- COMPONENTS ---

// 1. Tag Modal (Create/Edit)
const TagModal = ({ isOpen, onClose, onSave, initialData }) => {
  if (!isOpen) return null;
  
  const [name, setName] = useState(initialData?.name || '');
  const [color, setColor] = useState(initialData?.color || 'bg-blue-100 text-blue-700 border-blue-200');

  const colors = [
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-red-100 text-red-700 border-red-200',
    'bg-green-100 text-green-700 border-green-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-gray-100 text-gray-700 border-gray-200',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">{initialData ? 'تعديل الوسم' : 'إنشاء وسم جديد'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم الوسم</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="مثال: مريض سكري"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">لون الوسم</label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 ${c} ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : 'border-transparent'}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">إلغاء</button>
          <button 
            onClick={() => onSave({ id: initialData?.id, name, color })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Segment Builder (Complex Logic)
const SegmentBuilder = ({ rules, onChange, onClose }) => {
  const fields = [
    { id: 'tag', label: 'الوسم', type: 'select', options: ['VIP', 'مريض مزمن', 'جديد'] },
    { id: 'last_visit', label: 'آخر زيارة', type: 'days', options: [] },
    { id: 'visit_count', label: 'عدد الزيارات', type: 'number', options: [] },
    { id: 'age', label: 'العمر', type: 'number', options: [] },
  ];

  const operators = [
    { id: 'equals', label: 'يساوي' },
    { id: 'contains', label: 'يحتوي على' },
    { id: 'older_than', label: 'أقدم من' },
    { id: 'newer_than', label: 'أحدث من' },
    { id: 'greater_than', label: 'أكبر من' },
    { id: 'less_than', label: 'أقل من' },
  ];

  const updateRule = (index, field, value) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    onChange(newRules);
  };

  const addRule = () => {
    onChange([...rules, { id: Date.now(), field: 'tag', operator: 'equals', value: '', logic: 'AND' }]);
  };

  const removeRule = (index) => {
    const newRules = rules.filter((_, i) => i !== index);
    onChange(newRules);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
        <p className="text-sm text-blue-800 flex items-center gap-2">
          <Activity size={16} />
          قم ببناء القواعد لتحديد المرضى تلقائياً. سيتم تحديث القائمة فوراً.
        </p>
      </div>

      {rules.map((rule, index) => (
        <div key={rule.id} className="flex flex-col md:flex-row items-start md:items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
          {index > 0 && (
             <select 
             value={rule.logic}
             onChange={(e) => updateRule(index, 'logic', e.target.value)}
             className="bg-gray-100 text-gray-700 text-sm rounded-md px-2 py-1.5 border-none font-bold focus:ring-1 focus:ring-blue-500"
           >
             <option value="AND">و</option>
             <option value="OR">أو</option>
           </select>
          )}
          
          {index === 0 && <span className="w-6 text-gray-400 text-sm font-bold">حيث</span>}

          <select 
            value={rule.field}
            onChange={(e) => updateRule(index, 'field', e.target.value)}
            className="flex-1 bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {fields.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>

          <select 
            value={rule.operator}
            onChange={(e) => updateRule(index, 'operator', e.target.value)}
            className="flex-1 bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {operators.map(op => <option key={op.id} value={op.id}>{op.label}</option>)}
          </select>

          <input 
            type="text" 
            value={rule.value}
            onChange={(e) => updateRule(index, 'value', e.target.value)}
            className="flex-1 bg-white border border-gray-300 text-gray-800 text-sm rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="القيمة..."
          />

          <button onClick={() => removeRule(index)} className="text-red-400 hover:text-red-600 p-2">
            <Trash2 size={18} />
          </button>
        </div>
      ))}

      <button 
        onClick={addRule}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
      >
        <Plus size={18} /> إضافة شرط
      </button>
    </div>
  );
};

// 3. Tags Panel (Right Side)
const TagsPanel = ({ tags, setTags }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveTag = (tagData) => {
    if (tagData.id) {
      setTags(tags.map(t => t.id === tagData.id ? { ...t, ...tagData } : t));
    } else {
      setTags([...tags, { ...tagData, id: Date.now(), count: 0 }]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteTag = (id) => {
    if(window.confirm('هل أنت متأكد من حذف هذا الوسم؟')) {
      setTags(tags.filter(t => t.id !== id));
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-2 text-blue-700">
          <div className="p-2 bg-blue-100 rounded-lg"><Tag size={20} /></div>
          <h2 className="font-bold text-lg">الوسوم</h2>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm"
        >
          <Plus size={16} /> وسم جديد
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tags.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p>لا توجد وسوم حالياً</p>
          </div>
        ) : (
          tags.map(tag => (
            <div key={tag.id} className="group flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all bg-white">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${tag.color}`}>
                  {tag.name}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {tag.count} مريض
                </span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setIsModalOpen(true)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"><Edit2 size={14} /></button>
                <button onClick={() => handleDeleteTag(tag.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <TagModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTag} />
    </div>
  );
};

// 4. Segments Panel (Left Side)
const SegmentsPanel = ({ segments, setSegments }) => {
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewCount, setPreviewCount] = useState(0);

  // Mock preview logic
  const handlePreview = () => {
    setPreviewCount(Math.floor(Math.random() * 50) + 10);
    // In real app, this calls API
  };

  const handleSaveSegment = () => {
    if (selectedSegment.id) {
      setSegments(segments.map(s => s.id === selectedSegment.id ? selectedSegment : s));
    } else {
      setSegments([...segments, { ...selectedSegment, id: Date.now(), count: 0 }]);
    }
    setIsEditing(false);
    setSelectedSegment(null);
  };

  const startCreate = () => {
    setSelectedSegment({
      name: '', description: '', rules: [{ id: 1, field: 'tag', operator: 'equals', value: '', logic: 'AND' }]
    });
    setIsEditing(true);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-2 text-indigo-700">
          <div className="p-2 bg-indigo-100 rounded-lg"><Users size={20} /></div>
          <h2 className="font-bold text-lg">المجموعات الديناميكية</h2>
        </div>
        <button 
          onClick={startCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
        >
          <Plus size={16} /> مجموعة جديدة
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {segments.map(seg => (
          <div key={seg.id} className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all bg-white cursor-pointer group relative">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-800">{seg.name}</h3>
              <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-md font-bold">{seg.count} مريض</span>
            </div>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{seg.description}</p>
            
            <div className="flex gap-2 pt-2 border-t border-gray-50">
               <button className="text-xs flex items-center gap-1 text-gray-500 hover:text-indigo-600 font-medium">
                 <Filter size={12} /> معاينة
               </button>
               <button className="text-xs flex items-center gap-1 text-gray-500 hover:text-indigo-600 font-medium">
                 <Edit2 size={12} /> تعديل
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Overlay */}
      {isEditing && (
        <div className="absolute inset-0 bg-white z-20 flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-800">{selectedSegment.id ? 'تعديل المجموعة' : 'إنشاء مجموعة جديدة'}</h3>
            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Meta Data */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المجموعة</label>
                <input 
                  value={selectedSegment.name} 
                  onChange={(e) => setSelectedSegment({...selectedSegment, name: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="مثال: مرضى الأسنان"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea 
                  value={selectedSegment.description} 
                  onChange={(e) => setSelectedSegment({...selectedSegment, description: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows="2"
                  placeholder="وصف داخلي للمجموعة..."
                />
              </div>
            </div>

            {/* Rules Builder */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Filter size={16} /> شروط الانضمام
              </label>
              <SegmentBuilder 
                rules={selectedSegment.rules} 
                onChange={(newRules) => setSelectedSegment({...selectedSegment, rules: newRules})}
              />
            </div>

            {/* Preview Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">النتيجة المتوقعة</span>
                <button onClick={handlePreview} className="text-xs text-indigo-600 hover:underline">تحديث المعاينة</button>
              </div>
              <div className="text-2xl font-bold text-gray-800">{previewCount > 0 ? `${previewCount} مريض` : '0 مريض'}</div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">إلغاء</button>
            <button onClick={handleSaveSegment} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md flex items-center gap-2">
              <Save size={18} /> حفظ المجموعة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. Main Layout Component
export default function TagsAndSegmentsPage() {
  const [tags, setTags] = useState(INITIAL_TAGS);
  const [segments, setSegments] = useState(INITIAL_SEGMENTS);
  const [activeTab, setActiveTab] = useState('tags'); // 'tags' or 'segments'

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 font-sans text-gray-900 p-4 md:p-8">
      {/* Inject Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
        body { font-family: 'Tajawal', sans-serif; }
      `}</style>

      {/* Page Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-1">الوسوم والمجموعات</h1>
          <p className="text-gray-500">إدارة تصنيفات المرضى وتقسيمهم الذكي</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 shadow-sm flex items-center gap-2">
             <MoreVertical size={18} /> خيارات
           </button>
           <button className="bg-blue-600 px-6 py-2 rounded-lg text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
             <Save size={18} /> حفظ الكل
           </button>
        </div>
      </header>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto h-[calc(100vh-180px)] min-h-[600px]">
        
        {/* Mobile Tabs */}
        <div className="md:hidden mb-4 bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex">
          <button 
            onClick={() => setActiveTab('tags')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'tags' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Tag size={18} /> الوسوم
          </button>
          <button 
            onClick={() => setActiveTab('segments')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'segments' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Users size={18} /> المجموعات
          </button>
        </div>

        {/* Desktop Layout (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
          
          {/* Right Panel: Tags (Takes 4 cols on Desktop) */}
          <div className={`md:col-span-4 h-full ${activeTab === 'tags' ? 'block' : 'hidden md:block'}`}>
            <TagsPanel tags={tags} setTags={setTags} />
          </div>

          {/* Left Panel: Segments (Takes 8 cols on Desktop) */}
          <div className={`md:col-span-8 h-full ${activeTab === 'segments' ? 'block' : 'hidden md:block'}`}>
            <SegmentsPanel segments={segments} setSegments={setSegments} />
          </div>

        </div>
      </main>
    </div>
  );
}