"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Youtube, Radio, Maximize2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LiveStreamViewer({ eventId }) {
  const [youtubeId, setYoutubeId] = useState(null);
  const [streamUrl, setStreamUrl]  = useState("");
  const [loading, setLoading]      = useState(true);

  useEffect(() => {
    if (!eventId) return;
    fetch(`/api/events/${eventId}/livestream`)
      .then((r) => r.json())
      .then((data) => {
        setYoutubeId(data.youtubeId || null);
        setStreamUrl(data.liveStreamUrl || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return null; // don't flash anything while loading
  if (!youtubeId) return null; // no stream set — don't render section

  return (
    <Card className="border-red-500/20 bg-gradient-to-br from-red-950/20 to-background overflow-hidden shadow-sm">
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <Youtube className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Live Stream</h2>
              <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
                <Radio className="w-3 h-3 animate-pulse" />
                YouTube Live / Video
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild className="h-8 gap-1.5 text-xs">
              <a href={streamUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3" />
                Open on YouTube
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* 16:9 embedded player */}
      <div className="relative w-full bg-black" style={{ paddingTop: "56.25%" }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
          title="Event Live Stream"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>

      <div className="px-5 py-3 text-xs text-muted-foreground border-t border-white/5">
        🎥 This stream is provided by the event organizer. If the stream has not started yet, the video will appear when the organizer goes live.
      </div>
    </Card>
  );
}
