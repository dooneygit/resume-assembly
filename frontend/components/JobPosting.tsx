import type { Application } from "@/lib/types";

export default function JobPosting({ application }: { application: Application | null }) {
  return (
    <aside className="flex w-[28%] shrink-0 flex-col border-l border-zinc-200">
      {application ? (
        <>
          <header className="shrink-0 border-b border-zinc-200 p-4">
            <h2 className="text-lg font-semibold leading-tight">{application.role}</h2>
            <p className="mt-1 text-sm text-zinc-700">{application.company}</p>
            {application.location && (
              <p className="text-sm text-zinc-500">{application.location}</p>
            )}
            {/^https?:\/\//i.test(application.url) && (
              <a
                href={application.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-blue-700 hover:underline"
              >
                View original posting ↗
              </a>
            )}
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap p-4 text-sm leading-relaxed text-zinc-800">
            {application.description || (
              <span className="text-zinc-500">No description.</span>
            )}
          </div>
        </>
      ) : (
        <p className="p-4 text-sm text-zinc-500">No application selected.</p>
      )}
    </aside>
  );
}
