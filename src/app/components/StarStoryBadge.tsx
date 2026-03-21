// components/StarStoryBadge.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StarStory } from "@lib/types";
import { Star } from "lucide-react";

interface StarStoryBadgeProps {
  starStory: StarStory;
}

export default function StarStoryBadge({ starStory }: StarStoryBadgeProps) {
  return (
    <Card className="border-amber-200 bg-amber-50 mt-3">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm font-semibold text-amber-700 flex items-center gap-2">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          STAR Story Detected
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 space-y-2">
        {[
          { label: "Situation", value: starStory.situation },
          { label: "Task", value: starStory.task },
          { label: "Action", value: starStory.action },
          { label: "Result", value: starStory.result },
        ].map((item, i) => (
          <div key={item.label}>
            <div className="flex gap-2 items-start">
              <Badge
                variant="outline"
                className="text-xs border-amber-300 text-amber-700 shrink-0 mt-0.5"
              >
                {item.label}
              </Badge>
              <p className="text-xs text-slate-600">{item.value}</p>
            </div>
            {i < 3 && <Separator className="mt-2 bg-amber-100" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}