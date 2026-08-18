import { useMemo, useState } from "react";
import { Search, Filter, FileText, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DOCUMENTS = [
  {
    id: "doc-1",
    title: "Professional Services Agreement",
    created: "Jul 18, 2026",
    lifecycle: "Jul 18, 2026 → Jul 18, 2027",
    status: "Completed",
    signers: ["OG", "GE", "HF"],
  },
  {
    id: "doc-2",
    title: "Contractor Onboarding Form",
    created: "Jul 12, 2026",
    lifecycle: "Jul 12, 2026 → Jul 12, 2027",
    status: "Signed",
    signers: ["GA", "JM"],
  },
];

const EXTERNAL_DOCUMENTS = [
  {
    id: "ext-1",
    title: "Bank Verification",
    created: "Jul 10, 2026",
    lifecycle: "Jul 10, 2026 → Jul 10, 2027",
    status: "Pending",
    signers: ["Flowboard"],
  },
];

export default function DocumentsPage() {
  const [search, setSearch] = useState("");

  const documents = useMemo(() => {
    const query = search.toLowerCase();
    return DOCUMENTS.filter((doc) => doc.title.toLowerCase().includes(query));
  }, [search]);

  const externalDocuments = useMemo(() => {
    const query = search.toLowerCase();
    return EXTERNAL_DOCUMENTS.filter((doc) => doc.title.toLowerCase().includes(query));
  }, [search]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">All Documents</h1>
            <p className="mt-2 text-sm text-slate-500">Manage, review, and access documents connected to your account.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[320px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search document title..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="h-11 gap-2">
              <Filter className="w-4 h-4" />
              All filters
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
        <Tabs defaultValue="documents">
          <TabsList className="gap-2 w-full">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="external">External Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-6 space-y-6">
            {documents.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
                No documents match your search.
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="rounded-3xl border border-slate-200 p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A079FF]/10 text-[#A079FF]">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-lg font-bold text-slate-950 truncate">{doc.title}</p>
                          <p className="text-sm text-slate-500">Created {doc.created}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                        <span>Lifecycle: {doc.lifecycle}</span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{doc.status}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 items-start md:items-end">
                      <div className="text-sm text-slate-500">Signers</div>
                      <div className="flex -space-x-2">
                        {doc.signers.map((signer) => (
                          <div key={signer} className="h-9 w-9 rounded-full bg-slate-100 border border-white text-[11px] font-bold text-slate-700 flex items-center justify-center shadow-sm">
                            {signer}
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" className="gap-2">
                        View details
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="external" className="mt-6 space-y-6">
            {externalDocuments.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
                No external documents found.
              </div>
            ) : (
              <div className="space-y-4">
                {externalDocuments.map((doc) => (
                  <div key={doc.id} className="rounded-3xl border border-slate-200 p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-950 truncate">{doc.title}</p>
                        <p className="text-sm text-slate-500">Created {doc.created}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 items-start md:items-end">
                      <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-amber-700">{doc.status}</span>
                      <Button variant="outline" className="gap-2">
                        View details
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
