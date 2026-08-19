import { Play, Pause, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { VOICES } from "@/lib/voices";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function VoicePicker({
  value,
  onChange,
}: {
  value: string | null | undefined;
  onChange: (id: string) => void;
}) {
  const { toast } = useToast();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePlay = (id: string, src?: string) => {
    if (!src) {
      toast({ title: "Voice preview coming soon" });
      return;
    }
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.onended = () => setPlayingId((p) => (p === id ? null : p));
    audio.onerror = () => {
      setPlayingId(null);
      toast({ title: "Could not play preview", variant: "destructive" });
    };
    audio
      .play()
      .then(() => setPlayingId(id))
      .catch(() => {
        setPlayingId(null);
        toast({ title: "Could not play preview", variant: "destructive" });
      });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {VOICES.map((v) => {
        const active = value === v.id;
        const isPlaying = playingId === v.id;
        return (
          <button
            type="button"
            key={v.id}
            onClick={() => onChange(v.id)}
            className={cn(
              "group relative text-left rounded-2xl border bg-card p-4 transition-all hover:shadow-md",
              active ? "border-primary ring-2 ring-primary/30 shadow-md" : "border-border hover:border-primary/40",
            )}
          >
            {active && (
              <span className="absolute top-3 right-3 size-6 rounded-full bg-primary text-primary-foreground grid place-items-center shadow">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
            )}
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={v.avatar}
                  alt={`${v.name} — ${v.style} AI voice`}
                  loading="lazy"
                  width={64}
                  height={64}
                  className="size-16 rounded-full object-cover ring-2 ring-border"
                />
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay(v.id, v.preview);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      togglePlay(v.id, v.preview);
                    }
                  }}
                  className="absolute -bottom-1 -right-1 size-7 rounded-full bg-primary text-primary-foreground grid place-items-center shadow ring-2 ring-card opacity-90 group-hover:opacity-100 cursor-pointer hover:scale-110 transition-transform"
                  aria-label={`${isPlaying ? "Pause" : "Preview"} ${v.name}`}
                >
                  {isPlaying ? (
                    <Pause className="size-3.5" fill="currentColor" />
                  ) : (
                    <Play className="size-3.5 translate-x-[1px]" fill="currentColor" />
                  )}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold tracking-tight truncate">{v.name}</h4>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{v.gender}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{v.style}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  {v.accent} · {v.age}
                </p>
              </div>
            </div>

            <p className="text-xs text-foreground/80 mt-3 line-clamp-2">"{v.tagline}"</p>

            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Best for</span>
              <span className="text-[11px] font-medium text-foreground/90 truncate">{v.bestFor}</span>
            </div>

            <div className="mt-3 h-6 flex items-end gap-0.5">
              {Array.from({ length: 32 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex-1 rounded-full transition-all",
                    isPlaying ? "bg-primary animate-pulse" : active ? "bg-primary/70" : "bg-muted group-hover:bg-primary/30",
                  )}
                  style={{
                    height: `${25 + Math.sin(i * 0.7 + v.id.length) * 25 + Math.cos(i * 1.3) * 20}%`,
                  }}
                />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
