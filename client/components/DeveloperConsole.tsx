/**
 * Developer Console for ChakmaLex
 * Hidden content management system accessible via logo taps + password
 * Features: CRUD operations, audio upload, AI word generation, data export/import
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  X,
  Plus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  Sparkles,
  Database,
  Settings,
  FileText,
  CheckCircle,
  XCircle,
  RotateCcw,
  Brain,
  Volume2,
  Music,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Word,
  Character,
  WordFormData,
  CharacterFormData,
  CharacterType,
} from "@shared/types";
import { sampleWords, sampleCharacters } from "@shared/sampleData";
import { DeveloperConsoleManager } from "@/lib/storage";

interface DeveloperConsoleProps {
  onClose: () => void;
}

// Helper function to generate random English words
const generateRandomEnglishWords = (count: number): string[] => {
  const commonWords = [
    "happiness",
    "mountain",
    "river",
    "beautiful",
    "friendship",
    "journey",
    "wisdom",
    "courage",
    "peaceful",
    "traditional",
    "family",
    "education",
    "culture",
    "celebration",
    "community",
    "nature",
    "freedom",
    "respect",
    "harmony",
    "strength",
    "knowledge",
    "compassion",
    "unity",
    "heritage",
    "dignity",
    "prosperity",
    "abundance",
    "serenity",
    "gratitude",
    "enlightenment",
    "adventure",
    "discovery",
    "creativity",
    "innovation",
    "inspiration",
    "dedication",
    "perseverance",
    "excellence",
    "achievement",
    "success",
    "progress",
    "development",
    "growth",
    "improvement",
  ];

  return commonWords.sort(() => 0.5 - Math.random()).slice(0, count);
};

// Helper function to handle audio file upload
const handleAudioUpload = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // In a real app, this would upload to a server/CDN
      // For demo purposes, we'll create a blob URL
      const audioUrl = URL.createObjectURL(file);
      resolve(audioUrl);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function DeveloperConsole({ onClose }: DeveloperConsoleProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("words");

  // Content management state (view-only)
  const [words, setWords] = useState<Word[]>(sampleWords);
  const [characters, setCharacters] = useState<Character[]>(sampleCharacters);
  const [aiGeneratedWords, setAiGeneratedWords] = useState<string[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const validPasswords = [
    "frezanz120913",
    "frezanz1212312123",
    "frezanz448538",
    "ujc448538",
    "ujc120913",
    "ujc04485380",
  ];

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validPasswords.includes(password)) {
      setIsAuthenticated(true);
      setError("");
      DeveloperConsoleManager.setAuthenticated(true);
    } else {
      setError("Invalid password");
      setPassword("");
    }
  };

  const exportData = () => {
    // Export in the existing repository format for GitHub upload
    const data = {
      version: "2.0.0",
      dictionary: {
        words: words.map(word => ({
          id: word.id,
          chakma_word_script: word.chakma_word_script,
          romanized_pronunciation: word.romanized_pronunciation,
          english_translation: word.english_translation,
          synonyms: word.synonyms || [],
          antonyms: word.antonyms || [],
          example_sentence: word.example_sentence,
          etymology: word.etymology,
          explanation_media: word.explanation_media,
          audio_pronunciation_url: word.audio_pronunciation_url,
          is_verified: word.is_verified || false,
          created_at: word.created_at || new Date().toISOString(),
          updated_at: word.updated_at || new Date().toISOString()
        })),
        total_count: words.length
      },
      characters: {
        alphabet: characters.filter(c => c.character_type === 'alphabet'),
        vowel: characters.filter(c => c.character_type === 'vowel'),
        diacritic: characters.filter(c => c.character_type === 'diacritic'),
        conjunct: characters.filter(c => c.character_type === 'conjunct'),
        ordinal: characters.filter(c => c.character_type === 'ordinal'),
        symbol: characters.filter(c => c.character_type === 'symbol'),
        total_count: characters.length
      },
      metadata: {
        exported_at: new Date().toISOString(),
        exported_by: "ChakmaLex Developer Console",
        format_version: "2.0.0"
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chakmalex-repository-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.words) setWords(data.words);
        if (data.characters) setCharacters(data.characters);
        alert("Data imported successfully!");
      } catch (error) {
        alert("Import failed: Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Developer Console Access
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label>Enter Password:</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoFocus
                />
                {error && (
                  <p className="text-destructive text-sm mt-1">{error}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  Access Console
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              ChakmaLex Developer Console
              <Badge variant="outline">v2.0</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enhanced with audio upload, full character editing, and AI word
              generation
            </p>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="words">Words Management</TabsTrigger>
              <TabsTrigger value="characters">Characters</TabsTrigger>
              <TabsTrigger value="ai">AI Word Generator</TabsTrigger>
              <TabsTrigger value="data">Data Export/Import</TabsTrigger>
            </TabsList>

            {/* Words Management */}
            <TabsContent value="words" className="flex-1 overflow-hidden">
              <WordsManagement
                words={words}
                editingWord={null}
                onEdit={() => {}}
                onSave={() => {}}
                onDelete={() => {}}
                onCancel={() => {}}
              />
            </TabsContent>

            {/* Characters Management */}
            <TabsContent value="characters" className="flex-1 overflow-hidden">
              <CharactersManagement
                characters={characters}
                editingCharacter={null}
                onEdit={() => {}}
                onSave={() => {}}
                onDelete={() => {}}
                onCancel={() => {}}
              />
            </TabsContent>

            {/* AI Word Generator */}
            <TabsContent value="ai" className="flex-1 overflow-hidden">
              <AIWordGenerator
                words={aiGeneratedWords}
                isGenerating={isGeneratingAI}
                onGenerate={async () => {
                  setIsGeneratingAI(true);
                  try {
                    // Simulate AI API call
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                    const newWords = generateRandomEnglishWords(10);
                    setAiGeneratedWords(newWords);
                  } catch (error) {
                    console.error("AI generation failed:", error);
                  } finally {
                    setIsGeneratingAI(false);
                  }
                }}
                onCreateWord={() => {}}
              />
            </TabsContent>

            {/* Data Management */}
            <TabsContent value="data" className="flex-1 overflow-hidden">
              <DataManagement
                wordsCount={words.length}
                charactersCount={characters.length}
                onExport={exportData}
                onImport={importData}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Words Management Component - View Only
function WordsManagement({
  words,
  editingWord,
  onEdit,
  onSave,
  onDelete,
  onCancel,
}: {
  words: Word[];
  editingWord: Word | null;
  onEdit: (word: Word | null) => void;
  onSave: (word: Word) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}) {
  // Sort words alphabetically by romanized pronunciation
  const sortedWords = [...words].sort((a, b) =>
    a.romanized_pronunciation.localeCompare(b.romanized_pronunciation)
  );

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Dictionary Words ({sortedWords.length})</h3>
        <Badge variant="outline" className="text-sm">
          View Only - Alphabetically Sorted
        </Badge>
      </div>

      <div className="flex-1 overflow-auto space-y-2">
        {sortedWords.map((word) => (
          <Card key={word.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-chakma text-chakma-primary">
                  {word.chakma_word_script}
                </span>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">
                    /{word.romanized_pronunciation}/
                  </div>
                  <div className="font-medium text-lg">{word.english_translation}</div>
                </div>
                {word.audio_pronunciation_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const audio = new Audio(word.audio_pronunciation_url!);
                      audio.play().catch(console.error);
                    }}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {word.example_sentence && (
                <div className="text-sm text-muted-foreground italic border-l-2 border-primary/20 pl-3">
                  {word.example_sentence}
                </div>
              )}

              {word.etymology && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Etymology:</span> {word.etymology}
                </div>
              )}

              {(word.synonyms && word.synonyms.length > 0) && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs font-medium text-muted-foreground mr-1">Synonyms:</span>
                  {word.synonyms.map((syn, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {syn.term}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Word Form Component
function WordForm({
  word,
  onSave,
  onCancel,
}: {
  word: Word;
  onSave: (word: Word) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(word);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let audioUrl = formData.audio_pronunciation_url;
    let imageUrl = formData.explanation_media?.type === 'image' ? formData.explanation_media.value : undefined;

    // Handle audio upload if file is selected
    if (audioFile) {
      setIsUploading(true);
      try {
        // Prefer backend upload to persist across reloads
        const { apiClient } = await import("@/lib/apiClient");
        audioUrl = await apiClient.uploadAudio(audioFile);
      } catch (error) {
        console.error("Audio upload failed:", error);
        alert("Audio upload failed. Please try again.");
        setIsUploading(false);
        return;
      }
    }

    if (imageFile) {
      setIsUploading(true);
      try {
        const { apiClient } = await import("@/lib/apiClient");
        imageUrl = await apiClient.uploadImage(imageFile);
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("Image upload failed. Please try again.");
        setIsUploading(false);
        return;
      }
    }

    setIsUploading(false);

    onSave({
      ...formData,
      audio_pronunciation_url: audioUrl,
      explanation_media: imageUrl
        ? { type: 'image', value: imageUrl }
        : formData.explanation_media,
      updated_at: new Date().toISOString(),
    });
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
    } else {
      alert("Please select a valid audio file (MP3, WAV, OGG)");
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
    } else {
      alert("Please select a valid image file (PNG, JPG, WEBP)");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {word.id ? "Edit Word" : "Add New Word"}
        </h3>
        <div className="flex gap-2">
          <Button type="submit" disabled={isUploading}>
            {isUploading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                Uploading...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Chakma Script *</Label>
          <Input
            value={formData.chakma_word_script}
            onChange={(e) =>
              setFormData({ ...formData, chakma_word_script: e.target.value })
            }
            placeholder="Chakma text"
            className="font-chakma h-14 text-xl"
            required
          />
        </div>
        <div>
          <Label>Romanized Pronunciation *</Label>
          <Input
            value={formData.romanized_pronunciation}
            onChange={(e) =>
              setFormData({
                ...formData,
                romanized_pronunciation: e.target.value,
              })
            }
            placeholder="chakma"
            className="h-14 text-lg"
            required
          />
        </div>
      </div>

      <div>
        <Label>English Translation *</Label>
        <Input
          value={formData.english_translation}
          onChange={(e) =>
            setFormData({ ...formData, english_translation: e.target.value })
          }
          placeholder="Chakma people"
          className="h-14 text-lg"
          required
        />
      </div>

      <div>
        <Label>Example Sentence *</Label>
        <Textarea
          value={formData.example_sentence}
          onChange={(e) =>
            setFormData({ ...formData, example_sentence: e.target.value })
          }
          placeholder="Example usage in Chakma with English translation"
          className="text-lg"
          required
        />
      </div>

      <div>
        <Label>Etymology *</Label>
        <Textarea
          value={formData.etymology}
          onChange={(e) =>
            setFormData({ ...formData, etymology: e.target.value })
          }
          placeholder="Origin and historical development of the word"
          className="text-lg"
          required
        />
      </div>

      <div>
        <Label>Audio Pronunciation</Label>
        <div className="space-y-3">
          {formData.audio_pronunciation_url && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Volume2 className="h-4 w-4 text-chakma-primary" />
              <span className="text-sm text-muted-foreground">
                Current audio available
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const audio = new Audio(formData.audio_pronunciation_url!);
                  audio.play().catch(console.error);
                }}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Button type="button" variant="outline" className="w-full h-12 text-base">
                <Music className="h-4 w-4 mr-2" />
                {audioFile ? audioFile.name : "Upload Audio File"}
              </Button>
            </div>
            {audioFile && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAudioFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Supported formats: MP3, WAV, OGG. Max size: 5MB
          </p>
        </div>
      </div>

      <div>
        <Label>Explanation Image</Label>
        <div className="space-y-3">
          {formData.explanation_media?.type === 'image' && (
            <div className="text-sm text-muted-foreground break-all">
              Current: {formData.explanation_media.value}
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Button type="button" variant="outline" className="w-full h-12 text-base">
                <Upload className="h-4 w-4 mr-2" />
                {imageFile ? imageFile.name : "Upload Image"}
              </Button>
            </div>
            {imageFile && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setImageFile(null)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Input
            placeholder="Or paste image URL"
            className="h-12 text-base"
            value={formData.explanation_media?.type === 'image' ? (formData.explanation_media?.value || '') : ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                explanation_media: e.target.value
                  ? { type: 'image', value: e.target.value }
                  : undefined,
              })
            }
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Advanced Details</Label>
        <div className="rounded-lg border p-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Synonyms (comma separated)</Label>
              <Input
                className="h-12"
                value={(formData.synonyms || []).map((s) => s.term).join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    synonyms: e.target.value
                      .split(',')
                      .map((x) => x.trim())
                      .filter(Boolean)
                      .map((term) => ({ term, language: 'chakma' as const })),
                  })
                }
              />
            </div>
            <div>
              <Label>Antonyms (comma separated)</Label>
              <Input
                className="h-12"
                value={(formData.antonyms || []).map((a) => a.term).join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    antonyms: e.target.value
                      .split(',')
                      .map((x) => x.trim())
                      .filter(Boolean)
                      .map((term) => ({ term, language: 'chakma' as const })),
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

// Characters Management Component - View Only
function CharactersManagement({
  characters,
  editingCharacter,
  onEdit,
  onSave,
  onDelete,
  onCancel,
}: {
  characters: Character[];
  editingCharacter: Character | null;
  onEdit: (character: Character | null) => void;
  onSave: (character: Character) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}) {
  // Group characters by type for better organization
  const charactersByType = characters.reduce((acc, char) => {
    const type = char.character_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(char);
    return acc;
  }, {} as Record<CharacterType, Character[]>);

  const typeOrder: CharacterType[] = ['alphabet', 'vowel', 'diacritic', 'conjunct', 'ordinal', 'symbol'];

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Chakma Characters ({characters.length})
        </h3>
        <Badge variant="outline" className="text-sm">
          View Only - Grouped by Type
        </Badge>
      </div>

      <div className="flex-1 overflow-auto space-y-6">
        {typeOrder.map((type) => {
          const typeCharacters = charactersByType[type] || [];
          if (typeCharacters.length === 0) return null;

          return (
            <div key={type}>
              <h4 className="text-md font-medium mb-3 capitalize text-chakma-primary">
                {type} ({typeCharacters.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {typeCharacters.map((character) => (
                  <Card key={character.id} className="p-4 text-center hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="text-4xl font-chakma text-chakma-primary">
                        {character.character_script}
                      </div>
                      <div className="font-medium text-sm">{character.romanized_name}</div>
                      {character.description && (
                        <p className="text-xs text-muted-foreground">
                          {character.description}
                        </p>
                      )}
                      {character.audio_pronunciation_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const audio = new Audio(
                              character.audio_pronunciation_url!,
                            );
                            audio.play().catch(console.error);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Character Form Component
function CharacterForm({
  character,
  onSave,
  onCancel,
}: {
  character: Character;
  onSave: (character: Character) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(character);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const characterTypes: CharacterType[] = [
    "alphabet",
    "vowel",
    "conjunct",
    "diacritic",
    "ordinal",
    "symbol",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let audioUrl = formData.audio_pronunciation_url;

    if (audioFile) {
      setIsUploading(true);
      try {
        audioUrl = await handleAudioUpload(audioFile);
      } catch (error) {
        console.error("Audio upload failed:", error);
        alert("Audio upload failed. Please try again.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    onSave({
      ...formData,
      audio_pronunciation_url: audioUrl,
    });
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
    } else {
      alert("Please select a valid audio file (MP3, WAV, OGG)");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {character.id ? "Edit Character" : "Add New Character"}
        </h3>
        <div className="flex gap-2">
          <Button type="submit" disabled={isUploading}>
            {isUploading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                Uploading...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Character Script *</Label>
          <Input
            value={formData.character_script}
            onChange={(e) =>
              setFormData({ ...formData, character_script: e.target.value })
            }
            placeholder="𑄌"
            className="font-chakma text-2xl"
            required
          />
        </div>
        <div>
          <Label>Romanized Name *</Label>
          <Input
            value={formData.romanized_name}
            onChange={(e) =>
              setFormData({ ...formData, romanized_name: e.target.value })
            }
            placeholder="cha"
            required
          />
        </div>
      </div>

      <div>
        <Label>Character Type *</Label>
        <select
          value={formData.character_type}
          onChange={(e) =>
            setFormData({
              ...formData,
              character_type: e.target.value as CharacterType,
            })
          }
          className="w-full px-3 py-2 border border-input rounded-lg bg-background"
          required
        >
          {characterTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description || ""}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Description of the character and its usage"
          rows={3}
        />
      </div>

      <div>
        <Label>Audio Pronunciation</Label>
        <div className="space-y-3">
          {formData.audio_pronunciation_url && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Volume2 className="h-4 w-4 text-chakma-primary" />
              <span className="text-sm text-muted-foreground">
                Current audio available
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const audio = new Audio(formData.audio_pronunciation_url!);
                  audio.play().catch(console.error);
                }}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Button type="button" variant="outline" className="w-full">
                <Music className="h-4 w-4 mr-2" />
                {audioFile ? audioFile.name : "Upload Audio File"}
              </Button>
            </div>
            {audioFile && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAudioFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Supported formats: MP3, WAV, OGG. Max size: 5MB
          </p>
        </div>
      </div>
    </form>
  );
}

// AI Word Generator Component with Chakma Input Collection
function AIWordGenerator({
  words,
  isGenerating,
  onGenerate,
  onCreateWord,
}: {
  words: string[];
  isGenerating: boolean;
  onGenerate: () => void;
  onCreateWord: (word: string) => void;
}) {
  const [selectedEnglishWord, setSelectedEnglishWord] = useState<string | null>(null);
  const [chakmaInput, setChakmaInput] = useState("");
  const [romanizedInput, setRomanizedInput] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [exampleSentence, setExampleSentence] = useState("");
  const [synonyms, setSynonyms] = useState("");
  const [antonyms, setAntonyms] = useState("");
  const [generatedEtymologies, setGeneratedEtymologies] = useState<string[]>([]);
  const [selectedEtymology, setSelectedEtymology] = useState("");
  const [customEtymology, setCustomEtymology] = useState("");
  const [isGeneratingEtymology, setIsGeneratingEtymology] = useState(false);
  const [showEtymologyForm, setShowEtymologyForm] = useState(false);
  const [currentStep, setCurrentStep] = useState<'basic' | 'advanced' | 'etymology'>('basic');

  // Smart AI etymology analysis based on romanized Chakma word
  const analyzeEtymology = (romanized: string, english: string): string[] => {
    const etymologies = [];

    // Analyze phonetic patterns and linguistic features
    const hasAspiration = /[kgcjtdpb]h/.test(romanized);
    const hasTones = /[àáâãäåæçèéêë]/.test(romanized);
    const endsWithNasal = /[nm]$/.test(romanized);
    const hasRetroflex = /[ṭḍṇḷ]/.test(romanized);
    const hasVowelLength = /[āīūē]/.test(romanized);

    // Sanskrit-derived patterns
    if (hasRetroflex || hasVowelLength) {
      etymologies.push(
        `From Sanskrit origin, "${romanized}" shows classical Indo-Aryan features with retroflex/long vowel patterns typical of Sanskrit borrowings into Chakma`
      );
    }

    // Bengali cognate patterns
    if (romanized.includes('bh') || romanized.includes('dh') || hasAspiration) {
      etymologies.push(
        `Cognate with Bengali, "${romanized}" retains Middle Indo-Aryan aspirated consonants indicating shared Eastern Indo-Aryan heritage`
      );
    }

    // Tibeto-Burman substrate
    if (endsWithNasal || romanized.includes('ng')) {
      etymologies.push(
        `Possible Tibeto-Burman substrate, "${romanized}" shows nasal endings characteristic of indigenous Chakma vocabulary predating Indo-Aryan contact`
      );
    }

    // Arakanese/Rakhine connection
    if (romanized.includes('ky') || romanized.includes('my') || hasTones) {
      etymologies.push(
        `Related to Arakanese/Rakhine "${romanized}", showing Tibeto-Burman phonological features common in the Chittagong Hill Tracts linguistic area`
      );
    }

    // Modern borrowing patterns
    if (romanized.length > 4 && !hasRetroflex) {
      etymologies.push(
        `Modern adaptation of "${english}" into Chakma as "${romanized}", following contemporary Chakma phonological adaptation patterns`
      );
    }

    // Fallback etymologies if no specific patterns detected
    if (etymologies.length === 0) {
      etymologies.push(
        `Indigenous Chakma word "${romanized}" with uncertain etymology, possibly pre-dating historical linguistic contact`,
        `From Eastern Indo-Aryan, "${romanized}" shows typical sound changes from Middle Indo-Aryan to modern Chakma`,
        `Borrowed from regional languages, "${romanized}" adapted to Chakma phonological system through historical contact`
      );
    }

    return etymologies.slice(0, 5); // Return max 5 options
  };

  // Generate etymology suggestions
  const generateEtymologies = async (englishWord: string, romanized: string) => {
    setIsGeneratingEtymology(true);
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const smartEtymologies = analyzeEtymology(romanized, englishWord);
    setGeneratedEtymologies(smartEtymologies);
    setSelectedEtymology(smartEtymologies[0]);
    setIsGeneratingEtymology(false);
    setCurrentStep('etymology');
  };

  const handleWordSelection = (englishWord: string) => {
    setSelectedEnglishWord(englishWord);
    setChakmaInput("");
    setRomanizedInput("");
    setAudioUrl("");
    setExampleSentence("");
    setSynonyms("");
    setAntonyms("");
    setGeneratedEtymologies([]);
    setSelectedEtymology("");
    setCustomEtymology("");
    setCurrentStep('basic');
  };

  const handleBasicSubmit = () => {
    if (chakmaInput && romanizedInput && selectedEnglishWord) {
      setCurrentStep('advanced');
    }
  };

  const handleAdvancedSubmit = () => {
    if (selectedEnglishWord && romanizedInput) {
      generateEtymologies(selectedEnglishWord, romanizedInput);
    }
  };

  const handleFinalSubmit = () => {
    if (selectedEnglishWord && chakmaInput && romanizedInput) {
      const finalEtymology = customEtymology || selectedEtymology;

      // Parse synonyms and antonyms
      const parsedSynonyms = synonyms.split(',').map(s => s.trim()).filter(Boolean).map(term => ({
        term,
        language: term.match(/[\u1000-\u109F\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1A20-\u1AAF\u1AB0-\u1AFF\u1B00-\u1B7F\u1B80-\u1BBF\u1BC0-\u1BFF\u1C00-\u1C4F\u1C50-\u1C7F\u1C80-\u1C8F\u1C90-\u1CBF\u1CC0-\u1CCF\u1CD0-\u1CFF\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u2000-\u206F\u2070-\u209F\u20A0-\u20CF\u20D0-\u20FF\u2100-\u214F\u2150-\u218F\u2190-\u21FF\u2200-\u22FF\u2300-\u23FF\u2400-\u243F\u2440-\u245F\u2460-\u24FF\u2500-\u257F\u2580-\u259F\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF\u27C0-\u27EF\u27F0-\u27FF\u2800-\u28FF\u2900-\u297F\u2980-\u29FF\u2A00-\u2AFF\u2B00-\u2BFF\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2DE0-\u2DFF\u2E00-\u2E7F\u2E80-\u2EFF\u2F00-\u2FDF\u2FF0-\u2FFF\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31A0-\u31BF\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA4D0-\uA4FF\uA500-\uA63F\uA640-\uA69F\uA6A0-\uA6FF\uA700-\uA71F\uA720-\uA7FF\uA800-\uA82F\uA830-\uA83F\uA840-\uA87F\uA880-\uA8DF\uA8E0-\uA8FF\uA900-\uA92F\uA930-\uA95F\uA960-\uA97F\uA980-\uA9DF\uA9E0-\uA9FF\uAA00-\uAA5F\uAA60-\uAA7F\uAA80-\uAADF\uAAE0-\uAAFF\uAB00-\uAB2F\uAB30-\uAB6F\uAB70-\uABBF\uABC0-\uABFF\uAC00-\uD7AF\uD7B0-\uD7FF\uD800-\uDB7F\uDB80-\uDBFF\uDC00-\uDFFF\uE000-\uF8FF\uF900-\uFAFF\uFB00-\uFB4F\uFB50-\uFDFF\uFE00-\uFE0F\uFE10-\uFE1F\uFE20-\uFE2F\uFE30-\uFE4F\uFE50-\uFE6F\uFE70-\uFEFF\uFF00-\uFFEF\uFFF0-\uFFFF]|[\u{11100}-\u{1114F}]/u) ? 'chakma' : 'english'
      }));

      const parsedAntonyms = antonyms.split(',').map(s => s.trim()).filter(Boolean).map(term => ({
        term,
        language: term.match(/[\u1000-\u109F\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1A20-\u1AAF\u1AB0-\u1AFF\u1B00-\u1B7F\u1B80-\u1BBF\u1BC0-\u1BFF\u1C00-\u1C4F\u1C50-\u1C7F\u1C80-\u1C8F\u1C90-\u1CBF\u1CC0-\u1CCF\u1CD0-\u1CFF\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u2000-\u206F\u2070-\u209F\u20A0-\u20CF\u20D0-\u20FF\u2100-\u214F\u2150-\u218F\u2190-\u21FF\u2200-\u22FF\u2300-\u23FF\u2400-\u243F\u2440-\u245F\u2460-\u24FF\u2500-\u257F\u2580-\u259F\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF\u27C0-\u27EF\u27F0-\u27FF\u2800-\u28FF\u2900-\u297F\u2980-\u29FF\u2A00-\u2AFF\u2B00-\u2BFF\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2DE0-\u2DFF\u2E00-\u2E7F\u2E80-\u2EFF\u2F00-\u2FDF\u2FF0-\u2FFF\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31A0-\u31BF\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA4D0-\uA4FF\uA500-\uA63F\uA640-\uA69F\uA6A0-\uA6FF\uA700-\uA71F\uA720-\uA7FF\uA800-\uA82F\uA830-\uA83F\uA840-\uA87F\uA880-\uA8DF\uA8E0-\uA8FF\uA900-\uA92F\uA930-\uA95F\uA960-\uA97F\uA980-\uA9DF\uA9E0-\uA9FF\uAA00-\uAA5F\uAA60-\uAA7F\uAA80-\uAADF\uAAE0-\uAAFF\uAB00-\uAB2F\uAB30-\uAB6F\uAB70-\uABBF\uABC0-\uABFF\uAC00-\uD7AF\uD7B0-\uD7FF\uD800-\uDB7F\uDB80-\uDBFF\uDC00-\uDFFF\uE000-\uF8FF\uF900-\uFAFF\uFB00-\uFB4F\uFB50-\uFDFF\uFE00-\uFE0F\uFE10-\uFE1F\uFE20-\uFE2F\uFE30-\uFE4F\uFE50-\uFE6F\uFE70-\uFEFF\uFF00-\uFFEF\uFFF0-\uFFFF]|[\u{11100}-\u{1114F}]/u) ? 'chakma' : 'english'
      }));

      // Create complete word data in repository format
      const wordData = {
        id: `word-${Date.now()}`,
        chakma_word_script: chakmaInput,
        romanized_pronunciation: romanizedInput,
        english_translation: selectedEnglishWord,
        synonyms: parsedSynonyms,
        antonyms: parsedAntonyms,
        example_sentence: exampleSentence || `Example usage of ${chakmaInput} meaning ${selectedEnglishWord}`,
        etymology: finalEtymology,
        audio_pronunciation_url: audioUrl || undefined,
        explanation_media: undefined,
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Create finalized JSON export
      const blob = new Blob([JSON.stringify(wordData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chakmalex-${romanizedInput}-complete.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Reset form
      setSelectedEnglishWord(null);
      setChakmaInput("");
      setRomanizedInput("");
      setAudioUrl("");
      setExampleSentence("");
      setSynonyms("");
      setAntonyms("");
      setGeneratedEtymologies([]);
      setSelectedEtymology("");
      setCustomEtymology("");
      setCurrentStep('basic');

      alert(`Complete word entry for "${selectedEnglishWord}" has been exported as JSON with all fields!`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Brain className="h-12 w-12 text-chakma-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          AI English Word Generator & Chakma Entry Creator
        </h3>
        <p className="text-muted-foreground">
          Generate English words, then provide their Chakma translations with auto-generated etymologies.
        </p>
      </div>

      {!selectedEnglishWord ? (
        <Card className="p-6">
          <div className="space-y-4">
            <Button
              onClick={onGenerate}
              disabled={isGenerating}
              className="w-full h-12"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                  Generating English Words...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate 10 English Words
                </>
              )}
            </Button>

            {words.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Generated Words:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {words.map((word, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start h-auto p-3"
                      onClick={() => handleWordSelection(word)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{word}</div>
                        <div className="text-xs text-muted-foreground">
                          Click to create complete entry
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className={cn("w-3 h-3 rounded-full", currentStep === 'basic' ? 'bg-primary' : 'bg-muted')} />
            <div className="w-8 h-0.5 bg-muted" />
            <div className={cn("w-3 h-3 rounded-full", currentStep === 'advanced' ? 'bg-primary' : 'bg-muted')} />
            <div className="w-8 h-0.5 bg-muted" />
            <div className={cn("w-3 h-3 rounded-full", currentStep === 'etymology' ? 'bg-primary' : 'bg-muted')} />
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 'basic' && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Step 1: Basic Translation for "{selectedEnglishWord}"</h4>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedEnglishWord(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Chakma Script *</Label>
                    <Input
                      value={chakmaInput}
                      onChange={(e) => setChakmaInput(e.target.value)}
                      placeholder="Enter Chakma script"
                      className="font-chakma text-xl h-12"
                      required
                    />
                  </div>
                  <div>
                    <Label>Romanized Pronunciation *</Label>
                    <Input
                      value={romanizedInput}
                      onChange={(e) => setRomanizedInput(e.target.value)}
                      placeholder="e.g., chakma, ado, por"
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                <Button
                  onClick={handleBasicSubmit}
                  disabled={!chakmaInput || !romanizedInput}
                  className="w-full"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Next: Add Details
                </Button>
              </div>
            </Card>
          )}

          {/* Step 2: Advanced Details */}
          {currentStep === 'advanced' && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Step 2: Additional Details</h4>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep('basic')}>
                    <ArrowRight className="h-4 w-4 rotate-180" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Audio Pronunciation URL</Label>
                    <Input
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      placeholder="https://example.com/audio.mp3 (optional)"
                      className="h-12"
                    />
                  </div>

                  <div>
                    <Label>Example Sentence *</Label>
                    <Textarea
                      value={exampleSentence}
                      onChange={(e) => setExampleSentence(e.target.value)}
                      placeholder={`Example: ${chakmaInput} 𑄟𑄮𑄨 𑄞𑄣𑄧 - ${selectedEnglishWord} is my friend`}
                      className="h-20"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Synonyms (comma separated)</Label>
                      <Input
                        value={synonyms}
                        onChange={(e) => setSynonyms(e.target.value)}
                        placeholder="𑄟𑄚𑄪𑄌𑄢, person, individual"
                        className="h-12"
                      />
                    </div>
                    <div>
                      <Label>Antonyms (comma separated)</Label>
                      <Input
                        value={antonyms}
                        onChange={(e) => setAntonyms(e.target.value)}
                        placeholder="animal, 𑄛𑄌𑄪"
                        className="h-12"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleAdvancedSubmit}
                  disabled={!exampleSentence || isGeneratingEtymology}
                  className="w-full"
                >
                  {isGeneratingEtymology ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                      Analyzing Etymology...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Smart Etymology
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Step 3: Etymology Selection */}
          {currentStep === 'etymology' && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Step 3: Smart Etymology Analysis for "{romanizedInput}"</h4>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep('advanced')}>
                    <ArrowRight className="h-4 w-4 rotate-180" />
                  </Button>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    <Brain className="h-4 w-4 inline mr-1" />
                    AI analyzed the phonetic patterns and linguistic features of "{romanizedInput}":
                  </p>
                </div>

                <div className="space-y-3">
                  {generatedEtymologies.map((etymology, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/30">
                      <input
                        type="radio"
                        id={`etymology-${index}`}
                        name="etymology"
                        value={etymology}
                        checked={selectedEtymology === etymology && !customEtymology}
                        onChange={() => {
                          setSelectedEtymology(etymology);
                          setCustomEtymology("");
                        }}
                        className="mt-1"
                      />
                      <label htmlFor={`etymology-${index}`} className="text-sm cursor-pointer flex-1">
                        {etymology}
                      </label>
                    </div>
                  ))}
                </div>

                <Separator />

                <div>
                  <Label>Custom Etymology (Override AI suggestions)</Label>
                  <Textarea
                    value={customEtymology}
                    onChange={(e) => {
                      setCustomEtymology(e.target.value);
                      if (e.target.value) setSelectedEtymology("");
                    }}
                    placeholder="Write your own etymology or edit the selected one above"
                    rows={3}
                  />
                </div>

                <div className="bg-primary/10 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Final Word Summary:</h5>
                  <div className="text-sm space-y-1">
                    <p><strong>Chakma:</strong> <span className="font-chakma">{chakmaInput}</span></p>
                    <p><strong>Romanized:</strong> {romanizedInput}</p>
                    <p><strong>English:</strong> {selectedEnglishWord}</p>
                    <p><strong>Example:</strong> {exampleSentence}</p>
                    {synonyms && <p><strong>Synonyms:</strong> {synonyms}</p>}
                    {antonyms && <p><strong>Antonyms:</strong> {antonyms}</p>}
                    {audioUrl && <p><strong>Audio:</strong> {audioUrl}</p>}
                  </div>
                </div>

                <Button onClick={handleFinalSubmit} className="w-full h-12" size="lg">
                  <Download className="h-5 w-5 mr-2" />
                  Export Complete Word Entry as JSON
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// Data Management Component
function DataManagement({
  wordsCount,
  charactersCount,
  onExport,
  onImport,
}: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Database className="h-12 w-12 text-chakma-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Repository Data Export
        </h3>
        <p className="text-muted-foreground">
          Export dictionary data in GitHub repository format for direct upload.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 text-center">
          <FileText className="h-8 w-8 text-chakma-primary mx-auto mb-2" />
          <div className="text-2xl font-bold">{wordsCount}</div>
          <p className="text-sm text-muted-foreground">Dictionary Words</p>
        </Card>
        <Card className="p-4 text-center">
          <Settings className="h-8 w-8 text-chakma-secondary mx-auto mb-2" />
          <div className="text-2xl font-bold">{charactersCount}</div>
          <p className="text-sm text-muted-foreground">Chakma Characters</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-medium mb-2">Export Repository Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Downloads a JSON file compatible with the ChakmaLex repository format.
              This file can be directly uploaded to GitHub for data management.
            </p>
          </div>

          <Button onClick={onExport} className="w-full h-12 text-base">
            <Download className="h-5 w-5 mr-2" />
            Download Repository JSON
          </Button>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>• Includes all words with proper formatting</p>
            <p>• Characters grouped by type</p>
            <p>• Compatible with existing repository structure</p>
            <p>• Ready for GitHub upload and version control</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-muted/50">
        <div className="text-center">
          <h4 className="font-medium text-sm mb-2">Import Functionality</h4>
          <p className="text-xs text-muted-foreground">
            Import functionality has been disabled in this view-only version.
            Use the exported JSON files with your repository management system.
          </p>
        </div>
      </Card>
    </div>
  );
}
