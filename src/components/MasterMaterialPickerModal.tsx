import React, { useState, useMemo } from 'react';
import { X, Search, Check, Plus, Database, Filter, Layers, Box } from 'lucide-react';
import { MasterMaterialCategory, MasterMaterialItem } from '../types';

export interface MasterMaterialPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: MasterMaterialItem[];
  targetCategory?: MasterMaterialCategory | 'ALL'; // 'MDU' | 'NON_MDU' | 'ALL'
  onSelectItem: (item: MasterMaterialItem) => void;
  onSelectMultiple?: (items: MasterMaterialItem[]) => void;
}

export const MasterMaterialPickerModal: React.FC<MasterMaterialPickerModalProps> = ({
  isOpen,
  onClose,
  materials,
  targetCategory = 'ALL',
  onSelectItem,
  onSelectMultiple,
}) => {
  const [activeCategoryTab, setActiveCategoryTab] = useState<'ALL' | MasterMaterialCategory>(
    targetCategory
  );
  const [search, setSearch] = useState('');
  const [selectedKelompok, setSelectedKelompok] = useState('ALL');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Update activeCategoryTab when targetCategory changes
  React.useEffect(() => {
    setActiveCategoryTab(targetCategory);
  }, [targetCategory, isOpen]);

  // Filter materials matching activeCategoryTab
  const categoryMaterials = useMemo(() => {
    if (activeCategoryTab === 'ALL') return materials;
    return materials.filter((m) => m.kategori === activeCategoryTab);
  }, [materials, activeCategoryTab]);

  // Extract unique kelompok
  const kelompokList = useMemo(() => {
    const set = new Set<string>();
    categoryMaterials.forEach((m) => set.add(m.kelompok));
    return Array.from(set).sort();
  }, [categoryMaterials]);

  // Filtered by search and kelompok
  const filteredMaterials = useMemo(() => {
    return categoryMaterials.filter((m) => {
      const matchSearch =
        search === '' ||
        m.namaMaterial.toLowerCase().includes(search.toLowerCase()) ||
        m.kodeMaterial.toLowerCase().includes(search.toLowerCase()) ||
        (m.spesifikasi && m.spesifikasi.toLowerCase().includes(search.toLowerCase())) ||
        m.kelompok.toLowerCase().includes(search.toLowerCase());

      const matchKelompok = selectedKelompok === 'ALL' || m.kelompok === selectedKelompok;

      return matchSearch && matchKelompok;
    });
  }, [categoryMaterials, search, selectedKelompok]);

  const toggleSelect = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleApplySelected = () => {
    if (selectedItemIds.length === 0) return;
    const selected = materials.filter((m) => selectedItemIds.includes(m.id));
    if (onSelectMultiple) {
      onSelectMultiple(selected);
    } else {
      selected.forEach((item) => onSelectItem(item));
    }
    setSelectedItemIds([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                activeCategoryTab === 'MDU'
                  ? 'bg-amber-500 text-slate-950'
                  : activeCategoryTab === 'NON_MDU'
                  ? 'bg-blue-600 text-white'
                  : 'bg-emerald-500 text-slate-950'
              }`}
            >
              {activeCategoryTab === 'MDU' ? 'MDU' : activeCategoryTab === 'NON_MDU' ? 'NON' : 'ALL'}
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Pilih Material dari Master Data</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    activeCategoryTab === 'MDU'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : activeCategoryTab === 'NON_MDU'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {activeCategoryTab === 'MDU' ? 'Material MDU' : activeCategoryTab === 'NON_MDU' ? 'Material Non-MDU' : 'Semua MDU & Non-MDU'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Pilih satu atau beberapa material standar PLN untuk langsung dimasukkan ke formulir
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs if targetCategory was ALL */}
        {targetCategory === 'ALL' && (
          <div className="flex border-b border-slate-200 bg-slate-100 px-4 pt-2 gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveCategoryTab('ALL');
                setSelectedKelompok('ALL');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition-colors cursor-pointer ${
                activeCategoryTab === 'ALL'
                  ? 'bg-white text-slate-900 border-t border-x border-slate-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({materials.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveCategoryTab('MDU');
                setSelectedKelompok('ALL');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeCategoryTab === 'MDU'
                  ? 'bg-white text-amber-950 border-t border-x border-slate-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              MDU ({materials.filter((m) => m.kategori === 'MDU').length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveCategoryTab('NON_MDU');
                setSelectedKelompok('ALL');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeCategoryTab === 'NON_MDU'
                  ? 'bg-white text-blue-950 border-t border-x border-slate-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Non-MDU ({materials.filter((m) => m.kategori === 'NON_MDU').length})
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode atau nama material..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedKelompok}
              onChange={(e) => setSelectedKelompok(e.target.value)}
              className="w-full sm:w-auto text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="ALL">Semua Kelompok ({categoryMaterials.length})</option>
              {kelompokList.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {filteredMaterials.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Tidak ada material master yang cocok dengan pencarian.
            </div>
          ) : (
            filteredMaterials.map((item) => {
              const isSelected = selectedItemIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-500/10 border border-amber-300'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                          item.kategori === 'MDU'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {item.kategori}
                        </span>
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {item.kodeMaterial}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-600">
                          {item.kelompok}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          Satuan: <span className="text-slate-800 uppercase">{item.satuan}</span>
                        </span>
                        {item.stokGudang !== undefined && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                            Stok: {item.stokGudang} {item.satuan}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 mt-1">
                        {item.namaMaterial}
                      </h4>
                      {item.spesifikasi ? (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {item.spesifikasi}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectItem(item);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Pilih Item</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            {selectedItemIds.length > 0 ? (
              <span className="text-amber-800 font-bold">
                {selectedItemIds.length} item dipilih
              </span>
            ) : (
              <span>Pilih satu atau centang beberapa item</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Tutup
            </button>

            {selectedItemIds.length > 0 && (
              <button
                type="button"
                onClick={handleApplySelected}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Tambahkan {selectedItemIds.length} Item Terpilih</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

