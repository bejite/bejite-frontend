 import { TYPE_COLORS, TYPE_ICONS, TYPE_LABELS } from '../../pages/ActivityLog';
import { timeAgo } from '../../utils/checksFormat';
import { Heart, MessageCircle, Share2, FileText,  MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
 


export function PostCard({ post }) {
  const Icon = TYPE_ICONS[post.type] || FileText;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {post.media && (
        <img src={post.media} alt="" className="w-full h-48 object-cover" />
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_COLORS[post.type]}`}>
            <Icon className="w-3 h-3" />
            {TYPE_LABELS[post.type]}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{timeAgo(post.date)}</span>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-gray-800 text-sm leading-relaxed">{post.content}</p>
        <div className="flex items-center gap-5 pt-1 border-t border-gray-50">
          <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-rose-500 transition-colors">
            <Heart className="w-4 h-4" /> {post.likes}
          </button>
          <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-500 transition-colors">
            <MessageCircle className="w-4 h-4" /> {post.comments}
          </button>
          <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-500 transition-colors">
            <Share2 className="w-4 h-4" /> {post.shares}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
