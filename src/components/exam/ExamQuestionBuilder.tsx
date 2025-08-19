import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, GripVertical } from "lucide-react";

interface Question {
  id: string;
  type: "multiple_choice" | "fill_blank" | "written" | "poll" | "true_false" | "complete" | "matching" | "translate" | "paragraph";
  text: string;
  data: any;
  points: number;
  orderIndex: number;
}

interface Props {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  onRemove: () => void;
  language: "english" | "arabic";
}

const ExamQuestionBuilder = ({ question, onUpdate, onRemove, language }: Props) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const questionTypes = [
    { value: "multiple_choice", label: "Choose (Multiple Choice)" },
    { value: "fill_blank", label: "Fill in the Blank" },
    { value: "written", label: "Write (Open-ended)" },
    { value: "poll", label: "Poll" },
    { value: "true_false", label: "Right and False" },
    { value: "complete", label: "Complete the Phrase" },
    { value: "matching", label: "Matching" },
    { value: "translate", label: "Translate" },
    { value: "paragraph", label: "Paragraph Reading" }
  ];

  const updateQuestionData = (key: string, value: any) => {
    onUpdate({
      data: {
        ...question.data,
        [key]: value
      }
    });
  };

  const renderQuestionTypeFields = () => {
    switch (question.type) {
      case "multiple_choice":
      case "poll":
        return (
          <div className="space-y-3">
            <Label>Answer Options</Label>
            {(question.data.options || []).map((option: string, index: number) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(question.data.options || [])];
                    newOptions[index] = e.target.value;
                    updateQuestionData('options', newOptions);
                  }}
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  onClick={() => {
                    const newOptions = (question.data.options || []).filter((_: any, i: number) => i !== index);
                    updateQuestionData('options', newOptions);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              onClick={() => {
                updateQuestionData('options', [...(question.data.options || []), '']);
              }}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Option
            </Button>
            
            {question.type === "multiple_choice" && (
              <div>
                <Label>Correct Answer</Label>
                <Select
                  value={question.data.correctAnswer?.toString() || ""}
                  onValueChange={(value) => updateQuestionData('correctAnswer', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct option" />
                  </SelectTrigger>
                  <SelectContent>
                    {(question.data.options || []).map((option: string, index: number) => (
                      <SelectItem key={index} value={index.toString()}>
                        Option {index + 1}: {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      case "fill_blank":
        return (
          <div className="space-y-3">
            <div>
              <Label>Correct Answer</Label>
              <Input
                value={question.data.correctAnswer || ""}
                onChange={(e) => updateQuestionData('correctAnswer', e.target.value)}
                placeholder="Enter the correct answer..."
              />
            </div>
            <div>
              <Label>Case Sensitive</Label>
              <Select
                value={question.data.caseSensitive ? "true" : "false"}
                onValueChange={(value) => updateQuestionData('caseSensitive', value === "true")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "true_false":
        return (
          <div>
            <Label>Correct Answer</Label>
            <Select
              value={question.data.correctAnswer?.toString() || ""}
              onValueChange={(value) => updateQuestionData('correctAnswer', value === "true")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "matching":
        return (
          <div className="space-y-4">
            <Label>Matching Pairs</Label>
            {(question.data.pairs || []).map((pair: any, index: number) => (
              <div key={index} className="grid grid-cols-2 gap-2">
                <Input
                  value={pair.left || ""}
                  onChange={(e) => {
                    const newPairs = [...(question.data.pairs || [])];
                    newPairs[index] = { ...newPairs[index], left: e.target.value };
                    updateQuestionData('pairs', newPairs);
                  }}
                  placeholder="Left side"
                />
                <Input
                  value={pair.right || ""}
                  onChange={(e) => {
                    const newPairs = [...(question.data.pairs || [])];
                    newPairs[index] = { ...newPairs[index], right: e.target.value };
                    updateQuestionData('pairs', newPairs);
                  }}
                  placeholder="Right side"
                />
              </div>
            ))}
            <Button
              onClick={() => {
                updateQuestionData('pairs', [...(question.data.pairs || []), { left: '', right: '' }]);
              }}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Pair
            </Button>
          </div>
        );

      case "translate":
        return (
          <div className="space-y-3">
            <div>
              <Label>Translation Direction</Label>
              <Select
                value={question.data.direction || "en_to_ar"}
                onValueChange={(value) => updateQuestionData('direction', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_to_ar">English to Arabic</SelectItem>
                  <SelectItem value="ar_to_en">Arabic to English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Correct Translation</Label>
              <Input
                value={question.data.correctAnswer || ""}
                onChange={(e) => updateQuestionData('correctAnswer', e.target.value)}
                placeholder="Enter the correct translation..."
              />
            </div>
          </div>
        );

      case "complete":
        return (
          <div>
            <Label>Correct Completion</Label>
            <Input
              value={question.data.correctAnswer || ""}
              onChange={(e) => updateQuestionData('correctAnswer', e.target.value)}
              placeholder="Enter what completes the sentence..."
            />
          </div>
        );

      case "paragraph":
        return (
          <div className="space-y-4">
            <div>
              <Label>Paragraph Text</Label>
              <Textarea
                value={question.data.paragraph || ""}
                onChange={(e) => updateQuestionData('paragraph', e.target.value)}
                placeholder="Enter the paragraph text..."
                rows={4}
              />
            </div>
            <div>
              <Label>Sub-questions</Label>
              {(question.data.subQuestions || []).map((subQ: any, index: number) => (
                <div key={index} className="space-y-2 border border-border rounded-lg p-3">
                  <Input
                    value={subQ.question || ""}
                    onChange={(e) => {
                      const newSubQuestions = [...(question.data.subQuestions || [])];
                      newSubQuestions[index] = { ...newSubQuestions[index], question: e.target.value };
                      updateQuestionData('subQuestions', newSubQuestions);
                    }}
                    placeholder="Sub-question text"
                  />
                  <Input
                    value={subQ.answer || ""}
                    onChange={(e) => {
                      const newSubQuestions = [...(question.data.subQuestions || [])];
                      newSubQuestions[index] = { ...newSubQuestions[index], answer: e.target.value };
                      updateQuestionData('subQuestions', newSubQuestions);
                    }}
                    placeholder="Correct answer"
                  />
                </div>
              ))}
              <Button
                onClick={() => {
                  updateQuestionData('subQuestions', [...(question.data.subQuestions || []), { question: '', answer: '' }]);
                }}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Sub-question
              </Button>
            </div>
          </div>
        );

      case "written":
      default:
        return (
          <div>
            <Label>Sample Answer (Optional)</Label>
            <Textarea
              value={question.data.sampleAnswer || ""}
              onChange={(e) => updateQuestionData('sampleAnswer', e.target.value)}
              placeholder="Provide a sample answer for reference..."
              rows={3}
            />
          </div>
        );
    }
  };

  return (
    <Card className="p-4 bg-card border shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
          <span className="text-sm font-medium text-muted-foreground">
            Question {question.orderIndex + 1}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
          <Button onClick={onRemove} variant="ghost" size="sm" className="text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Question Type</Label>
              <Select
                value={question.type}
                onValueChange={(value: any) => onUpdate({ type: value, data: {} })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Points</Label>
              <Input
                type="number"
                value={question.points}
                onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 1 })}
                min="1"
              />
            </div>
          </div>

          <div>
            <Label>Question Text</Label>
            <Textarea
              value={question.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              placeholder="Enter your question here..."
              rows={3}
            />
          </div>

          {renderQuestionTypeFields()}
        </div>
      )}
    </Card>
  );
};

export default ExamQuestionBuilder;