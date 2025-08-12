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

  // Content management state
  const [words, setWords] = useState<Word[]>(sampleWords);
  const [characters, setCharacters] = useState<Character[]>(sampleCharacters);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null,
  );
  const [aiGeneratedWords, setAiGeneratedWords] = useState<string[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

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
    const data = {
      words,
      characters,
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chakmalex-content.json";
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
                editingWord={editingWord}
                onEdit={setEditingWord}
                onSave={async (word) => {
                  const { apiClient } = await import("@/lib/apiClient");
                  try {
                    if (editingWord && word.id) {
                      const updated = await apiClient.updateWord(word.id, word);
                      setWords(words.map((w) => (w.id === updated.id ? updated : w)));
                    } else {
                      const created = await apiClient.createWord({
                        chakma_word_script: word.chakma_word_script,
                        romanized_pronunciation: word.romanized_pronunciation,
                        english_translation: word.english_translation,
                        example_sentence: word.example_sentence,
                        etymology: word.etymology,
                        audio_pronunciation_url: word.audio_pronunciation_url,
                        explanation_media: word.explanation_media,
                        synonyms: word.synonyms,
                        antonyms: word.antonyms,
                        is_verified: word.is_verified,
                      });
                      setWords([...words, created]);
                    }
                    setEditingWord(null);
                  } catch (e: any) {
                    alert(e?.message || "Failed to save word");
                  }
                }}
                onDelete={async (id) => {
                  const { apiClient } = await import("@/lib/apiClient");
                  try {
                    await apiClient.deleteWord(id);
                    setWords(words.filter((w) => w.id !== id));
                  } catch (e: any) {
                    alert(e?.message || "Failed to delete word");
                  }
                }}
                onCancel={() => setEditingWord(null)}
              />
            </TabsContent>

            {/* Characters Management */}
            <TabsContent value="characters" className="flex-1 overflow-hidden">
              <CharactersManagement
                characters={characters}
                editingCharacter={editingCharacter}
                onEdit={setEditingCharacter}
                onSave={(character) => {
                  if (editingCharacter) {
                    setCharacters(
                      characters.map((c) =>
                        c.id === character.id ? character : c,
                      ),
                    );
                  } else {
                    setCharacters([
                      ...characters,
                      { ...character, id: Date.now().toString() },
                    ]);
                  }
                  setEditingCharacter(null);
                }}
                onDelete={(id) => {
                  setCharacters(characters.filter((c) => c.id !== id));
                }}
                onCancel={() => setEditingCharacter(null)}
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
                onCreateWord={(englishWord) => {
                  setEditingWord({
                    id: "",
                    chakma_word_script: "",
                    romanized_pronunciation: "",
                    english_translation: englishWord,
                    example_sentence: "",
                    etymology: "",
                    created_at: new Date().toISOString(),
                  });
                  setActiveTab("words");
                }}
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

// AI Word Generator Component
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
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Brain className="h-12 w-12 text-chakma-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          AI English Word Generator
        </h3>
        <p className="text-muted-foreground">
          Generate English words for translation into Chakma. Click on any word
          to create a dictionary entry.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                Generating Words...
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
                    onClick={() => onCreateWord(word)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{word}</div>
                      <div className="text-xs text-muted-foreground">
                        Click to create entry
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Click any word above to create a new dictionary entry with that
                English translation. You can then add the Chakma script and
                other details.
              </p>
            </div>
          )}
        </div>
      </Card>
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
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 text-center">
          <FileText className="h-8 w-8 text-chakma-primary mx-auto mb-2" />
          <div className="text-2xl font-bold">{wordsCount}</div>
          <p className="text-sm text-muted-foreground">Words</p>
        </Card>
        <Card className="p-4 text-center">
          <Database className="h-8 w-8 text-chakma-secondary mx-auto mb-2" />
          <div className="text-2xl font-bold">{charactersCount}</div>
          <p className="text-sm text-muted-foreground">Characters</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-medium mb-3">Export Data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Download all content as JSON backup
          </p>
          <Button onClick={onExport} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Export Content
          </Button>
        </Card>

        <Card className="p-4">
          <h3 className="font-medium mb-3">Import Data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Restore content from JSON backup
          </p>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={onImport}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Button className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Import Content
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
