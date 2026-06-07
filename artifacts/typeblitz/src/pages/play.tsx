import { lazy, Suspense } from "react";
import { useRoute } from "wouter";
import { useGetGame } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";

// Lazy load games
const WordBlitzGame = lazy(() => import("@/components/games/WordBlitzGame"));
const CodeRainGame = lazy(() => import("@/components/games/CodeRainGame"));
const SentenceSprintGame = lazy(() => import("@/components/games/SentenceSprintGame"));
const CarRacerGame = lazy(() => import("@/components/games/CarRacerGame"));
const ZombieSiegeGame = lazy(() => import("@/components/games/ZombieSiegeGame"));
const LetterBlasterGame = lazy(() => import("@/components/games/LetterBlasterGame"));

export default function Play() {
  const [, params] = useRoute("/games/:id");
  const gameId = params?.id;

  const { data: game, isLoading } = useGetGame(gameId || "", {
    query: { enabled: !!gameId }
  });

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>;
  }

  if (!game) {
    return <div className="text-center py-24 text-muted-foreground">Game not found.</div>;
  }

  const renderGame = () => {
    switch (gameId) {
      case "word-blitz":
        return <WordBlitzGame game={game} />;
      case "code-rain":
        return <CodeRainGame game={game} />;
      case "sentence-sprint":
        return <SentenceSprintGame game={game} />;
      case "car-racer":
        return <CarRacerGame game={game} />;
      case "zombie-siege":
        return <ZombieSiegeGame game={game} />;
      case "letter-blaster":
        return <LetterBlasterGame game={game} />;
      default:
        // Fallback to word blitz logic if unknown
        return <WordBlitzGame game={game} />;
    }
  };

  return (
    <div className="flex-1 w-full bg-background relative overflow-hidden">
      <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>}>
        {renderGame()}
      </Suspense>
    </div>
  );
}
