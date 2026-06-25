import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PhotoCard from "../components/PhotoCard";
import PhotoModal from "../components/PhotoModal";
import { getMyPhotos, SessionExpiredError } from "../services/detectionApi";
import { normalizePhoto } from "../lib/detections";
import { getRunnerToken, clearRunnerToken } from "../context/runner-auth";

/** Pull the photo array out of whatever envelope the API returns. */
function extractList(data) {
  const list = Array.isArray(data)
    ? data
    : (data?.photos ?? data?.results ?? data?.items ?? data?.data ?? []);
  return list.map(normalizePhoto).filter(Boolean);
}

export default function MyPhotos() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const token = getRunnerToken();
    if (!token) {
      navigate("/claim", { replace: true });
      return undefined;
    }

    let cancelled = false;
    getMyPhotos(token)
      .then((data) => {
        if (cancelled) return;
        setPhotos(extractList(data));
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof SessionExpiredError) {
          clearRunnerToken();
          navigate("/claim?expired=1", { replace: true });
          return;
        }
        setError(err.message);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function handleLogout() {
    clearRunnerToken();
    navigate("/claim", { replace: true });
  }

  const isEmpty = status === "ready" && photos.length === 0;

  return (
    <main id="main" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* heading */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            My photos
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            Photos you appear in. Open one to view and download the original.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
        >
          Log out
        </button>
      </div>

      {/* content */}
      <div className="mt-6">
        {status === "loading" && <GallerySkeleton />}

        {status === "error" && (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        )}

        {isEmpty && (
          <EmptyState
            title="No photos yet"
            hint="We couldn't find any photos for your bib. Check back after the event is processed."
          />
        )}

        {status === "ready" && photos.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} onOpen={setSelected} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <PhotoModal
          key={selected.id}
          photo={selected}
          onClose={() => setSelected(null)}
          enrich={false}
          downloadUrl={selected.cloudinaryUrl}
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
