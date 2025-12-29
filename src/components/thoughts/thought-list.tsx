import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThoughtCard } from "./thought-card";
import type { Thought } from "@/lib/db";

interface ThoughtListProps {
  thoughts: Thought[];
}

export function ThoughtList({ thoughts }: ThoughtListProps) {
  if (thoughts.length === 0) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Thoughts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your recent thoughts will appear here. Start by capturing your first
            thought above.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Separate pinned from regular
  const pinnedThoughts = thoughts.filter((t) => t.isPinned);
  const regularThoughts = thoughts.filter((t) => !t.isPinned);

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-foreground">Recent Thoughts</h2>

      {pinnedThoughts.length > 0 && (
        <div className="space-y-2">
          {pinnedThoughts.map((thought) => (
            <ThoughtCard key={thought.id} thought={thought} />
          ))}
        </div>
      )}

      {regularThoughts.length > 0 && (
        <div className="space-y-2">
          {regularThoughts.map((thought) => (
            <ThoughtCard key={thought.id} thought={thought} />
          ))}
        </div>
      )}
    </div>
  );
}
