'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface GratitudeItem {
  _id: string;
  content: string;
  isChecked: boolean;
  createdAt: string;
}

export function GratitudeList() {
  const [items, setItems] = useState<GratitudeItem[]>([]);
  const [historyItems, setHistoryItems] = useState<GratitudeItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    const mode = activeTab === 'history' ? 'history' : 'today';
    try {
      const res = await fetch(`/api/gratitude?mode=${mode}`);
      if (res.ok) {
        const data = await res.json();
        if (activeTab === 'today') {
            setItems(data);
        } else {
            setHistoryItems(data);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    try {
      const res = await fetch('/api/gratitude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newItem }),
      });
      if (res.ok) {
        const savedItem = await res.json();
        setItems([...items, savedItem]);
        setNewItem('');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleCheck = async (id: string) => {
    // Optimistic toggle
    setItems(items.map(i => i._id === id ? { ...i, isChecked: !i.isChecked } : i));
    
    try {
      await fetch('/api/gratitude', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (error) {
        console.error(error);
        fetchItems(); // revert on error
    }
  };

  const handleDelete = async (id: string) => {
      setItems(items.filter(i => i._id !== id));
      try {
          await fetch(`/api/gratitude?id=${id}`, { method: 'DELETE' });
      } catch (error) {
          console.error(error);
      }
  };

  return (
    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm shadow-lg flex flex-col h-full h-[400px]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Gratitude List
            </CardTitle>
            <div className="flex gap-1 bg-slate-950/50 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('today')}
                    className={`text-[10px] px-3 py-1 rounded-md transition-all ${activeTab === 'today' ? 'bg-amber-500/10 text-amber-500 font-medium' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Today
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`text-[10px] px-3 py-1 rounded-md transition-all ${activeTab === 'history' ? 'bg-amber-500/10 text-amber-500 font-medium' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    History
                </button>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden pt-0">
        
        {activeTab === 'today' ? (
            <>
                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                    {items.length > 0 ? (
                        items.map(item => (
                            <div key={item._id} className="group flex items-center justify-between p-3 bg-slate-950/20 rounded-lg hover:bg-slate-950/40 border border-transparent hover:border-white/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => toggleCheck(item._id)}
                                        className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
                                            item.isChecked 
                                            ? 'bg-amber-500 border-amber-500 text-slate-900' 
                                            : 'border-slate-600 hover:border-amber-500/50'
                                        }`}
                                    >
                                        {item.isChecked && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </button>
                                    <span className={`text-sm font-light transition-all ${item.isChecked ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                        {item.content}
                                    </span>
                                </div>
                                <button onClick={() => handleDelete(item._id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-opacity">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
                            <p className="text-xs italic">What are you grateful for today?</p>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="flex gap-2 relative">
                    <Input 
                        placeholder="I'm grateful for..."
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        className="bg-slate-950/50 border-white/5 focus:border-amber-500/30 h-10 text-sm pl-4 pr-12 text-slate-200"
                    />
                    <Button onClick={handleAdd} className="absolute right-1 top-1 bottom-1 h-auto bg-amber-600/20 hover:bg-amber-600 text-amber-500 hover:text-slate-900 text-xs px-3 rounded-md transition-all">
                        Add
                    </Button>
                </div>
            </>
        ) : (
            /* History View */
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                 {historyItems.length > 0 ? (
                     historyItems.reduce((acc: any[], item) => {
                         const date = new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                         const lastGroup = acc[acc.length - 1];
                         if (lastGroup && lastGroup.date === date) {
                             lastGroup.items.push(item);
                         } else {
                             acc.push({ date, items: [item] });
                         }
                         return acc;
                     }, []).map((group: any) => (
                         <div key={group.date} className="space-y-2">
                             <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest sticky top-0 bg-slate-900/90 py-1 z-10">{group.date}</h4>
                             <div className="space-y-1">
                                 {group.items.map((item: any) => (
                                     <div key={item._id} className="flex items-center gap-2 p-2 rounded hover:bg-white/[0.02]">
                                         <span className={`w-1.5 h-1.5 rounded-full ${item.isChecked ? 'bg-amber-500/50' : 'bg-slate-700'}`} />
                                         <span className="text-xs text-slate-400 font-light">{item.content}</span>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     ))
                 ) : (
                     <p className="text-center text-xs text-slate-600 py-8">No history yet.</p>
                 )}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
