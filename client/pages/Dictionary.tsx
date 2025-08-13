/**
 * Dictionary Page - Main homepage for ChakmaLex
 * Features: Advanced search, word display, pronunciation, favorites
 */

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Volume2,
  Heart,
  HeartOff,
  ExternalLink,
  History,
  Sparkles,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Data and utilities
import { Word, SearchHistoryItem } from "@shared/types";
import {
  sampleWords,
  searchWords,
  sampleSearchHistory,
} from "@shared/sampleData";
import {
  SearchHistoryManager,
  FavoritesManager,
  AudioManager,
  PreferencesManager,
} from "@/lib/storage";

export default function Dictionary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [allWords, setAllWords] = useState<Word[]>(sampleWords);

  // Initialize data
  useEffect(() => {
    setSearchHistory(SearchHistoryManager.get());
    setFavorites(FavoritesManager.get());

    // Show some featured words initially
    setSearchResults(sampleWords.slice(0, 3));

    // Fetch live words from API with fallback
    (async () => {
      try {
        const { apiClient } = await import("@/lib/apiClient");
        const words = await apiClient.getWords();
        setAllWords(words as any);
        setSearchResults(words.slice(0, 3) as any);
        console.log("Successfully loaded words from API");
      } catch (e) {
        console.warn(
          "API unavailable, using sample data. This is normal in development without GitHub integration:",
          e,
        );
        // Keep using sampleWords as fallback
        setAllWords(sampleWords);
        setSearchResults(sampleWords.slice(0, 3));
      }
    })();

    // Refresh on visibility/focus to avoid stale data
    const onFocus = async () => {
      try {
        const { apiClient } = await import("@/lib/apiClient");
        const words = await apiClient.getWords();
        setAllWords(words as any);
        if (!searchQuery) setSearchResults(words.slice(0, 3) as any);
      } catch (e) {
        console.warn("Failed to refresh words from API:", e);
        // Keep existing data, don't update
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Handle search
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults((allWords.length ? allWords : sampleWords).slice(0, 3));
      setSelectedWord(null);
      return;
    }

    setIsLoading(true);
    setShowHistory(false);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const dataset = allWords.length ? allWords : sampleWords;
    const results = searchWords(query, dataset as any);
    setSearchResults(results);
    setSelectedWord(null);

    // Add to search history
    SearchHistoryManager.add(query, results.length);
    setSearchHistory(SearchHistoryManager.get());

    setIsLoading(false);
  };

  // Handle word selection
  const handleWordSelect = (word: Word) => {
    setSelectedWord(word);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (wordId: string) => {
    const isFavorite = FavoritesManager.toggle(wordId);
    setFavorites(FavoritesManager.get());
    return isFavorite;
  };

  // Handle audio play
  const handlePlayAudio = async (url?: string) => {
    if (!url) return;

    try {
      await AudioManager.playAudio(url);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  // Handle search from history
  const handleHistorySearch = (query: string) => {
    setSearchQuery(query);
    setShowHistory(false);
    handleSearch(query);
    searchInputRef.current?.focus();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-3 md:space-y-6">
      {/* Hero Section */}
      <div className="relative text-center space-y-3 md:space-y-4 py-6 px-4 md:py-12 md:px-8 rounded-2xl overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-chakma-primary/30 via-chakma-secondary/20 to-chakma-accent/30 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-primary/10 via-transparent to-secondary/10"></div>
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-chakma-primary/10 rounded-full blur-2xl animate-bounce"></div>
          <div
            className="absolute bottom-0 right-1/4 w-40 h-40 bg-chakma-secondary/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-chakma-accent/10 rounded-full blur-xl animate-ping"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 md:mb-4 bg-gradient-to-r from-chakma-primary to-chakma-accent bg-clip-text text-transparent animate-fade-in">
            Welcome to ChakmaLex
          </h1>
          <p
            className="text-sm md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            Discover the beauty of the Chakma language through our comprehensive
            digital dictionary. Search, learn, and explore words with
            pronunciation, etymology, and cultural context.
          </p>
        </div>

        {/* Subtle border glow */}
        <div className="absolute inset-0 rounded-2xl border border-chakma-primary/20 shadow-lg shadow-chakma-primary/5"></div>
      </div>

      {/* Search Section */}
      <Card>
        <CardContent className="pt-3 md:pt-6 px-3 md:px-6">
          <div className="relative">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search in English, Chakma script, or romanized text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(searchQuery);
                    }
                  }}
                  onFocus={() => setShowHistory(true)}
                  className="pl-10 pr-12 h-12 text-lg"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => {
                      setSearchQuery("");
                      handleSearch("");
                    }}
                  >
                    ×
                  </Button>
                )}
              </div>
              <Button
                onClick={() => handleSearch(searchQuery)}
                disabled={isLoading}
                className="h-12 px-6"
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Search History Dropdown */}
            {showHistory && searchHistory.length > 0 && (
              <Card className="absolute top-full left-0 right-0 mt-2 z-50 border shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Recent Searches
                    </span>
                  </div>
                  <div className="space-y-1">
                    {searchHistory.slice(0, 5).map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleHistorySearch(item.query)}
                        className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors flex items-center justify-between"
                      >
                        <span>{item.query}</span>
                        <Badge variant="secondary" className="text-xs">
                          {item.result_count} results
                        </Badge>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Search Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {searchQuery ? `Results for "${searchQuery}"` : "Featured Words"}
            </h2>
            {searchResults.length > 0 && (
              <Badge variant="outline">
                {searchResults.length}{" "}
                {searchResults.length === 1 ? "word" : "words"}
              </Badge>
            )}
          </div>

          {searchResults.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No words found</h3>
                <p className="text-muted-foreground">
                  Try searching with different terms or check your spelling.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {searchResults.map((word) => (
                <WordCard
                  key={word.id}
                  word={word}
                  isSelected={selectedWord?.id === word.id}
                  isFavorite={favorites.includes(word.id)}
                  onSelect={() => handleWordSelect(word)}
                  onFavoriteToggle={() => handleFavoriteToggle(word.id)}
                  onPlayAudio={() =>
                    handlePlayAudio(word.audio_pronunciation_url)
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Word Details */}
        <div className="lg:sticky lg:top-24">
          {selectedWord ? (
            <WordDetails
              word={selectedWord}
              isFavorite={favorites.includes(selectedWord.id)}
              onFavoriteToggle={() => handleFavoriteToggle(selectedWord.id)}
              onPlayAudio={() =>
                handlePlayAudio(selectedWord.audio_pronunciation_url)
              }
            />
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a word</h3>
                <p className="text-muted-foreground">
                  Click on any word from the search results to see detailed
                  information, pronunciation, and examples.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Word Card Component
interface WordCardProps {
  word: Word;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onFavoriteToggle: () => void;
  onPlayAudio: () => void;
}

function WordCard({
  word,
  isSelected,
  isFavorite,
  onSelect,
  onFavoriteToggle,
  onPlayAudio,
}: WordCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    onFavoriteToggle();

    // Reset animation after completion - faster
    setTimeout(() => setIsAnimating(false), 300);
  };
  return (
    <Card
      className={cn(
        "word-card cursor-pointer",
        isSelected && "word-card-selected",
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-chakma chakma-text">
                {word.chakma_word_script}
              </h3>
              <div className="text-sm text-muted-foreground">
                /{word.romanized_pronunciation}/
              </div>
            </div>
            <p className="text-lg font-medium english-translation">
              {word.english_translation}
            </p>
            {word.synonyms && word.synonyms.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {word.synonyms.slice(0, 3).map((syn, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {syn.term}
                  </Badge>
                ))}
                {word.synonyms.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{word.synonyms.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onPlayAudio();
              }}
              className="h-8 w-8 p-0 transition-fast"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteClick}
              className="h-8 w-8 p-0 transition-fast"
            >
              <Heart
                className={cn(
                  "h-4 w-4 heart-icon transition-all duration-300",
                  isFavorite ? "heart-favorite" : "heart-unfavorite",
                  isAnimating &&
                    (isFavorite ? "animate-fill" : "animate-bounce"),
                )}
              />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Word Details Component
interface WordDetailsProps {
  word: Word;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onPlayAudio: () => void;
}

function WordDetails({
  word,
  isFavorite,
  onFavoriteToggle,
  onPlayAudio,
}: WordDetailsProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFavoriteClick = () => {
    setIsAnimating(true);
    onFavoriteToggle();

    // Reset animation after completion - faster
    setTimeout(() => setIsAnimating(false), 300);
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-chakma text-chakma-primary">
              {word.chakma_word_script}
            </CardTitle>
            <div className="text-muted-foreground">
              /{word.romanized_pronunciation}/
            </div>
            <h2 className="text-2xl font-semibold">
              {word.english_translation}
            </h2>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onPlayAudio}>
              <Volume2 className="h-4 w-4 mr-2" />
              Play
            </Button>
            <Button
              variant={isFavorite ? "default" : "outline"}
              size="sm"
              onClick={handleFavoriteClick}
              className="transition-all duration-200 hover:scale-105"
            >
              <Heart
                className={cn(
                  "h-4 w-4 mr-2 heart-icon transition-all duration-300",
                  isFavorite ? "heart-favorite" : "heart-unfavorite",
                  isAnimating &&
                    (isFavorite ? "animate-fill" : "animate-bounce"),
                )}
              />
              {isFavorite ? "Favorited" : "Favorite"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Synonyms */}
        {word.synonyms && word.synonyms.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Synonyms</h3>
            <div className="flex flex-wrap gap-2">
              {word.synonyms.map((syn, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className={cn(syn.language === "chakma" && "font-chakma")}
                >
                  {syn.term}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Antonyms */}
        {word.antonyms && word.antonyms.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Antonyms</h3>
            <div className="flex flex-wrap gap-2">
              {word.antonyms.map((ant, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={cn(ant.language === "chakma" && "font-chakma")}
                >
                  {ant.term}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Example Sentence */}
        <div>
          <h3 className="font-medium mb-2">Example Usage</h3>
          <p className="text-muted-foreground italic">
            {word.example_sentence}
          </p>
        </div>

        {/* Etymology */}
        <div>
          <h3 className="font-medium mb-2">Etymology</h3>
          <p className="text-muted-foreground">{word.etymology}</p>
        </div>

        {/* Visual Explanation */}
        {word.explanation_media && (
          <div>
            <h3 className="font-medium mb-2">Visual Reference</h3>
            {word.explanation_media.type === "url" ? (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={word.explanation_media.value}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Reference
                </a>
              </Button>
            ) : (
              <img
                src={word.explanation_media.value}
                alt={`Visual explanation for ${word.english_translation}`}
                className="rounded-lg max-w-full h-auto"
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
