"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ScorecardCreator from "./scorecard-creator";
import ScorecardManager from "./scorecard-manager";
import { toast } from "sonner";
import {
  ChevronRight,
  Trophy,
  Users,
  Tag,
  FileText,
  CheckCircle,
  LayoutList,
} from "lucide-react";

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    color: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
    icon: FileText,
  },
  active: {
    label: "Active",
    color: "bg-green-500/20 text-green-400 border border-green-500/30",
    icon: CheckCircle,
  },
  completed: {
    label: "Completed",
    color: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    icon: Trophy,
  },
};

export default function ScorecardsList({ eventId }) {
  const [scorecards, setScorecards] = useState([]);
  const [selectedScorecard, setSelectedScorecard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScorecards();
  }, [eventId]);

  const fetchScorecards = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/scorecards?eventId=${eventId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch scorecards`);
      }
      const data = await response.json();
      setScorecards(data);
    } catch (error) {
      toast.error(error.message || "Failed to load scorecards");
    } finally {
      setLoading(false);
    }
  };

  if (selectedScorecard) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setSelectedScorecard(null)}
          className="gap-2"
        >
          ← Back to Scorecards
        </Button>
        <ScorecardManager
          scorecardId={selectedScorecard}
          onDelete={() => {
            setScorecards(scorecards.filter((s) => s._id !== selectedScorecard));
            setSelectedScorecard(null);
            fetchScorecards();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <LayoutList className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold">Event Scorecards</h3>
          {!loading && scorecards.length > 0 && (
            <span className="text-xs bg-purple-500/15 text-purple-400 border border-purple-500/25 px-2 py-0.5 rounded-full font-medium">
              {scorecards.length}
            </span>
          )}
        </div>
        <ScorecardCreator
          eventId={eventId}
          onScorecardCreated={(newScorecard) => {
            setScorecards([...scorecards, newScorecard]);
          }}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading scorecards...</p>
          </div>
        </div>
      ) : scorecards.length === 0 ? (
        <Card className="border-dashed border-white/15 bg-white/2">
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Trophy className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <p className="font-semibold text-base mb-1">No scorecards yet</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Create a scorecard to track and rank participant performance
                during your event
              </p>
            </div>
            <ScorecardCreator
              eventId={eventId}
              onScorecardCreated={(newScorecard) =>
                setScorecards([...scorecards, newScorecard])
              }
            />
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          {scorecards.map((scorecard) => {
            const statusCfg =
              STATUS_CONFIG[scorecard.status] || STATUS_CONFIG.draft;
            const StatusIcon = statusCfg.icon;
            const maxPossible = scorecard.categories?.reduce(
              (s, c) => s + c.maxScore,
              0
            );
            const topParticipant =
              scorecard.participants?.length > 0
                ? scorecard.participants.reduce((best, p) =>
                    p.totalScore > best.totalScore ? p : best
                  )
                : null;

            return (
              <Card
                key={scorecard._id}
                className="group relative overflow-hidden border-white/10 hover:border-purple-500/40 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-purple-500/5"
                onClick={() => {
                  setSelectedScorecard(scorecard._id);
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
                <div className="p-5 relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title & Status */}
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-base group-hover:text-purple-300 transition-colors">
                          {scorecard.title}
                        </h4>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                      </div>

                      {/* Description */}
                      {scorecard.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                          {scorecard.description}
                        </p>
                      )}

                      {/* Stats row */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {scorecard.categories?.length || 0} categories
                          {maxPossible > 0 && (
                            <span className="text-muted-foreground/60">
                              ({maxPossible} pts)
                            </span>
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {scorecard.participants?.length || 0} participants
                        </span>
                        {topParticipant && (
                          <span className="flex items-center gap-1 text-yellow-500">
                            🥇 {topParticipant.name} —{" "}
                            {topParticipant.totalScore} pts
                          </span>
                        )}
                      </div>

                      {/* Category chips */}
                      {scorecard.categories?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {scorecard.categories.slice(0, 4).map((cat, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs text-muted-foreground"
                            >
                              {cat.name}
                            </span>
                          ))}
                          {scorecard.categories.length > 4 && (
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs text-muted-foreground">
                              +{scorecard.categories.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
