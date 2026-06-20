import { useCallback, useEffect, useState } from "react";
import PhotoCard from "../components/PhotoCard";
import PhotoModal from "../components/PhotoModal";
import { SearchIcon, CloseIcon } from "../components/Icons";
import { getPhotos, deletePhoto, SessionExpiredError } from "../services/detectionApi";
import { normalizePhoto } from "../lib/detections";
import { useAuth } from "../context/auth-context";

const LIMIT = 24;

/** Pull the photo array out of whatever envelope the API returns. */
function extractList(data) {
  const list = Array.isArray(data)
    ? data
    : (data?.photos ?? data?.results ?? data?.items ?? data?.data ?? []);
  return list.map(normalizePhoto).filter(Boolean);
}

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(""); // controlled input
  const [activeBib, setActiveBib] = useState(""); // submitted search term
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { token, logout, openLoginPrompt } = useAuth();

  // Fetch a page. All state updates happen after the await (or in catch/
  // finally), so this is safe to call from an effect without synchronous
  // setState. Callers set the "loading" UI before invoking (see handlers).
  const fetchPage = useCallback(async (bib, off, append) => {
    try {
      const data = await getPhotos({
        bibNumber: bib || undefined,
        limit: LIMIT,
        offset: off,
      });
      const list = extractList(data);
      setPhotos((prev) => (append ? [...prev, ...list] : list));
      setOffset(off + list.length);
      setHasMore(list.length === LIMIT);
      setStatus("ready");
    } catch (err) {
      if (!append) setStatus("error");
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }, []);

  // Load the most recent photos on mount (initial status is already "loading").
  // Inlined as a promise chain so all setState happens in async callbacks.
  useEffect(() => {
    let cancelled = false;
    getPhotos({ limit: LIMIT, offset: 0 })
      .then((data) => {
        if (cancelled) return;
        const list = extractList(data);
        setPhotos(list);
        setOffset(list.length);
        setHasMore(list.length === LIMIT);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const bib = query.trim();
    setActiveBib(bib);
    setStatus("loading");
    setError(null);
    fetchPage(bib, 0, false);
  }

  function handleClear() {
    setQuery("");
    setActiveBib("");
    setStatus("loading");
    setError(null);
    fetchPage("", 0, false);
  }

  function handleLoadMore() {
    setLoadingMore(true);
    fetchPage(activeBib, offset, true);
  }

  function handleRetry() {
    setStatus("loading");
    setError(null);
    fetchPage(activeBib, 0, false);
  }

  // Admin-only: confirm, delete on the backend, then drop the card locally
  // (no full reload). A 401 means the session expired — clear it and re-prompt.
  async function handleDelete(photo) {
    if (!photo?.id || deletingId) return;
    const ok = window.confirm(
      "Delete this photo? This also removes it from storage.",
    );
    if (!ok) return;

    setDeletingId(photo.id);
    try {
      await deletePhoto(photo.id, token);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      setSelected((cur) => (cur?.id === photo.id ? null : cur));
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        logout();
        openLoginPrompt();
      } else {
        window.alert(err.message || "Could not delete the photo.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  const isEmpty = status === "ready" && photos.length === 0;

  return (
    <main id="main" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* heading */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Gallery
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            Browse persisted detections from the backend. Search by bib number.
          </p>
        </div>
      </div>

      {/* search */}
      <form onSubmit={handleSubmit} className="mt-6 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <label htmlFor="bib-search" className="sr-only">
            Search photos by bib number
          </label>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-faint" />
          <input
            id="bib-search"
            type="search"
            inputMode="numeric"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by bib number…"
            className="w-full rounded-xl border border-line bg-surface-2 py-2.5 pl-10 pr-3 font-mono text-sm text-ink placeholder:font-sans placeholder:text-ink-faint focus:border-accent-cyan/60 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-cyan px-4 py-2.5 text-sm font-semibold text-canvas shadow-[0_4px_18px_rgba(34,211,238,0.3)] transition-[filter] hover:brightness-110"
        >
          Search
        </button>
        {activeBib && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            <CloseIcon className="h-4 w-4" />
            Clear
          </button>
        )}
      </form>

      {activeBib && status === "ready" && (
        <p className="mt-3 text-sm text-ink-muted">
          Showing matches for bib{" "}
          <span className="font-mono text-ink">#{activeBib}</span>
        </p>
      )}

      {/* content */}
      <div className="mt-6">
        {status === "loading" && <GallerySkeleton />}

        {status === "error" && <ErrorState message={error} onRetry={handleRetry} />}

        {isEmpty && (
          <EmptyState
            title={activeBib ? `No results for bib #${activeBib}` : "No photos yet"}
            hint={
              activeBib
                ? "Try a different bib number, or clear the search."
                : "Run a detection on the dashboard to populate the gallery."
            }
          />
        )}

        {status === "ready" && photos.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {photos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onOpen={setSelected}
                  onDelete={handleDelete}
                  deleting={deletingId === photo.id}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent-cyan/50 hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <PhotoModal
          key={selected.id}
          photo={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
          deleting={deletingId === selected.id}
        />
      )}
    </main>
  );
}

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-line bg-surface/70"
        >
          <div
            className="aspect-[4/3] w-full bg-surface-2"
            style={{ animation: "pulse-soft 1.6s ease-in-out infinite" }}
          />
          <div className="space-y-2 p-3.5">
            <div className="h-4 w-2/3 rounded bg-surface-2" />
            <div className="h-3 w-1/2 rounded bg-surface-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-20 text-center">
      <span className="font-mono text-3xl text-ink-faint">[ ]</span>
      <p className="text-base font-medium text-ink">{title}</p>
      <p className="max-w-sm text-sm text-ink-faint">{hint}</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-conf-low/40 bg-conf-low/10 py-16 text-center">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-conf-low/20 font-mono text-lg font-bold text-conf-low">
        !
      </span>
      <p className="text-base font-medium text-conf-low">Couldn’t load photos</p>
      <p className="max-w-md text-sm text-ink-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 rounded-xl border border-line bg-surface-2 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-line-strong"
      >
        Retry
      </button>
    </div>
  );
}
