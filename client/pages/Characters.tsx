/**
 * Characters Page - Learn Chakma script components
 * Features: Alphabets, vowels, diacritics, numbers, symbols with audio
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Volume2, BookOpen, Type } from "lucide-react";
import { cn } from "@/lib/utils";

import { Character, CharacterType } from "@shared/types";
import { AudioManager } from "@/lib/storage";
import { subscribeContent, getCharactersByType } from "@/lib/content";

export default function Characters() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<CharacterType>("alphabet");
  const [byType, setByType] = useState(getCharactersByType());

  useEffect(() => {
    const unsubscribe = subscribeContent(() => {
      setByType(getCharactersByType());
      // Keep selection valid
      if (selectedCharacter) {
        const stillExists = Object.values(getCharactersByType()).flat().some((c) => c.id === selectedCharacter.id);
        if (!stillExists) setSelectedCharacter(null);
      }
    });
    return unsubscribe;
  }, [selectedCharacter]);

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handlePlayAudio = async (url?: string) => {
    if (!url) return;

    try {
      await AudioManager.playAudio(url);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const characterTypes = [
    { id: "alphabet" as CharacterType, label: "Alphabets", icon: Type },
    { id: "vowel" as CharacterType, label: "Vowels", icon: BookOpen },
    { id: "diacritic" as CharacterType, label: "Diacritics", icon: Type },
    { id: "ordinal" as CharacterType, label: "Numbers", icon: BookOpen },
    { id: "symbol" as CharacterType, label: "Symbols", icon: Type },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          Learn Chakma Script
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Master the Chakma writing system by learning individual characters,
          their sounds, and usage. Click on any character to hear its
          pronunciation.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Character Categories */}
        <div className="lg:col-span-2">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as CharacterType)}
          >
            <TabsList className="grid w-full grid-cols-5">
              {characterTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <TabsTrigger
                    key={type.id}
                    value={type.id}
                    className="text-xs"
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {type.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {characterTypes.map((type) => (
              <TabsContent key={type.id} value={type.id} className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <type.icon className="h-5 w-5" />
                      {type.label}
                      <Badge variant="outline">
                        {byType[type.id]?.length || 0} characters
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="character-grid">
                      {(byType[type.id] || []).map((character) => (
                        <CharacterCard
                          key={character.id}
                          character={character}
                          isSelected={selectedCharacter?.id === character.id}
                          onSelect={() => handleCharacterSelect(character)}
                          onPlayAudio={() =>
                            handlePlayAudio(character.audio_pronunciation_url)
                          }
                        />
                      ))}
                    </div>

                    {(!byType[type.id] || byType[type.id].length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Type className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No {type.label.toLowerCase()} available yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Character Details */}
        <div className="lg:sticky lg:top-24">
          {selectedCharacter ? (
            <CharacterDetails
              character={selectedCharacter}
              onPlayAudio={() =>
                handlePlayAudio(selectedCharacter.audio_pronunciation_url)
              }
            />
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Type className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a character</h3>
                <p className="text-muted-foreground">
                  Click on any character to see detailed information and hear
                  its pronunciation.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Character Card Component
interface CharacterCardProps {
  character: Character;
  isSelected: boolean;
  onSelect: () => void;
  onPlayAudio: () => void;
}

function CharacterCard({
  character,
  isSelected,
  onSelect,
  onPlayAudio,
}: CharacterCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md text-center relative group",
        isSelected && "ring-2 ring-primary border-primary",
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="text-3xl font-chakma text-chakma-primary mb-2">
          {character.character_script}
        </div>
        <div className="text-sm font-medium mb-1">
          {character.romanized_name}
        </div>
        <Badge variant="secondary" className="text-xs">
          {character.character_type}
        </Badge>

        {/* Audio button overlay */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onPlayAudio();
          }}
        >
          <Volume2 className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
}

// Character Details Component
interface CharacterDetailsProps {
  character: Character;
  onPlayAudio: () => void;
}

function CharacterDetails({ character, onPlayAudio }: CharacterDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="text-center space-y-4">
          <div className="text-6xl font-chakma text-chakma-primary">
            {character.character_script}
          </div>
          <div>
            <CardTitle className="text-xl">
              {character.romanized_name}
            </CardTitle>
            <Badge variant="outline" className="mt-2">
              {character.character_type}
            </Badge>
          </div>
          <Button onClick={onPlayAudio} className="w-full">
            <Volume2 className="h-4 w-4 mr-2" />
            Play Pronunciation
          </Button>
        </div>
      </CardHeader>

      {character.description && (
        <CardContent>
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-muted-foreground">{character.description}</p>
        </CardContent>
      )}
    </Card>
  );
}
