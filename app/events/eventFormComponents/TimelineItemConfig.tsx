import React from "react";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TimelineItemType } from "./types";

interface TimelineItemConfigProps {
  item: TimelineItemType;
  index: number;
  update: (index: number, newValue: TimelineItemType) => void;
  remove: (index: number) => void;
}

export const TimelineItemConfig: React.FC<TimelineItemConfigProps> = ({
  item,
  index,
  update,
  remove,
}) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">Agenda Item #{index + 1}</h4>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !item.date && "text-muted-foreground",
                    )}
                  >
                    {item.date ? (
                      format(item.date, "MM/dd/yyyy")
                    ) : (
                      <span>Select date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={item.date}
                    onSelect={(date) => {
                      if (date) {
                        update(index, { ...item, date });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <FormLabel>Time</FormLabel>
              <Input
                placeholder="e.g. 9:00 AM"
                value={item.time}
                onChange={(e) =>
                  update(index, { ...item, time: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <FormLabel>Title</FormLabel>
            <Input
              placeholder="e.g. Opening Ceremony"
              value={item.title}
              onChange={(e) =>
                update(index, { ...item, title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder="Describe this agenda item"
              value={item.description || ""}
              onChange={(e) =>
                update(index, { ...item, description: e.target.value })
              }
              className="min-h-20"
            />
          </div>

          <div className="space-y-2">
            <FormLabel>Speaker (Optional)</FormLabel>
            <Input
              placeholder="e.g. John Doe, CTO at Company"
              value={item.speaker || ""}
              onChange={(e) =>
                update(index, { ...item, speaker: e.target.value })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
