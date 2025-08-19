import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Question {
  id: string;
  question_type: string;
  question_text: string;
  question_data: any;
  points: number;
  order_index: number;
}

interface Props {
  question: Question;
  answer: any;
  onAnswerChange: (answer: any) => void;
  language: string;
  colorScheme?: any;
}

const ExamQuestionRenderer = ({ question, answer, onAnswerChange, language, colorScheme }: Props) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const renderQuestionInput = () => {
    switch (question.question_type) {
      case "multiple_choice":
      case "poll":
        return (
          <div className="space-y-3">
            <RadioGroup
              value={answer?.toString() || ""}
              onValueChange={(value) => onAnswerChange(parseInt(value))}
            >
              {(question.question_data.options || []).map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "fill_blank":
        return (
          <div>
            <Input
              value={answer || ""}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              className="text-lg"
            />
          </div>
        );

      case "written":
        return (
          <div>
            <Textarea
              value={answer || ""}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Write your answer here..."
              rows={6}
              className="text-base"
            />
          </div>
        );

      case "true_false":
        return (
          <div className="space-y-3">
            <RadioGroup
              value={answer?.toString() || ""}
              onValueChange={(value) => onAnswerChange(value === "true")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true" className="cursor-pointer">True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false" className="cursor-pointer">False</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case "complete":
        return (
          <div>
            <Input
              value={answer || ""}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Complete the sentence..."
              className="text-lg"
            />
          </div>
        );

      case "matching":
        const leftItems = question.question_data.pairs?.map((pair: any) => pair.left) || [];
        const rightItems = question.question_data.pairs?.map((pair: any) => pair.right) || [];
        const matches = answer || {};

        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Match the items from the left column with the right column
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Column A</h4>
                {leftItems.map((item: string, index: number) => (
                  <Card
                    key={`left-${index}`}
                    className="p-3 bg-card cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => {
                      // Simple click-to-match for mobile
                      const newMatches = { ...matches };
                      if (newMatches[index] !== undefined) {
                        delete newMatches[index];
                      } else {
                        // Find first unmatched right item
                        const usedRightItems = Object.values(newMatches);
                        const availableRight = rightItems.findIndex((_, i) => !usedRightItems.includes(i));
                        if (availableRight !== -1) {
                          newMatches[index] = availableRight;
                        }
                      }
                      onAnswerChange(newMatches);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item}</span>
                      {matches[index] !== undefined && (
                        <div className="w-3 h-3 bg-success rounded-full"></div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Column B</h4>
                {rightItems.map((item: string, index: number) => (
                  <Card
                    key={`right-${index}`}
                    className={`p-3 bg-card transition-colors ${
                      Object.values(matches).includes(index) 
                        ? 'bg-success/20 border-success' 
                        : 'hover:bg-accent/50 cursor-pointer'
                    }`}
                  >
                    <span>{item}</span>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case "translate":
        const direction = question.question_data.direction || "en_to_ar";
        const directionText = direction === "en_to_ar" ? "English to Arabic" : "Arabic to English";
        
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Translate the following text ({directionText}):
            </p>
            <Textarea
              value={answer || ""}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Enter your translation..."
              rows={4}
              className="text-base"
            />
          </div>
        );

      case "paragraph":
        return (
          <div className="space-y-6">
            {question.question_data.paragraph && (
              <Card className="p-4 bg-muted/20">
                <p className="text-base leading-relaxed">{question.question_data.paragraph}</p>
              </Card>
            )}
            
            <div className="space-y-4">
              {(question.question_data.subQuestions || []).map((subQ: any, index: number) => (
                <div key={index} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {index + 1}. {subQ.question}
                  </Label>
                  <Input
                    value={answer?.[index] || ""}
                    onChange={(e) => {
                      const newAnswer = [...(answer || [])];
                      newAnswer[index] = e.target.value;
                      onAnswerChange(newAnswer);
                    }}
                    placeholder="Enter your answer..."
                  />
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div>
            <Textarea
              value={answer || ""}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Enter your answer..."
              rows={4}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {question.question_text}
          </h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Points: {question.points}</span>
            <span className="capitalize">
              {question.question_type.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Question Input */}
      <div className="pt-4">
        {renderQuestionInput()}
      </div>

      {/* Answer Status */}
      {answer !== undefined && answer !== null && answer !== "" && (
        <div className="flex items-center gap-2 text-sm text-success">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <span>Answered</span>
        </div>
      )}
    </div>
  );
};

export default ExamQuestionRenderer;