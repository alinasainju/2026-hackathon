// components/StarStoryBadge.tsx
import { StarStory } from "@lib/types";
import { Star } from "lucide-react";

interface StarStoryBadgeProps {
  starStory: StarStory;
}

export default function StarStoryBadge({ starStory }: StarStoryBadgeProps) {
  return (
    <div className="border border-brand-purple/20 bg-brand-purple/5 rounded-lg p-3.5 space-y-2.5 mt-1">
      <div className="flex items-center gap-1.5 mb-1">
        <Star className="w-3.5 h-3.5 fill-brand-purple text-brand-purple" />
        <p className="text-xs font-semibold text-brand-purple">STAR Story</p>
      </div>
      {[
        { label: "Situation", value: starStory.situation },
        { label: "Task",      value: starStory.task      },
        { label: "Action",    value: starStory.action    },
        { label: "Result",    value: starStory.result    },
      ].map((item) => (
        <div key={item.label}>
          <p className="text-[10px] font-semibold text-brand-purple/70 uppercase tracking-wide mb-0.5">{item.label}</p>
          <p className="text-xs text-brand-grey leading-relaxed">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
