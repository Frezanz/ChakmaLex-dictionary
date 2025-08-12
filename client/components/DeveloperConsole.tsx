/**
 * Developer Console for ChakmaLex
 * Touch-friendly content management system accessible via logo taps + password
 * Features: CRUD operations, audio upload, AI word generation, data export/import, GitHub sync
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
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
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
import { APIClient, APIError } from "@/lib/api";

interface DeveloperConsoleProps {
  onClose: () => void;
}

// Helper function to generate random English words
const generateRandomEnglishWords = (count: number): string[] => {
  const commonWords = [
    "happiness", "mountain", "river", "beautiful", "friendship",
    "journey", "wisdom", "courage", "peaceful", "traditional",
    "family", "education", "culture", "celebration", "community",
    "nature", "freedom", "respect", "harmony", "strength",
    "knowledge", "compassion", "unity", "heritage", "dignity",
    "prosperity", "abundance", "serenity", "gratitude", "enlightenment",
    "adventure", "discovery", "creativity", "innovation", "inspiration",
    "dedication", "perseverance", "excellence", "achievement", "success",
    "progress", "development", "growth", "improvement",
  ];

  return commonWords.sort(() => 0.5 - Math.random()).slice(0, count);
};

export default function DeveloperConsole({ onClose }: DeveloperConsoleProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("words");
  const [syncStatus, setSyncStatus] = useState<{
    loading: boolean;
    message: string;
    error?: string;
  }>({ loading: false, message: "" });

  // Content management state
  const [words, setWords] = useState<Word[]>(sampleWords);
  const [characters, setCharacters] = useState<Character[]>(sampleCharacters);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
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

  // Load data from API on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setSyncStatus({ loading: true, message: "Loading data..." });
      const [wordsResponse, charactersResponse] = await Promise.all([
        APIClient.getWords({ limit: 1000 }),
        APIClient.getCharacters(),
      ]);
      setWords(wordsResponse.items);
      setCharacters(charactersResponse);
      setSyncStatus({ loading: false, message: "Data loaded successfully" });
    } catch (error) {
      console.error("Error loading data:", error);
      setSyncStatus({ 
        loading: false, 
        message: "Failed to load data", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  };

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
                <Label className="text-base font-medium">Enter Password:</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="h-12 text-lg"
                  autoFocus
                />
                {error && (
                  <p className="text-destructive text-sm mt-1">{error}</p>
                )}
              </div>
              <div className="flex space-x-3">
                <Button type="submit" className="flex-1 h-12 text-base">
                  Access Console
                </Button>
                <Button type="button" variant="outline" onClick={onClose} className="h-12 px-6">
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
              <Badge variant="outline">v3.0</Badge>
            </CardTitle>
            <div className="flex items-center gap-4">
              {syncStatus.loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  {syncStatus.message}
                </div>
              )}
              {syncStatus.error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <XCircle className="h-4 w-4" />
                  {syncStatus.error}
                </div>
              )}
              {!syncStatus.loading && !syncStatus.error && syncStatus.message && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  {syncStatus.message}
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  try {
                    setSyncStatus({ loading: true, message: "Syncing to GitHub..." });
                    await APIClient.syncToGitHub(words, characters, 'update');
                    setSyncStatus({ loading: false, message: "Synced to GitHub successfully" });
                  } catch (error) {
                    console.error("GitHub sync failed:", error);
                    setSyncStatus({ 
                      loading: false, 
                      message: "GitHub sync failed", 
                      error: error instanceof Error ? error.message : "Unknown error" 
                    });
                  }
                }}
                disabled={syncStatus.loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync to GitHub
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
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
                  try {
                    setSyncStatus({ loading: true, message: "Saving word..." });
                    let savedWord: Word;
                    
                    if (editingWord?.id) {
                      // Update existing word
                      savedWord = await APIClient.updateWord(editingWord.id, word);
                      setWords(words.map((w) => (w.id === savedWord.id ? savedWord : w)));
                    } else {
                      // Create new word
                      savedWord = await APIClient.createWord(word);
                      setWords([...words, savedWord]);
                    }
                    
                    setEditingWord(null);
                    setSyncStatus({ loading: false, message: "Word saved successfully" });
                  } catch (error) {
                    console.error("Error saving word:", error);
                    setSyncStatus({ 
                      loading: false, 
                      message: "Failed to save word", 
                      error: error instanceof Error ? error.message : "Unknown error" 
                    });
                  }
                }}
                onDelete={async (id) => {
                  try {
                    setSyncStatus({ loading: true, message: "Deleting word..." });
                    await APIClient.deleteWord(id);
                    setWords(words.filter((w) => w.id !== id));
                    setSyncStatus({ loading: false, message: "Word deleted successfully" });
                  } catch (error) {
                    console.error("Error deleting word:", error);
                    setSyncStatus({ 
                      loading: false, 
                      message: "Failed to delete word", 
                      error: error instanceof Error ? error.message : "Unknown error" 
                    });
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
                onSave={async (character) => {
                  try {
                    setSyncStatus({ loading: true, message: "Saving character..." });
                    let savedCharacter: Character;
                    
                    if (editingCharacter?.id) {
                      // Update existing character
                      savedCharacter = await APIClient.updateCharacter(editingCharacter.id, character);
                      setCharacters(characters.map((c) => (c.id === savedCharacter.id ? savedCharacter : c)));
                    } else {
                      // Create new character
                      savedCharacter = await APIClient.createCharacter(character);
                      setCharacters([...characters, savedCharacter]);
                    }
                    
                    setEditingCharacter(null);
                    setSyncStatus({ loading: false, message: "Character saved successfully" });
                  } catch (error) {
                    console.error("Error saving character:", error);
                    setSyncStatus({ 
                      loading: false, 
                      message: "Failed to save character", 
                      error: error instanceof Error ? error.message : "Unknown error" 
                    });
                  }
                }}
                onDelete={async (id) => {
                  try {
                    setSyncStatus({ loading: true, message: "Deleting character..." });
                    await APIClient.deleteCharacter(id);
                    setCharacters(characters.filter((c) => c.id !== id));
                    setSyncStatus({ loading: false, message: "Character deleted successfully" });
                  } catch (error) {
                    console.error("Error deleting character:", error);
                    setSyncStatus({ 
                      loading: false, 
                      message: "Failed to delete character", 
                      error: error instanceof Error ? error.message : "Unknown error" 
                    });
                  }
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

// Words Management Component
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
  if (editingWord) {
    return <WordForm word={editingWord} onSave={onSave} onCancel={onCancel} />;
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Words ({words.length})</h3>
        <Button
          onClick={() =>
            onEdit({
              id: "",
              chakma_word_script: "",
              romanized_pronunciation: "",
              english_translation: "",
              example_sentence: "",
              etymology: "",
              created_at: new Date().toISOString(),
            })
          }
          className="h-12 px-6 text-base"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Word
        </Button>
      </div>

      <div className="flex-1 overflow-auto space-y-3">
        {words.map((word) => (
          <Card key={word.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl font-chakma text-chakma-primary">
                    {word.chakma_word_script}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /{word.romanized_pronunciation}/
                  </span>
                </div>
                <div className="font-medium text-base">{word.english_translation}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(word)} className="h-10 px-4">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(word.id)}
                  className="text-destructive h-10 px-4"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
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
  const [showAudioSection, setShowAudioSection] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const errors = APIClient.validateWord(formData);
    if (errors.length > 0) {
      alert(`Please fix the following errors:\n${errors.join('\n')}`);
      return;
    }

    // Check for duplicate words
    const isDuplicate = await APIClient.checkDuplicateWord(formData.chakma_word_script, formData.id);
    if (isDuplicate) {
      alert("This Chakma word already exists in the dictionary.");
      return;
    }

    let audioUrl = formData.audio_pronunciation_url;

    // Handle audio upload if file is selected
    if (audioFile) {
      setIsUploading(true);
      try {
        const uploadResult = await APIClient.uploadAudio(audioFile);
        audioUrl = uploadResult.url;
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">
          {word.id ? "Edit Word" : "Add New Word"}
        </h3>
        <div className="flex gap-3">
          <Button type="submit" disabled={isUploading} className="h-12 px-6 text-base">
            {isUploading ? (
              <>
                <div className="animate-spin h-5 w-5 mr-2 border-2 border-current border-t-transparent rounded-full" />
                Uploading...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isUploading}
            className="h-12 px-6 text-base"
          >
            Cancel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-base font-medium">Chakma Script *</Label>
          <Input
            value={formData.chakma_word_script}
            onChange={(e) =>
              setFormData({ ...formData, chakma_word_script: e.target.value })
            }
            placeholder="Chakma text"
            className="font-chakma text-lg h-12"
            required
          />
        </div>
        <div>
          <Label className="text-base font-medium">Romanized Pronunciation *</Label>
          <Input
            value={formData.romanized_pronunciation}
            onChange={(e) =>
              setFormData({
                ...formData,
                romanized_pronunciation: e.target.value,
              })
            }
            placeholder="chakma"
            className="text-lg h-12"
            required
          />
        </div>
      </div>

      <div>
        <Label className="text-base font-medium">English Translation *</Label>
        <Input
          value={formData.english_translation}
          onChange={(e) =>
            setFormData({ ...formData, english_translation: e.target.value })
          }
          placeholder="Chakma people"
          className="text-lg h-12"
          required
        />
      </div>

      <div>
        <Label className="text-base font-medium">Example Sentence *</Label>
        <Textarea
          value={formData.example_sentence}
          onChange={(e) =>
            setFormData({ ...formData, example_sentence: e.target.value })
          }
          placeholder="Example usage in Chakma with English translation"
          className="text-lg min-h-[80px]"
          required
        />
      </div>

      <div>
        <Label className="text-base font-medium">Etymology *</Label>
        <Textarea
          value={formData.etymology}
          onChange={(e) =>
            setFormData({ ...formData, etymology: e.target.value })
          }
          placeholder="Origin and historical development of the word"
          className="text-lg min-h-[80px]"
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Audio & Media</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAudioSection(!showAudioSection)}
            className="h-10 px-4"
          >
            {showAudioSection ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show
              </>
            )}
          </Button>
        </div>
        
        {showAudioSection && (
          <div className="space-y-4 p-4 border rounded-lg">
            <div>
              <Label className="text-base font-medium">Audio Pronunciation</Label>
              <div className="space-y-3 mt-2">
                {formData.audio_pronunciation_url && (
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <Volume2 className="h-5 w-5 text-chakma-primary" />
                    <span className="text-sm text-muted-foreground flex-1">
                      Current audio available
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 px-4"
                      onClick={() => {
                        const audio = new Audio(formData.audio_pronunciation_url!);
                        audio.play().catch(console.error);
                      }}
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Button type="button" variant="outline" className="w-full h-12 text-base">
                      <Music className="h-5 w-5 mr-2" />
                      {audioFile ? audioFile.name : "Upload Audio File"}
                    </Button>
                  </div>
                  {audioFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-12 px-4"
                      onClick={() => setAudioFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Audio URL (Alternative)</Label>
                    <Input
                      value={formData.audio_pronunciation_url || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, audio_pronunciation_url: e.target.value })
                      }
                      placeholder="https://example.com/audio.mp3"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Image URL</Label>
                    <Input
                      value={formData.explanation_media?.value || ""}
                      onChange={(e) =>
                        setFormData({ 
                          ...formData, 
                          explanation_media: { type: 'url', value: e.target.value }
                        })
                      }
                      placeholder="https://example.com/image.jpg"
                      className="h-10"
                    />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Supported audio formats: MP3, WAV, OGG. Max size: 5MB
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

// Characters Management Component
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
  if (editingCharacter) {
    return (
      <CharacterForm
        character={editingCharacter}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Characters ({characters.length})
        </h3>
        <Button
          onClick={() =>
            onEdit({
              id: "",
              character_script: "",
              character_type: "alphabet" as CharacterType,
              romanized_name: "",
              description: "",
              created_at: new Date().toISOString(),
            })
          }
          className="h-12 px-6 text-base"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Character
        </Button>
      </div>

      <div className="flex-1 overflow-auto space-y-3">
        {characters.map((character) => (
          <Card key={character.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex items-center gap-4">
                <div className="text-4xl font-chakma text-chakma-primary">
                  {character.character_script}
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-base">{character.romanized_name}</div>
                  <Badge variant="secondary" className="text-xs">
                    {character.character_type}
                  </Badge>
                  {character.description && (
                    <p className="text-sm text-muted-foreground">
                      {character.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {character.audio_pronunciation_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 px-4"
                    onClick={() => {
                      const audio = new Audio(character.audio_pronunciation_url!);
                      audio.play().catch(console.error);
                    }}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(character)}
                  className="h-10 px-4"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(character.id)}
                  className="text-destructive h-10 px-4"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
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
  const [showAudioSection, setShowAudioSection] = useState(false);

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

    // Validate form data
    const errors = APIClient.validateCharacter(formData);
    if (errors.length > 0) {
      alert(`Please fix the following errors:\n${errors.join('\n')}`);
      return;
    }

    let audioUrl = formData.audio_pronunciation_url;

    if (audioFile) {
      setIsUploading(true);
      try {
        const uploadResult = await APIClient.uploadAudio(audioFile);
        audioUrl = uploadResult.url;
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">
          {character.id ? "Edit Character" : "Add New Character"}
        </h3>
        <div className="flex gap-3">
          <Button type="submit" disabled={isUploading} className="h-12 px-6 text-base">
            {isUploading ? (
              <>
                <div className="animate-spin h-5 w-5 mr-2 border-2 border-current border-t-transparent rounded-full" />
                Uploading...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isUploading}
            className="h-12 px-6 text-base"
          >
            Cancel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-base font-medium">Character Script *</Label>
          <Input
            value={formData.character_script}
            onChange={(e) =>
              setFormData({ ...formData, character_script: e.target.value })
            }
            placeholder="𑄌"
            className="font-chakma text-2xl h-12"
            required
          />
        </div>
        <div>
          <Label className="text-base font-medium">Romanized Name *</Label>
          <Input
            value={formData.romanized_name}
            onChange={(e) =>
              setFormData({ ...formData, romanized_name: e.target.value })
            }
            placeholder="cha"
            className="text-lg h-12"
            required
          />
        </div>
      </div>

      <div>
        <Label className="text-base font-medium">Character Type *</Label>
        <select
          value={formData.character_type}
          onChange={(e) =>
            setFormData({
              ...formData,
              character_type: e.target.value as CharacterType,
            })
          }
          className="w-full px-3 py-2 border border-input rounded-lg bg-background h-12 text-lg"
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
        <Label className="text-base font-medium">Description</Label>
        <Textarea
          value={formData.description || ""}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Description of the character and its usage"
          className="text-lg min-h-[80px]"
          rows={3}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Audio Pronunciation</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAudioSection(!showAudioSection)}
            className="h-10 px-4"
          >
            {showAudioSection ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show
              </>
            )}
          </Button>
        </div>
        
        {showAudioSection && (
          <div className="space-y-4 p-4 border rounded-lg">
            <div>
              <Label className="text-base font-medium">Audio Pronunciation</Label>
              <div className="space-y-3 mt-2">
                {formData.audio_pronunciation_url && (
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <Volume2 className="h-5 w-5 text-chakma-primary" />
                    <span className="text-sm text-muted-foreground flex-1">
                      Current audio available
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 px-4"
                      onClick={() => {
                        const audio = new Audio(formData.audio_pronunciation_url!);
                        audio.play().catch(console.error);
                      }}
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Button type="button" variant="outline" className="w-full h-12 text-base">
                      <Music className="h-5 w-5 mr-2" />
                      {audioFile ? audioFile.name : "Upload Audio File"}
                    </Button>
                  </div>
                  {audioFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-12 px-4"
                      onClick={() => setAudioFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Audio URL (Alternative)</Label>
                  <Input
                    value={formData.audio_pronunciation_url || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, audio_pronunciation_url: e.target.value })
                    }
                    placeholder="https://example.com/audio.mp3"
                    className="h-10"
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  Supported audio formats: MP3, WAV, OGG. Max size: 5MB
                </p>
              </div>
            </div>
          </div>
        )}
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
            className="w-full h-12 text-base"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin h-5 w-5 mr-2 border-2 border-current border-t-transparent rounded-full" />
                Generating Words...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5 mr-2" />
                Generate 10 English Words
              </>
            )}
          </Button>

          {words.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Generated Words:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {words.map((word, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-16 p-4 text-base"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-medium mb-3">Export Data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Download all content as JSON backup
          </p>
          <Button onClick={onExport} className="w-full h-12 text-base">
            <Download className="h-5 w-5 mr-2" />
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
            <Button className="w-full h-12 text-base">
              <Upload className="h-5 w-5 mr-2" />
              Import Content
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}