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
  Image,
  ChevronDown,
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
import { apiClient, apiUtils } from "@/lib/api";

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
  const [words, setWords] = useState<Word[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null,
  );
  const [aiGeneratedWords, setAiGeneratedWords] = useState<string[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Load data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [wordsResponse, charactersResponse] = await Promise.all([
          apiClient.getWords(),
          apiClient.getCharacters(),
        ]);

        if (wordsResponse.success && wordsResponse.data) {
          setWords(wordsResponse.data.items || []);
        }

        if (charactersResponse.success && charactersResponse.data) {
          setCharacters(charactersResponse.data);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load data from server");
        // Fallback to sample data
        setWords(sampleWords);
        setCharacters(sampleCharacters);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

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
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col max-h-[95vh] overflow-hidden">
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
            <TabsList className="grid w-full grid-cols-4 gap-2 p-1">
              <TabsTrigger value="words" className="text-sm py-3 px-4">Words</TabsTrigger>
              <TabsTrigger value="characters" className="text-sm py-3 px-4">Characters</TabsTrigger>
              <TabsTrigger value="ai" className="text-sm py-3 px-4">AI Generator</TabsTrigger>
              <TabsTrigger value="data" className="text-sm py-3 px-4">Data</TabsTrigger>
            </TabsList>

            {/* Words Management */}
            <TabsContent value="words" className="flex-1 overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin h-8 w-8 border-4 border-chakma-primary border-t-transparent rounded-full" />
                  <span className="ml-3 text-lg">Loading words...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <p className="text-lg text-destructive mb-2">Error loading data</p>
                    <p className="text-muted-foreground">{error}</p>
                  </div>
                </div>
              ) : (
                <WordsManagement
                  words={words}
                  editingWord={editingWord}
                  onEdit={setEditingWord}
                  onSave={(word) => {
                    if (editingWord) {
                      setWords(words.map((w) => (w.id === word.id ? word : w)));
                    } else {
                      setWords([
                        ...words,
                        { ...word, id: Date.now().toString() },
                      ]);
                    }
                    setEditingWord(null);
                  }}
                  onDelete={(id) => {
                    setWords(words.filter((w) => w.id !== id));
                  }}
                  onCancel={() => setEditingWord(null)}
                />
              )}
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
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>("");

  if (editingWord) {
    return <WordForm word={editingWord} onSave={onSave} onCancel={onCancel} />;
  }

  const handleSave = async (word: Word) => {
    setIsLoading(true);
    setSyncStatus("Saving...");
    
    try {
      let response;
      if (word.id) {
        response = await apiClient.updateWord(word.id, word);
      } else {
        response = await apiClient.createWord(word);
      }

      if (response.success) {
        onSave(word);
        setSyncStatus("Saved successfully!");
        
        // Sync to GitHub
        const githubResponse = await apiClient.syncToGitHub(
          word.id ? 'update' : 'create',
          response.data || word
        );
        
        if (githubResponse.success) {
          setSyncStatus("Synced to GitHub!");
        } else {
          setSyncStatus("Saved locally, GitHub sync failed");
        }
      } else {
        setSyncStatus(`Error: ${response.error}`);
      }
    } catch (error) {
      setSyncStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSyncStatus(""), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    setSyncStatus("Deleting...");
    
    try {
      const response = await apiClient.deleteWord(id);
      if (response.success) {
        onDelete(id);
        setSyncStatus("Deleted successfully!");
        
        // Sync to GitHub
        const githubResponse = await apiClient.syncToGitHub('delete', { id });
        if (githubResponse.success) {
          setSyncStatus("Synced to GitHub!");
        } else {
          setSyncStatus("Deleted locally, GitHub sync failed");
        }
      } else {
        setSyncStatus(`Error: ${response.error}`);
      }
    } catch (error) {
      setSyncStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSyncStatus(""), 3000);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Words ({words.length})</h3>
          {syncStatus && (
            <p className="text-sm text-muted-foreground">{syncStatus}</p>
          )}
        </div>
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
          className="w-full sm:w-auto py-3 px-6 text-base"
          disabled={isLoading}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Word
        </Button>
      </div>

      <div className="flex-1 overflow-auto space-y-3">
        {words.map((word) => (
          <Card key={word.id} className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2">
                  <span className="text-xl font-chakma text-chakma-primary">
                    {word.chakma_word_script}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /{word.romanized_pronunciation}/
                  </span>
                </div>
                <div className="font-medium text-base">{word.english_translation}</div>
                {word.example_sentence && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {word.example_sentence}
                  </p>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(word)}
                  className="flex-1 sm:flex-none py-2 px-4 text-base"
                  disabled={isLoading}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(word.id)}
                  className="flex-1 sm:flex-none py-2 px-4 text-base text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsUploading(true);
    setUploadProgress("Processing...");

    try {
      let audioUrl = formData.audio_pronunciation_url;
      let imageUrl = formData.explanation_media?.value;

      // Handle audio upload if file is selected
      if (audioFile) {
        setUploadProgress("Uploading audio...");
        const audioResponse = await apiClient.uploadAudio(audioFile);
        if (audioResponse.success && audioResponse.data) {
          audioUrl = audioResponse.data.url;
        } else {
          throw new Error(audioResponse.error || "Audio upload failed");
        }
      }

      // Handle image upload if file is selected
      if (imageFile) {
        setUploadProgress("Uploading image...");
        const imageResponse = await apiClient.uploadImage(imageFile);
        if (imageResponse.success && imageResponse.data) {
          imageUrl = imageResponse.data.url;
        } else {
          throw new Error(imageResponse.error || "Image upload failed");
        }
      }

      const updatedWord = {
        ...formData,
        audio_pronunciation_url: audioUrl,
        explanation_media: imageUrl ? { type: 'image' as const, value: imageUrl } : undefined,
        updated_at: new Date().toISOString(),
      };

      onSave(updatedWord);
    } catch (error) {
      console.error("Upload failed:", error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
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
      alert("Please select a valid image file (JPG, PNG, GIF)");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-semibold">
          {word.id ? "Edit Word" : "Add New Word"}
        </h3>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button 
            type="submit" 
            disabled={isUploading}
            className="flex-1 sm:flex-none py-3 px-6 text-base"
          >
            {isUploading ? (
              <>
                <div className="animate-spin h-5 w-5 mr-2 border-2 border-current border-t-transparent rounded-full" />
                {uploadProgress}
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
            className="flex-1 sm:flex-none py-3 px-6 text-base"
          >
            Cancel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-base">Chakma Script *</Label>
          <Input
            value={formData.chakma_word_script}
            onChange={(e) =>
              setFormData({ ...formData, chakma_word_script: e.target.value })
            }
            placeholder="Chakma text"
            className="font-chakma text-lg py-3"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-base">Romanized Pronunciation *</Label>
          <Input
            value={formData.romanized_pronunciation}
            onChange={(e) =>
              setFormData({
                ...formData,
                romanized_pronunciation: e.target.value,
              })
            }
            placeholder="chakma"
            className="text-lg py-3"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-base">English Translation *</Label>
        <Input
          value={formData.english_translation}
          onChange={(e) =>
            setFormData({ ...formData, english_translation: e.target.value })
          }
          placeholder="Chakma people"
          className="text-lg py-3"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-base">Example Sentence *</Label>
        <Textarea
          value={formData.example_sentence}
          onChange={(e) =>
            setFormData({ ...formData, example_sentence: e.target.value })
          }
          placeholder="Example usage in Chakma with English translation"
          className="text-base py-3 min-h-[100px]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-base">Etymology *</Label>
        <Textarea
          value={formData.etymology}
          onChange={(e) =>
            setFormData({ ...formData, etymology: e.target.value })
          }
          placeholder="Origin and historical development of the word"
          className="text-base py-3 min-h-[100px]"
          required
        />
      </div>

      {/* Collapsible Audio Section */}
      <div className="space-y-4">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer list-none p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-chakma-primary" />
              <Label className="text-base font-medium">Audio Pronunciation</Label>
            </div>
            <div className="group-open:rotate-180 transition-transform">
              <ChevronDown className="h-4 w-4" />
            </div>
          </summary>
          <div className="p-4 space-y-4">
            {formData.audio_pronunciation_url && (
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Volume2 className="h-5 w-5 text-chakma-primary" />
                <span className="text-sm text-muted-foreground flex-1">
                  Current audio available
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const audio = new Audio(formData.audio_pronunciation_url!);
                    audio.play().catch(console.error);
                  }}
                  className="py-2 px-4"
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  Play
                </Button>
              </div>
            )}

            <div className="space-y-3">
              <div className="relative">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Button type="button" variant="outline" className="w-full py-3 text-base">
                  <Music className="h-5 w-5 mr-2" />
                  {audioFile ? audioFile.name : "Upload Audio File"}
                </Button>
              </div>
              {audioFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAudioFile(null)}
                  className="w-full py-2"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove Audio File
                </Button>
              )}
              <p className="text-sm text-muted-foreground">
                Supported formats: MP3, WAV, OGG. Max size: 5MB
              </p>
            </div>
          </div>
        </details>
      </div>

      {/* Collapsible Image Section */}
      <div className="space-y-4">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer list-none p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-chakma-secondary" />
              <Label className="text-base font-medium">Explanation Image</Label>
            </div>
            <div className="group-open:rotate-180 transition-transform">
              <ChevronDown className="h-4 w-4" />
            </div>
          </summary>
          <div className="p-4 space-y-4">
            {formData.explanation_media?.value && (
              <div className="space-y-3">
                <img 
                  src={formData.explanation_media.value} 
                  alt="Explanation" 
                  className="max-w-full h-auto rounded-lg border"
                />
                <p className="text-sm text-muted-foreground">
                  Current image available
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Button type="button" variant="outline" className="w-full py-3 text-base">
                  <Image className="h-5 w-5 mr-2" />
                  {imageFile ? imageFile.name : "Upload Image File"}
                </Button>
              </div>
              {imageFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setImageFile(null)}
                  className="w-full py-2"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove Image File
                </Button>
              )}
              <p className="text-sm text-muted-foreground">
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </p>
            </div>
          </div>
        </details>
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
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Character
        </Button>
      </div>

      <div className="flex-1 overflow-auto space-y-2">
        {characters.map((character) => (
          <Card key={character.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex items-center gap-4">
                <div className="text-3xl font-chakma text-chakma-primary">
                  {character.character_script}
                </div>
                <div className="space-y-1">
                  <div className="font-medium">{character.romanized_name}</div>
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
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const audio = new Audio(
                        character.audio_pronunciation_url!,
                      );
                      audio.play().catch(console.error);
                    }}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(character)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(character.id)}
                  className="text-destructive"
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
