import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  ArrowRight,
} from "lucide-react";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  experience: string;
  salaryRange: string;
  description: string;
  skills: string[];
  postedAt: string;
};

export function JobCard({ job }: { job: Job }) {
  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900">
            {job.title}
          </h3>
          <p className="text-sm font-medium text-slate-500">
            {job.company}
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-lg bg-blue-50 text-blue-600">
          {job.jobType}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4" />
          {job.location}
        </div>
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-4 h-4" />
          {job.experience}
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-4 h-4" />
          {job.salaryRange}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          Posted {job.postedAt}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 line-clamp-3 mb-5">
        {job.description}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {job.skills.map((skill) => (
          <span
            key={skill}
            className="px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition">
          View details <ArrowRight className="w-4 h-4" />
        </button>

        <button className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition">
          Apply
        </button>
      </div>
    </div>
  );
}
