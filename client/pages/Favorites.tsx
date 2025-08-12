/**
 * Favorites Page - Manage saved words
 * Features: View, search, and organize favorite words
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Search, 
  Trash2, 
  Volume2,
  BookOpen,
  Download,
  HeartOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { Word } from '@shared/types';
import { apiClient } from '@/lib/apiClient';
import { FavoritesManager, AudioManager } from '@/lib/storage';

export default function Favorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteWords, setFavoriteWords] = useState<Word[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);

  useEffect(() => {
    const favoriteIds = FavoritesManager.get();
    setFavorites(favoriteIds);

    (async () => {
      try {
        const all = await apiClient.getWords();
        const words = all.filter(w => favoriteIds.includes(w.id));
        setFavoriteWords(words);
        setFilteredWords(words);
      } catch (e) {
        console.error('Failed to load favorite words', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredWords(favoriteWords);
    } else {
      const filtered = favoriteWords.filter(word =>
        word.english_translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.chakma_word_script.includes(searchQuery) ||
        word.romanized_pronunciation.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWords(filtered);
    }
  }, [searchQuery, favoriteWords]);

  const handleRemoveFavorite = (wordId: string) => {
    FavoritesManager.remove(wordId);
    const updatedFavorites = favorites.filter(id => id !== wordId);
    setFavorites(updatedFavorites);
    
    const updatedWords = updatedFavorites.map(id => findWordById(id)).filter(Boolean) as Word[];
    setFavoriteWords(updatedWords);
  };

  const handleClearAll = () => {
    FavoritesManager.clear();
    setFavorites([]);
    setFavoriteWords([]);
    setFilteredWords([]);
  };

  const handlePlayAudio = async (url?: string) => {
    if (!url) return;
    
    try {
      await AudioManager.playAudio(url);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const exportFavorites = () => {
    const data = {
      exported_at: new Date().toISOString(),
      words: favoriteWords
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chakmalex-favorites.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Favorite Words</h1>
          <p className="text-muted-foreground">
            Your saved words collection
          </p>
        </div>
        {favoriteWords.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportFavorites}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={handleClearAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      {favoriteWords.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <HeartOff className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-6">
              Start adding words to your favorites by clicking the heart icon when browsing the dictionary.
            </p>
            <Button asChild>
              <a href="/">
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Dictionary
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="flex gap-4">
            <Card className="flex-1">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-chakma-primary">
                  {favoriteWords.length}
                </div>
                <p className="text-sm text-muted-foreground">Total Favorites</p>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-chakma-secondary">
                  {filteredWords.length}
                </div>
                <p className="text-sm text-muted-foreground">Showing</p>
              </CardContent>
            </Card>
          </div>

          {/* Favorites List */}
          {filteredWords.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No matches found</h3>
                <p className="text-muted-foreground">
                  Try searching with different terms.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredWords.map((word) => (
                <FavoriteWordCard
                  key={word.id}
                  word={word}
                  onRemove={() => handleRemoveFavorite(word.id)}
                  onPlayAudio={() => handlePlayAudio(word.audio_pronunciation_url)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface FavoriteWordCardProps {
  word: Word;
  onRemove: () => void;
  onPlayAudio: () => void;
}

function FavoriteWordCard({ word, onRemove, onPlayAudio }: FavoriteWordCardProps) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-chakma text-chakma-primary">
                {word.chakma_word_script}
              </h3>
              <div className="text-sm text-muted-foreground">
                /{word.romanized_pronunciation}/
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-medium">{word.english_translation}</h4>
              <p className="text-muted-foreground text-sm mt-1">
                {word.example_sentence}
              </p>
            </div>

            {word.synonyms && word.synonyms.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-xs text-muted-foreground mr-2">Synonyms:</span>
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
              onClick={onPlayAudio}
              className="h-8 w-8 p-0"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Heart className="h-4 w-4 fill-current" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
