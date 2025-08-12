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
  RefreshCw,
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
import { useQuery } from "@tanstack/react-query";
import { WordsApi } from "@/lib/api";
import { toast } from "sonner";

export default function Dictionary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const wordsQuery = useQuery({
    queryKey: ["words"],
    queryFn: WordsApi.list,
    staleTime: 0,
    refetchOnWindowFocus: true,
    initialData: sampleWords,
  });

  // Initialize data
  useEffect(() => {
    setSearchHistory(SearchHistoryManager.get());
    setFavorites(FavoritesManager.get());

    // Use latest words from backend (fallback to sample)
    const items = wordsQuery.data || sampleWords;
    setSearchResults(items.slice(0, 3));
  }, [wordsQuery.data]);

  // Handle search
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      const items = wordsQuery.data || sampleWords;
      setSearchResults(items.slice(0, 3));
      setSelectedWord(null);
      return;
    }

    setIsLoading(true);
    setShowHistory(false);

    // Simulate API delay for UX parity
    await new Promise((resolve) => setTimeout(resolve, 150));

    const items = wordsQuery.data || sampleWords;
    const lowerQuery = query.toLowerCase();
    const results = items.filter((word) =>
      word.english_translation.toLowerCase().includes(lowerQuery) ||
      word.chakma_word_script.includes(query) ||
      word.romanized_pronunciation.toLowerCase().includes(lowerQuery) ||
      word.synonyms?.some((syn) => syn.term.toLowerCase().includes(lowerQuery)) ||
      word.antonyms?.some((ant) => ant.term.toLowerCase().includes(lowerQuery))
    );

    setSearchResults(results);
    setSelectedWord(null);

    // Add to search history
    SearchHistoryManager.add(query, results.length);
    setSearchHistory(SearchHistoryManager.get());

    setIsLoading(false);
  };

  // Manual refresh to avoid stale cache
  const refetchWords = async () => {
    try {
      await wordsQuery.refetch();
      toast.success("Dictionary refreshed");
    } catch (e: any) {
      toast.error(e?.message || "Failed to refresh");
    }
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

  const loadingError = wordsQuery.isError ? (wordsQuery.error as any)?.message : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold text-foreground">
          Welcome to ChakmaLex
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover the beauty of the Chakma language through our comprehensive
          digital dictionary. Search, learn, and explore words with
          pronunciation, etymology, and cultural context.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={refetchWords} disabled={wordsQuery.isFetching}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {wordsQuery.isFetching ? "Refreshing..." : "Refresh"}
          </Button>
          {loadingError && (
            <span className="text-sm text-destructive">{loadingError}</span>
          )}
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardContent className="pt-6">
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
        {/* Optional status */}
        {wordsQuery.isFetching && (
          <div className="lg:col-span-2 text-xs text-muted-foreground">Fetching latest data...</div>
        )}
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
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-primary border-primary",
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-chakma text-chakma-primary">
                {word.chakma_word_script}
              </h3>
              <div className="text-sm text-muted-foreground">
                /{word.romanized_pronunciation}/
              </div>
            </div>
            <p className="text-lg font-medium">{word.english_translation}</p>
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
              className="h-8 w-8 p-0"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle();
              }}
              className="h-8 w-8 p-0"
            >
              {isFavorite ? (
                <Heart className="h-4 w-4 fill-current text-red-500" />
              ) : (
                <HeartOff className="h-4 w-4" />
              )}
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
              onClick={onFavoriteToggle}
            >
              {isFavorite ? (
                <Heart className="h-4 w-4 mr-2 fill-current" />
              ) : (
                <HeartOff className="h-4 w-4 mr-2" />
              )}
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
