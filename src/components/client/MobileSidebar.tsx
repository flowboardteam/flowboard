import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";

export default function MobileSidebar({ isOpen, onClose }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
          />
          <motion.div 
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-[280px] z-[110] lg:hidden bg-[var(--sidebar-bg)]"
          >
            <div className="h-full flex flex-col">
              <div className="p-4 flex justify-end">
                <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <Sidebar onClose={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}