"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  errorMessage,
  fetchApplications,
  fetchProfile,
  saveApplications,
  saveProfile,
} from "./api";
import { SyncedDocument, type SyncSnapshot } from "./synced-document";
import type { Application, Profile } from "./types";

type Documents = {
  applications: SyncedDocument<Application[]>;
  profile: SyncedDocument<Profile>;
};

type DataContextValue = {
  applications: SyncSnapshot<Application[]>;
  updateApplications: SyncedDocument<Application[]>["update"];
  profile: SyncSnapshot<Profile>;
  updateProfile: SyncedDocument<Profile>["update"];
};

const DataContext = createContext<DataContextValue | null>(null);

export function useData() {
  const value = useContext(DataContext);
  if (!value) throw new Error("useData must be used inside DataProvider");
  return value;
}

/** Loads applications and the master profile once, then serves them to the tree. */
export function DataProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Documents | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchApplications(), fetchProfile()]).then(
      ([applications, profile]) => {
        if (cancelled) return;
        setDocuments({
          applications: new SyncedDocument(applications, saveApplications),
          profile: new SyncedDocument(profile, saveProfile),
        });
      },
      (err) => {
        if (!cancelled) setLoadError(errorMessage(err));
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) {
    return (
      <FullScreenMessage>
        <p className="text-red-600">Couldn&apos;t load your data: {loadError}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 rounded border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100"
        >
          Retry
        </button>
      </FullScreenMessage>
    );
  }
  if (!documents) return <FullScreenMessage>Loading…</FullScreenMessage>;
  return <LoadedDataProvider documents={documents}>{children}</LoadedDataProvider>;
}

function LoadedDataProvider({
  documents,
  children,
}: {
  documents: Documents;
  children: ReactNode;
}) {
  const applications = useSyncExternalStore(
    documents.applications.subscribe,
    documents.applications.getSnapshot,
  );
  const profile = useSyncExternalStore(documents.profile.subscribe, documents.profile.getSnapshot);

  useEffect(() => {
    const flush = () => {
      documents.applications.flushOnUnload();
      documents.profile.flushOnUnload();
    };
    window.addEventListener("beforeunload", flush);
    return () => window.removeEventListener("beforeunload", flush);
  }, [documents]);

  return (
    <DataContext
      value={{
        applications,
        updateApplications: documents.applications.update,
        profile,
        updateProfile: documents.profile.update,
      }}
    >
      {children}
    </DataContext>
  );
}

function FullScreenMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh flex-col items-center justify-center text-sm text-zinc-500">
      {children}
    </div>
  );
}
