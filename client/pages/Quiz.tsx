/**
 * Quiz Page - Interactive language learning quizzes
 * Features: Timed quizzes, multiple choice questions, progress tracking
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Trophy,
  Target,
  Zap,
  Clock,
  Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { QuizQuestion, QuizType, QuizResult } from '@shared/types';
import { sampleWords, sampleCharacters, getRandomWords, getRandomCharacters } from '@shared/sampleData';

interface QuizSession {
  questions: QuizQuestion[];
  currentIndex: number;
  answers: QuizResult[];
  isComplete: boolean;
  score: number;
  timeRemaining: number;
  options: string[];
}

export default function Quiz() {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [selectedQuizType, setSelectedQuizType] = useState<QuizType>('english_to_chakma');

  // Timer effect
  useEffect(() => {
    if (session && session.timeRemaining > 0 && !session.isComplete && !showResult) {
      const timer = setTimeout(() => {
        setSession(prev => prev ? { ...prev, timeRemaining: prev.timeRemaining - 1 } : null);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (session && session.timeRemaining === 0 && !session.isComplete) {
      // Time's up - submit current answer or mark as incorrect
      submitAnswer();
    }
  }, [session?.timeRemaining, session?.isComplete, showResult]);

  const quizTypes = [
    {
      id: 'english_to_chakma' as QuizType,
      label: 'English to Chakma',
      description: 'Translate English words to Chakma script',
      icon: Target
    },
    {
      id: 'chakma_to_english' as QuizType,
      label: 'Chakma to English',
      description: 'Translate Chakma words to English',
      icon: Zap
    },
    {
      id: 'character_recognition' as QuizType,
      label: 'Character Recognition',
      description: 'Identify Chakma characters',
      icon: Timer
    }
  ];

  const generateOptions = (correctAnswer: string, type: QuizType): string[] => {
    const options = [correctAnswer];
    
    if (type === 'character_recognition') {
      // For character recognition, use other character romanized names
      const otherChars = sampleCharacters
        .filter(char => char.romanized_name !== correctAnswer)
        .map(char => char.romanized_name);
      
      while (options.length < 4 && otherChars.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherChars.length);
        const option = otherChars.splice(randomIndex, 1)[0];
        if (!options.includes(option)) {
          options.push(option);
        }
      }
    } else {
      // For translation questions, use other words
      const otherWords = sampleWords
        .filter(word => 
          type === 'english_to_chakma' 
            ? word.chakma_word_script !== correctAnswer
            : word.english_translation !== correctAnswer
        )
        .map(word => 
          type === 'english_to_chakma' 
            ? word.chakma_word_script
            : word.english_translation
        );
      
      while (options.length < 4 && otherWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherWords.length);
        const option = otherWords.splice(randomIndex, 1)[0];
        if (!options.includes(option)) {
          options.push(option);
        }
      }
    }
    
    // Fill remaining slots with generic options if needed
    while (options.length < 4) {
      options.push(`Option ${options.length + 1}`);
    }
    
    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  };

  const generateQuiz = (type: QuizType, count: number = 10): { questions: QuizQuestion[], allOptions: string[][] } => {
    const questions: QuizQuestion[] = [];
    const allOptions: string[][] = [];
    
    if (type === 'character_recognition') {
      const characters = getRandomCharacters(count);
      characters.forEach((char, index) => {
        const question: QuizQuestion = {
          id: `q-${index}`,
          type,
          question: `What is the romanized name of this character: ${char.character_script}`,
          correct_answer: char.romanized_name,
          source_character_id: char.id
        };
        questions.push(question);
        allOptions.push(generateOptions(char.romanized_name, type));
      });
    } else {
      const words = getRandomWords(count);
      words.forEach((word, index) => {
        if (type === 'english_to_chakma') {
          const question: QuizQuestion = {
            id: `q-${index}`,
            type,
            question: `Translate "${word.english_translation}" to Chakma:`,
            correct_answer: word.chakma_word_script,
            source_word_id: word.id
          };
          questions.push(question);
          allOptions.push(generateOptions(word.chakma_word_script, type));
        } else {
          const question: QuizQuestion = {
            id: `q-${index}`,
            type,
            question: `What does "${word.chakma_word_script}" mean in English?`,
            correct_answer: word.english_translation,
            source_word_id: word.id
          };
          questions.push(question);
          allOptions.push(generateOptions(word.english_translation, type));
        }
      });
    }
    
    return { questions, allOptions };
  };

  const startQuiz = (type: QuizType) => {
    const { questions, allOptions } = generateQuiz(type);
    setSession({
      questions,
      currentIndex: 0,
      answers: [],
      isComplete: false,
      score: 0,
      timeRemaining: 60, // 60 seconds total
      options: allOptions[0] || []
    });
    setSelectedAnswer('');
    setShowResult(false);
    setSelectedQuizType(type);
  };

  const submitAnswer = () => {
    if (!session) return;

    const currentQuestion = session.questions[session.currentIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    const result: QuizResult = {
      question_id: currentQuestion.id,
      user_answer: selectedAnswer || 'No answer',
      correct_answer: currentQuestion.correct_answer,
      is_correct: isCorrect
    };

    const updatedAnswers = [...session.answers, result];
    const newScore = updatedAnswers.filter(a => a.is_correct).length;

    // Update session immediately with the new answer for correct feedback display
    setSession({
      ...session,
      answers: updatedAnswers,
      score: newScore
    });

    setShowResult(true);

    setTimeout(() => {
      if (session.currentIndex < session.questions.length - 1) {
        // Move to next question
        const { allOptions } = generateQuiz(selectedQuizType);
        setSession(prevSession => ({
          ...prevSession!,
          currentIndex: prevSession!.currentIndex + 1,
          options: allOptions[prevSession!.currentIndex + 1] || []
        }));
        setSelectedAnswer('');
        setShowResult(false);
      } else {
        // Quiz complete
        setSession(prevSession => ({
          ...prevSession!,
          isComplete: true
        }));
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setSession(null);
    setSelectedAnswer('');
    setShowResult(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Interactive Quiz</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Test your knowledge of the Chakma language with timed multiple-choice questions. 
            You have 60 seconds to complete 10 questions.
          </p>
        </div>

        {/* Quiz Type Selection */}
        <div className="grid md:grid-cols-3 gap-4">
          {quizTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card 
                key={type.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
                onClick={() => startQuiz(type.id)}
              >
                <CardHeader className="text-center">
                  <Icon className="h-12 w-12 text-chakma-primary mx-auto mb-4" />
                  <CardTitle>{type.label}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    {type.description}
                  </p>
                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Start Quiz
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quiz Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-6 w-6 text-chakma-primary" />
              <h3 className="text-lg font-semibold">Quiz Format</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-chakma-primary mb-2">10</div>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-chakma-secondary mb-2">60</div>
                <p className="text-sm text-muted-foreground">Seconds</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-chakma-accent mb-2">4</div>
                <p className="text-sm text-muted-foreground">Options</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session.isComplete) {
    const percentage = Math.round((session.score / session.questions.length) * 100);
    
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center">
          <CardHeader>
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-chakma-primary">
                {session.score}/{session.questions.length}
              </div>
              <div className="text-lg text-muted-foreground">
                {percentage}% Correct
              </div>
              <Progress value={percentage} className="w-full" />
            </div>

            <div className="space-y-2">
              {session.answers.map((answer, index) => (
                <div 
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    answer.is_correct ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {answer.is_correct ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium">Question {index + 1}</span>
                  </div>
                  {!answer.is_correct && (
                    <div className="text-sm text-muted-foreground">
                      Correct: {answer.correct_answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={() => startQuiz(selectedQuizType)} className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={resetQuiz} className="flex-1">
                Choose Different Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = session.questions[session.currentIndex];
  const progress = ((session.currentIndex + 1) / session.questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress and Timer */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Question {session.currentIndex + 1} of {session.questions.length}
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-chakma-primary" />
            <span className={cn(
              "font-mono text-lg font-bold",
              session.timeRemaining <= 10 ? "text-red-500" : "text-foreground"
            )}>
              {formatTime(session.timeRemaining)}
            </span>
          </div>
        </div>
        <Progress value={progress} className="w-full" />
        <div className="text-center">
          <Badge variant="outline">
            Score: {session.score}/{session.currentIndex}
          </Badge>
        </div>
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showResult ? (
            <div className="space-y-4">
              {/* Multiple Choice Options */}
              <div className="grid gap-3">
                {session.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === option ? "default" : "outline"}
                    className={cn(
                      "w-full p-4 h-auto text-left justify-start",
                      selectedAnswer === option && "ring-2 ring-chakma-primary"
                    )}
                    onClick={() => setSelectedAnswer(option)}
                  >
                    <span className="font-mono mr-3 text-muted-foreground">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className={cn(
                      selectedQuizType === 'english_to_chakma' && index === session.options.findIndex(opt => opt === option) 
                        ? "font-chakma" : ""
                    )}>
                      {option}
                    </span>
                  </Button>
                ))}
              </div>
              
              <Button 
                onClick={submitAnswer}
                disabled={!selectedAnswer}
                className="w-full"
              >
                Submit Answer
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              {session.answers[session.currentIndex]?.is_correct ? (
                <div className="space-y-2">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  <h3 className="text-xl font-semibold text-green-700">Correct!</h3>
                </div>
              ) : (
                <div className="space-y-2">
                  <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                  <h3 className="text-xl font-semibold text-red-700">Incorrect</h3>
                  <p className="text-muted-foreground">
                    The correct answer is: <strong>{currentQuestion.correct_answer}</strong>
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
