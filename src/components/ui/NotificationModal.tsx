"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XCircle, CheckCircle, AlertCircle } from "lucide-react";

type NotificationModalProps = {
  open: boolean;
  type: "success" | "error" | "info";
  title: string;
  description: string;
  onClose: () => void;
  // New props for the "Login Now" blend
  primaryAction?: string; 
  onPrimaryClick?: () => void;
};

export default function NotificationModal({
  open,
  type,
  title,
  description,
  onClose,
  primaryAction,
  onPrimaryClick,
}: NotificationModalProps) {
  const icon = {
    success: <CheckCircle className="w-8 h-8 text-green-500" />,
    error: <XCircle className="w-8 h-8 text-red-500" />,
    info: <AlertCircle className="w-8 h-8 text-blue-500" />,
  }[type];

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100" // Increased opacity for better visibility
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-md transform overflow-hidden rounded-none bg-white p-8 text-left shadow-2xl transition-all border border-slate-100">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0">{icon}</div>
                  <div className="flex-1">
                    <Dialog.Title className="text-xl font-black text-slate-900 tracking-tight">
                      {title}
                    </Dialog.Title>
                    <p className="mt-2 text-sm text-slate-500 leading-relaxed font-medium">
                      {description}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
                  {primaryAction && onPrimaryClick && (
                    <button
                      type="button"
                      onClick={onPrimaryClick}
                      className="inline-flex flex-[2] justify-center rounded-none bg-[#050B1E] px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
                    >
                      {primaryAction}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className={`inline-flex flex-1 justify-center rounded-none border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all`}
                  >
                    {primaryAction ? "Cancel" : "Close"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}