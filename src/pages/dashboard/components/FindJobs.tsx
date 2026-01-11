import { JobCard } from "./components/JobCard";
import { mockJobs } from "./components/mockJobs";

export function FindJobs() {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      <h1 className="text-2xl lg:text-3xl font-black text-slate-900">
        Find Jobs
      </h1>
      <p className="text-slate-500 text-sm">
        Browse available jobs and apply to roles that match your skills.
      </p>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {mockJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
