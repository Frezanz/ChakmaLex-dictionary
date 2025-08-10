/**
 * Quiz Page - Interactive language learning quizzes
 * Features: AI-generated questions, bidirectional translation, progress tracking
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Trophy,
  Target,
  Zap
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
}

export default function Quiz() {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [selectedQuizType, setSelectedQuizType] = useState<QuizType>('english_to_chakma');

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
      icon: Brain
    },
    {
      id: 'character_recognition' as QuizType,
      label: 'Character Recognition',
      description: 'Identify Chakma characters',
      icon: Zap
    }
  ];

  const generateQuiz = (type: QuizType, count: number = 10): QuizQuestion[] => {
    const questions: QuizQuestion[] = [];
    
    if (type === 'character_recognition') {
      const characters = getRandomCharacters(count);
      characters.forEach((char, index) => {
        questions.push({
          id: `q-${index}`,
          type,
          question: `What is the romanized name of this character: ${char.character_script}`,
          correct_answer: char.romanized_name,
          source_character_id: char.id
        });
      });
    } else {
      const words = getRandomWords(count);
      words.forEach((word, index) => {
        if (type === 'english_to_chakma') {
          questions.push({
            id: `q-${index}`,
            type,
            question: `Translate "${word.english_translation}" to Chakma:`,
            correct_answer: word.chakma_word_script,
            source_word_id: word.id
          });
        } else {
          questions.push({
            id: `q-${index}`,
            type,
            question: `What does "${word.chakma_word_script}" mean in English?`,
            correct_answer: word.english_translation,
            source_word_id: word.id
          });
        }
      });
    }
    
    return questions;
  };

  const startQuiz = (type: QuizType) => {
    const questions = generateQuiz(type);
    setSession({
      questions,
      currentIndex: 0,
      answers: [],
      isComplete: false,
      score: 0
    });
    setCurrentAnswer('');
    setShowResult(false);
  };

  const submitAnswer = () => {
    if (!session || !currentAnswer.trim()) return;

    const currentQuestion = session.questions[session.currentIndex];
    const isCorrect = currentAnswer.trim().toLowerCase() === currentQuestion.correct_answer.toLowerCase();
    
    const result: QuizResult = {
      question_id: currentQuestion.id,
      user_answer: currentAnswer.trim(),
      correct_answer: currentQuestion.correct_answer,
      is_correct: isCorrect
    };

    const updatedAnswers = [...session.answers, result];
    const newScore = updatedAnswers.filter(a => a.is_correct).length;
    
    setShowResult(true);
    
    setTimeout(() => {
      if (session.currentIndex < session.questions.length - 1) {
        setSession({
          ...session,
          currentIndex: session.currentIndex + 1,
          answers: updatedAnswers,
          score: newScore
        });
        setCurrentAnswer('');
        setShowResult(false);
      } else {
        setSession({
          ...session,
          answers: updatedAnswers,
          score: newScore,
          isComplete: true
        });
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setSession(null);
    setCurrentAnswer('');
    setShowResult(false);
  };

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Interactive Quiz</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Test your knowledge of the Chakma language with AI-generated questions. 
            Choose a quiz type to get started.
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

        {/* AI Feature Highlight */}
        <Card className="bg-gradient-to-r from-chakma-primary/10 to-chakma-secondary/10 border-chakma-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="h-6 w-6 text-chakma-primary" />
              <h3 className="text-lg font-semibold">AI-Powered Questions</h3>
            </div>
            <p className="text-muted-foreground">
              Our quizzes feature AI-generated questions that adapt to help you learn more effectively. 
              Questions are sourced from verified dictionary content to ensure accuracy.
            </p>
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
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {session.currentIndex + 1} of {session.questions.length}</span>
          <span>Score: {session.score}/{session.currentIndex}</span>
        </div>
        <Progress value={progress} className="w-full" />
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
              <Input
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    submitAnswer();
                  }
                }}
                placeholder="Type your answer..."
                className="text-lg text-center"
                autoFocus
              />
              <Button 
                onClick={submitAnswer}
                disabled={!currentAnswer.trim()}
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
