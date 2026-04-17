
export function PlatformFeaturesGrid() {
  return (
    <section className="relative w-full py-24 bg-transparent z-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="mb-16">
          <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-4 block">WHAT FLOWBOARD DOES</span>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-indigo-950 leading-tight">
            The Global People Platform
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
           
           {/* Card 1: Payroll */}
           <div className="bg-[#f7f7f7] rounded-none p-10 flex flex-col min-h-[520px] group relative overflow-hidden transition-all hover:bg-[#f1f1f1]">
              <div className="mb-12 z-10 relative">
                <h3 className="text-2xl font-bold text-indigo-950 mb-2">Flowboard Payroll</h3>
                <p className="text-slate-500 text-lg">Local and global payroll, your way.</p>
              </div>
              
              <div className="flex-1 flex items-center justify-center relative z-10">
                 <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-50 w-full max-w-[280px] transform group-hover:-translate-y-2 transition-transform duration-500">
                    <div className="flex justify-between items-center mb-4">
                       <span className="font-semibold text-[11px] text-slate-500 uppercase tracking-widest">Payroll funding</span>
                       <span className="font-bold text-slate-900">$800,450.30</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                       <span className="font-semibold text-sm text-slate-800">Payroll schedule</span>
                       <span className="font-bold text-slate-900">Bi-weekly</span>
                    </div>
                    <div className="flex justify-between items-center mb-6">
                       <span className="font-semibold text-sm text-slate-800">Approvers</span>
                       <div className="flex -space-x-2">
                         {[1,2,3,4].map(i => (
                            <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} alt="approver" className="w-6 h-6 rounded-full border-2 border-white" />
                         ))}
                       </div>
                    </div>
                    <button className="w-full bg-[#111] text-white rounded-xl py-3.5 font-bold hover:bg-black transition-colors">
                      Submit
                    </button>
                 </div>
              </div>
           </div>

           {/* Card 2: HR */}
           <div className="bg-[#f7f7f7] rounded-none p-10 flex flex-col min-h-[520px] group relative overflow-hidden transition-all hover:bg-[#f1f1f1]">
              <div className="mb-12 z-10 relative">
                <h3 className="text-2xl font-bold text-indigo-950 mb-2">Flowboard HR</h3>
                <p className="text-slate-500 text-lg">One HR system for every worker.</p>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center gap-4 transform group-hover:scale-[1.02] transition-transform duration-500 relative z-10">
                 <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 w-full max-w-[320px]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Increase user retention rate</span>
                      <span className="text-[10px] bg-indigo-50 px-2 py-1 rounded-md text-indigo-600 font-bold">Details</span>
                    </div>
                    <div className="flex -space-x-1 mb-3">
                       {[1,2,3,4].map(i => <img key={i} src={`https://i.pravatar.cc/100?img=${i+20}`} alt="user" className="w-6 h-6 rounded-full border-2 border-white" />)}
                    </div>
                    <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden flex">
                       <div className="bg-indigo-500 h-full w-[40%]"></div>
                       <div className="bg-indigo-300 h-full w-[25%] opacity-40"></div>
                    </div>
                 </div>
                 <div className="flex gap-4 w-full max-w-[320px]">
                    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 w-1/2 flex items-center justify-center relative">
                       <div className="w-12 h-12 border-4 border-slate-50 rounded-full relative">
                          <div className="absolute inset-[-4px] border-4 border-indigo-400 rounded-full border-t-transparent border-r-transparent -rotate-12"></div>
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">72%</div>
                       </div>
                    </div>
                    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 w-1/2 flex items-end gap-1.5 px-4 h-24">
                       <div className="w-full bg-slate-50 h-[40%] rounded-sm"></div>
                       <div className="w-full bg-indigo-200 h-[70%] rounded-sm relative group">
                          <div className="absolute -top-6 -right-2 bg-indigo-950 text-white text-[8px] py-1 px-1.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">7.2k / mo</div>
                       </div>
                       <div className="w-full bg-slate-50 h-[50%] rounded-sm"></div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Card 3: Task */}
           <div className="bg-[#f7f7f7] rounded-none p-10 flex flex-col min-h-[520px] group relative overflow-hidden transition-all hover:bg-[#f1f1f1]">
              <div className="mb-12 z-10 relative">
                <h3 className="text-2xl font-bold text-indigo-950 mb-2">Flowboard Task</h3>
                <p className="text-slate-500 text-lg">Automated workflows, anywhere.</p>
              </div>
              
              <div className="flex-1 flex items-center justify-center relative z-10">
                 <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-50 w-full max-w-[300px] transform group-hover:scale-[1.02] transition-transform duration-500">
                    <div className="flex flex-col gap-6 relative">
                       <div className="absolute left-[13px] top-[14px] bottom-10 w-[1px] bg-slate-100 z-0"></div>

                       <div className="flex items-center gap-4 relative z-10">
                          <div className="w-7 h-7 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                          <div className="flex flex-col">
                             <span className="font-bold text-xs text-slate-800">Task Assigned</span>
                             <span className="font-semibold text-[9px] text-slate-400">Jun 16th</span>
                          </div>
                          <div className="ml-auto w-10 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shadow-sm">
                             <span className="text-xs">📋</span>
                          </div>
                       </div>

                       <div className="flex items-center gap-4 relative z-10">
                          <div className="w-7 h-7 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                          <div className="flex flex-col">
                             <span className="font-bold text-xs text-slate-800">In-Progress</span>
                             <span className="font-semibold text-[9px] text-slate-400">Jun 17th</span>
                          </div>
                       </div>

                       <div className="flex items-center gap-4 relative z-10 opacity-40">
                          <div className="w-7 h-7 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                          </div>
                          <div className="flex flex-col">
                             <span className="font-bold text-xs text-slate-800">Final Validation</span>
                             <span className="font-semibold text-[9px] text-slate-400">Jun 19th</span>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="absolute bottom-1 right-2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                 </div>
              </div>
           </div>

           {/* Card 4: Benefits */}
           <div className="bg-[#f7f7f7] rounded-none p-10 flex flex-col min-h-[520px] group relative overflow-hidden transition-all hover:bg-[#f1f1f1]">
              <div className="mb-12 z-10 relative">
                <h3 className="text-2xl font-bold text-indigo-950 mb-2">Flowboard Benefits</h3>
                <p className="text-slate-500 text-lg">Health care to health insurance.</p>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center gap-4 transform group-hover:-translate-y-2 transition-transform duration-500 relative z-10">
                 
                 <div className="bg-white rounded-3xl px-5 py-3 shadow-md border border-slate-50 flex items-center gap-4 w-full max-w-[240px]">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl">🛡️</div>
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-slate-800 leading-none mb-1">Health Care</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Plan</span>
                    </div>
                 </div>

                 <div className="bg-white rounded-3xl px-5 py-3 shadow-md border border-slate-50 flex items-center gap-4 w-full max-w-[240px] translate-x-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl">🦷</div>
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-slate-800 leading-none mb-1">Dental Care</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Perk</span>
                    </div>
                 </div>

                 <div className="bg-white rounded-3xl px-5 py-3 shadow-md border border-slate-50 flex items-center gap-4 w-full max-w-[240px]">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl">👓</div>
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-slate-800 leading-none mb-1">Vision Care</span>
                       <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-50 px-1 rounded">Pending</span>
                    </div>
                 </div>
                 
              </div>
           </div>

           {/* Card 5: Recruit */}
           <div className="bg-[#f7f7f7] rounded-none p-10 flex flex-col min-h-[520px] group relative overflow-hidden transition-all hover:bg-[#f1f1f1]">
              <div className="mb-12 z-10 relative">
                <h3 className="text-2xl font-bold text-indigo-950 mb-2">Flowboard Recruit</h3>
                <p className="text-slate-500 text-lg">Hire anywhere in days, fully compliant.</p>
              </div>
              
              <div className="flex-1 flex items-center justify-center relative z-10">
                 <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-50 w-full max-w-[280px] transform group-hover:rotate-1 transition-transform duration-500">
                    <div className="flex justify-between items-center mb-6">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Roster</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                    </div>

                    <div className="flex justify-between items-center mb-5">
                       <div className="flex items-center gap-3">
                          <div className="text-xl">🇺🇸</div>
                          <div className="flex -space-x-1.5"><img src="https://i.pravatar.cc/100?img=12" className="w-6 h-6 rounded-full border border-white" /><img src="https://i.pravatar.cc/100?img=14" className="w-6 h-6 rounded-full border border-white" /></div>
                       </div>
                       <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase">Vetting</span>
                    </div>

                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-3">
                          <div className="text-xl">🇸🇪</div>
                          <div className="flex -space-x-1.5"><img src="https://i.pravatar.cc/100?img=22" className="w-6 h-6 rounded-full border border-white" /><img src="https://i.pravatar.cc/100?img=24" className="w-6 h-6 rounded-full border border-white" /></div>
                       </div>
                       <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase">Hired</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Card 6: Mobility */}
           <div className="bg-[#f7f7f7] rounded-none p-10 flex flex-col min-h-[520px] group relative overflow-hidden transition-all hover:bg-[#f1f1f1]">
              <div className="mb-12 z-10 relative">
                <h3 className="text-2xl font-bold text-indigo-950 mb-2">Flowboard Mobility</h3>
                <p className="text-slate-500 text-lg">Visas handled in-house, end to end.</p>
              </div>
              
              <div className="flex-1 flex items-center justify-center relative z-10 group-hover:scale-105 transition-transform duration-700">
                 <div className="w-full max-w-[260px] relative">
                    
                    <div className="bg-white rounded-3xl px-3 py-3 shadow-md border border-slate-50 flex items-center justify-between relative z-20">
                       <div className="text-2xl p-2 rounded-xl bg-slate-50 flex items-center justify-center w-12 h-12">🇬🇧</div>
                       <div className="text-4xl shadow-2xl rounded-xl -translate-y-3 z-10 bg-white p-1 border border-slate-50 animate-bounce-subtle">🇺🇸</div>
                       <div className="text-2xl p-2 rounded-xl bg-slate-50 flex items-center justify-center w-12 h-12">🇦🇪</div>
                    </div>

                    <div className="absolute -top-10 -right-4 bg-white rounded-3xl shadow-lg border border-slate-50 p-3 flex flex-col z-10">
                       <div className="flex items-center gap-1.5 mb-2">
                          <svg className="w-3.5 h-3.5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          <span className="text-[9px] font-bold text-slate-600">All set!</span>
                       </div>
                       <div className="flex -space-x-1">
                          <img src="https://i.pravatar.cc/100?img=33" className="w-5 h-5 rounded-full border border-white" />
                          <img src="https://i.pravatar.cc/100?img=34" className="w-5 h-5 rounded-full border border-white" />
                          <div className="w-5 h-5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[7px] font-bold text-slate-500">+8</div>
                       </div>
                    </div>

                    <div className="absolute -bottom-8 left-4 bg-white rounded-3xl shadow-lg border border-slate-50 px-4 py-3 min-w-[150px] z-30 transform group-hover:-translate-x-2 transition-transform">
                       <span className="text-xs font-bold text-slate-800 block mb-1">Visa Status</span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between w-full">Processing <div className="w-2.5 h-2.5 border-t-2 border-indigo-500 rounded-full animate-spin"></div></span>
                    </div>
                 </div>
                 
                 {/* Indicator Arrow */}
                 <div className="absolute bottom-1 right-2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </section>
  );
}
