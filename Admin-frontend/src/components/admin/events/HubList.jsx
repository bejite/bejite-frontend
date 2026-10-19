import { useState } from "react";
import { Search, Calendar, Clock, MapPin, Video, FileText, Trash2, Edit3, Eye, Users } from "lucide-react";

const CATEGORY_COLORS = {
  Technology: "bg-blue-50 text-blue-700 border-blue-200",
  Finance: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Product: "bg-purple-50 text-purple-700 border-purple-200",
  Creative: "bg-rose-50 text-rose-700 border-rose-200",
};

const GRADIENT_COLORS = {
  Technology: "from-blue-600 to-indigo-700",
  Finance: "from-emerald-600 to-teal-700",
  Product: "from-purple-600 to-violet-700",
  Creative: "from-rose-500 to-pink-700",
};

export default function HubList({ activeTab, items, onEditItem, onDeleteItem, onViewItem }) {
  const [search, setSearch] = useState("");

  const filtered = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
        <input
          type="text"
          placeholder={activeTab === "events" ? "Search partner events..." : "Search employment reports..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-[#16730F] focus:ring-2 focus:ring-[#16730F]/10 outline-none text-sm text-gray-700 transition-all"
        />
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl flex flex-col items-center justify-center py-16 text-gray-400">
          {activeTab === "events" ? <Calendar size={40} strokeWidth={1.5} /> : <FileText size={40} strokeWidth={1.5} />}
          <p className="text-sm font-semibold mt-3">No {activeTab} found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your search or create a new one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-gray-200 transition-all group"
            >
              {activeTab === "events" ? (
                /* ─── Event Card Row ─── */
                <div className="flex gap-4">
                  {/* Cover thumbnail */}
                  <div className="w-28 h-20 rounded-xl overflow-hidden shrink-0 relative bg-gray-100 hidden sm:block">
                    <img src={item.coverImg} alt={item.title} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${GRADIENT_COLORS[item.category] || "from-gray-600 to-gray-800"} opacity-40`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[item.category] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                            {item.category}
                          </span>
                          <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-0.5">
                            {item.type === "virtual" ? <Video size={10} /> : <MapPin size={10} />}
                            {item.type === "virtual" ? "Virtual" : "In Person"}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm leading-snug truncate">{item.title}</h3>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onViewItem(item)} className="p-2 text-gray-400 hover:text-[#16730F] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer" title="Preview">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => onEditItem(item)} className="p-2 text-gray-400 hover:text-[#16730F] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer" title="Edit">
                          <Edit3 size={15} />
                        </button>
                        <button onClick={() => onDeleteItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1"><Users size={12} className="text-gray-400" /> {item.host}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} className="text-gray-400" /> {item.date}</span>
                      <span className="flex items-center gap-1"><Clock size={12} className="text-gray-400" /> {item.time}</span>
                      <span className={`font-semibold ${item.seatsLeft <= 5 ? "text-rose-500" : "text-[#16730F]"}`}>
                        🎟️ {item.seatsLeft}/{item.seats} seats left
                      </span>
                    </div>

                    {/* Tags */}
                    {item.tags?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* ─── Report Row ─── */
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16730F] flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm leading-snug">{item.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1 italic">"{item.summary}"</p>
                      <p className="text-[10px] text-gray-400 mt-1.5 font-medium">{item.publishedDate || "Recently published"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onViewItem(item)} className="p-2 text-gray-400 hover:text-[#16730F] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer" title="Preview">
                      <Eye size={15} />
                    </button>
                    <button onClick={() => onEditItem(item)} className="p-2 text-gray-400 hover:text-[#16730F] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer" title="Edit">
                      <Edit3 size={15} />
                    </button>
                    <button onClick={() => onDeleteItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
