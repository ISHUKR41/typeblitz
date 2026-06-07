import { useGetLessons } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Lock, CheckCircle2, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Lessons() {
  const { data: lessons, isLoading } = useGetLessons({
    query: { queryKey: ["lessons"] }
  });

  const categories = lessons ? Array.from(new Set(lessons.map(l => l.category))) : [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 flex items-center gap-4">
          <GraduationCap className="w-10 h-10 text-primary" />
          Training Modules
        </h1>
        <p className="text-xl text-muted-foreground">
          Master the keyboard from the ground up. Perfect your technique to unlock true speed.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-12">
          {[1, 2].map((i) => (
            <div key={i}>
              <div className="h-8 w-48 bg-muted rounded mb-6 animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((j) => (
                  <Card key={j} className="bg-card/50 border-border animate-pulse">
                    <CardHeader className="h-32" />
                    <CardContent className="h-24" />
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category} className="space-y-6">
              <h2 className="text-2xl font-bold capitalize flex items-center gap-2">
                {category.replace('-', ' ')}
                <Badge variant="outline" className="ml-2 font-normal text-muted-foreground">Module</Badge>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons?.filter(l => l.category === category).map((lesson) => (
                  <Card key={lesson.id} className={`bg-card border-border/50 hover:border-primary/50 transition-all group flex flex-col ${lesson.completedBy ? 'border-green-500/30 bg-green-500/5' : ''}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="bg-secondary text-secondary-foreground font-mono">
                          Lesson {lesson.order}
                        </Badge>
                        {lesson.completedBy ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : null}
                      </div>
                      <CardTitle className="text-xl">{lesson.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{lesson.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-mono text-primary mr-1">~{lesson.estimatedMinutes}m</span>
                        estimated time
                      </div>
                      {lesson.targetKeys && lesson.targetKeys.length > 0 && (
                        <div className="flex gap-1 mt-4 flex-wrap">
                          {lesson.targetKeys.map(k => (
                            <kbd key={k} className="px-2 py-1 bg-secondary border border-border rounded text-xs font-mono">
                              {k === ' ' ? 'Space' : k}
                            </kbd>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" variant={lesson.completedBy ? "outline" : "default"} asChild>
                        <Link href={`/lessons/${lesson.id}`}>
                          {lesson.completedBy ? "Review Lesson" : (
                            <>
                              <Play className="w-4 h-4 mr-2" /> Start Lesson
                            </>
                          )}
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
