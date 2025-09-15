import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Circle } from "lucide-react";

interface Milestone {
  id: number;
  name: string;
  icon: React.ComponentType<any>;
  status: "completed" | "current" | "pending";
  date: string;
}

interface TripMilestonesProps {
  milestones: Milestone[];
}

export function TripMilestones({ milestones }: TripMilestonesProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "current":
        return <Clock className="h-4 w-4 text-warning animate-pulse" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/20 border-success/30";
      case "current":
        return "bg-warning/20 border-warning/30";
      default:
        return "bg-muted/50 border-border";
    }
  };

  const getLineColor = (currentIndex: number, nextStatus: string) => {
    if (currentIndex === milestones.length - 1) return "";
    return nextStatus === "completed" ? "bg-success" : "bg-border";
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <span>Trip Progress Milestones</span>
        <Badge variant="outline" className="text-xs">
          {milestones.filter(m => m.status === "completed").length}/{milestones.length}
        </Badge>
      </h4>
      
      <div className="relative">
        {milestones.map((milestone, index) => {
          const IconComponent = milestone.icon;
          const isLast = index === milestones.length - 1;
          
          return (
            <div key={milestone.id} className="relative">
              <div className="flex items-start gap-4 pb-6">
                {/* Timeline Line */}
                {!isLast && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 -translate-x-1/2">
                    <div 
                      className={`w-full h-full transition-colors duration-500 ${getLineColor(index, milestones[index + 1]?.status)}`}
                    />
                  </div>
                )}
                
                {/* Milestone Icon */}
                <div className={`
                  relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center 
                  transition-all duration-300 ${getStatusColor(milestone.status)}
                  ${milestone.status === "current" ? "animate-pulse" : ""}
                `}>
                  <IconComponent className="h-5 w-5" />
                  <div className="absolute -bottom-1 -right-1">
                    {getStatusIcon(milestone.status)}
                  </div>
                </div>
                
                {/* Milestone Content */}
                <div className={`flex-1 pt-2 transition-all duration-300 ${
                  milestone.status === "current" ? "animate-fade-in" : ""
                }`}>
                  <div className="flex items-center justify-between">
                    <h5 className={`font-medium ${
                      milestone.status === "completed" ? "text-success" :
                      milestone.status === "current" ? "text-warning" : 
                      "text-muted-foreground"
                    }`}>
                      {milestone.name}
                    </h5>
                    <span className="text-xs text-muted-foreground">
                      {milestone.date}
                    </span>
                  </div>
                  
                  {milestone.status === "current" && (
                    <p className="text-xs text-muted-foreground mt-1 animate-fade-in">
                      Currently in progress...
                    </p>
                  )}
                  
                  {milestone.status === "completed" && (
                    <p className="text-xs text-success mt-1">
                      Completed successfully
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}