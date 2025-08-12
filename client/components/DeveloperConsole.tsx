/**
 * Developer Console for ChakmaLex
 * Hidden content management system accessible via logo taps + password
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  Github,
  Sync,
  ChevronDown,
  ChevronRight,
  Key,
  Globe,
  AlertCircle,
  Image,
  Link,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";

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

export default function DeveloperConsole({ onClose }: DeveloperConsoleProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("words");

  // Content management state
  const [words, setWords] = useState<Word[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  
  // GitHub integration state
  const [githubToken, setGithubToken] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  
  // AI and misc state
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

  // Load data on authentication
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      checkConnectionStatus();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [wordsData, charactersData] = await Promise.all([
        apiClient.getWords(),
        apiClient.getCharacters()
      ]);
      
      // Fallback to sample data if API returns empty
      setWords(wordsData.length > 0 ? wordsData : sampleWords);
      setCharacters(charactersData.length > 0 ? charactersData : sampleCharacters);
    } catch (error) {
      console.error('Failed to load data:', error);
      setWords(sampleWords);
      setCharacters(sampleCharacters);
    } finally {
      setIsLoading(false);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const connected = await apiClient.testConnection();
      setIsConnected(connected);
      
      const syncStatus = await apiClient.checkSyncStatus();
      setSyncStatus(syncStatus.github_connected ? 'Connected to GitHub' : 'Local only');
    } catch (error) {
      setIsConnected(false);
      setSyncStatus('Connection failed');
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

  const setupGitHubIntegration = () => {
    if (githubToken) {
      apiClient.setGitHubToken(githubToken);
      checkConnectionStatus();
      setGithubToken("");
    }
  };

  const exportData = () => {
    const data = {
      words,
      characters,
      exportedAt: new Date().toISOString(),
      version: "2.0.0",
      syncStatus,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chakmalex-content-${new Date().toISOString().slice(0, 10)}.json`;
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

  // Authentication screen
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              Developer Console Access
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <Label className="text-base">Enter Password:</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="h-12 text-base mt-2"
                  autoFocus
                />
                {error && (
                  <p className="text-destructive text-sm mt-2">{error}</p>
                )}
              </div>
              <div className="flex space-x-3">
                <Button type="submit" className="flex-1 h-12 text-base">
                  Access Console
                </Button>
                <Button type="button" variant="outline" onClick={onClose} className="h-12">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main console interface
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 md:p-4">
      <Card className="w-full max-w-7xl h-[95vh] flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Database className="h-5 w-5 md:h-6 md:w-6" />
                ChakmaLex Developer Console
                <Badge variant="outline" className="text-xs">v2.1</Badge>
              </CardTitle>
              <div className="hidden md:flex items-center gap-2">
                <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
                  {isConnected ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                  {syncStatus}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground md:block hidden">
            Enhanced with GitHub sync, audio upload, and touch-friendly interface
          </p>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-12">
              <TabsTrigger value="words" className="text-xs md:text-sm">Words</TabsTrigger>
              <TabsTrigger value="characters" className="text-xs md:text-sm">Characters</TabsTrigger>
              <TabsTrigger value="ai" className="text-xs md:text-sm">AI Gen</TabsTrigger>
              <TabsTrigger value="sync" className="text-xs md:text-sm">GitHub</TabsTrigger>
              <TabsTrigger value="data" className="text-xs md:text-sm">Data</TabsTrigger>
            </TabsList>

            {/* Words Management */}
            <TabsContent value="words" className="flex-1 overflow-hidden">
              <WordsManagement
                words={words}
                editingWord={editingWord}
                isLoading={isLoading}
                onEdit={setEditingWord}
                onSave={async (word) => {
                  setIsLoading(true);
                  try {
                    if (editingWord?.id) {
                      const updatedWord = await apiClient.updateWord(editingWord.id, word);
                      setWords(words.map((w) => (w.id === updatedWord.id ? updatedWord : w)));
                    } else {
                      const newWord = await apiClient.createWord(word);
                      setWords([...words, newWord]);
                    }
                    setEditingWord(null);
                  } catch (error) {
                    console.error('Failed to save word:', error);
                    alert('Failed to save word. Please try again.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                onDelete={async (id) => {
                  if (confirm('Are you sure you want to delete this word?')) {
                    setIsLoading(true);
                    try {
                      await apiClient.deleteWord(id);
                      setWords(words.filter((w) => w.id !== id));
                    } catch (error) {
                      console.error('Failed to delete word:', error);
                      alert('Failed to delete word. Please try again.');
                    } finally {
                      setIsLoading(false);
                    }
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
                isLoading={isLoading}
                onEdit={setEditingCharacter}
                onSave={async (character) => {
                  setIsLoading(true);
                  try {
                    if (editingCharacter?.id) {
                      const updatedChar = await apiClient.updateCharacter(editingCharacter.id, character);
                      setCharacters(characters.map((c) => (c.id === updatedChar.id ? updatedChar : c)));
                    } else {
                      const newChar = await apiClient.createCharacter(character);
                      setCharacters([...characters, newChar]);
                    }
                    setEditingCharacter(null);
                  } catch (error) {
                    console.error('Failed to save character:', error);
                    alert('Failed to save character. Please try again.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                onDelete={async (id) => {
                  if (confirm('Are you sure you want to delete this character?')) {
                    setIsLoading(true);
                    try {
                      await apiClient.deleteCharacter(id);
                      setCharacters(characters.filter((c) => c.id !== id));
                    } catch (error) {
                      console.error('Failed to delete character:', error);
                      alert('Failed to delete character. Please try again.');
                    } finally {
                      setIsLoading(false);
                    }
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

            {/* GitHub Sync */}
            <TabsContent value="sync" className="flex-1 overflow-hidden">
              <GitHubSyncManager
                syncStatus={syncStatus}
                isConnected={isConnected}
                githubToken={githubToken}
                githubRepo={githubRepo}
                onTokenChange={setGithubToken}
                onRepoChange={setGithubRepo}
                onSetupGitHub={setupGitHubIntegration}
                onRefreshStatus={checkConnectionStatus}
                onSyncData={async () => {
                  setIsLoading(true);
                  try {
                    await loadData();
                    await checkConnectionStatus();
                  } finally {
                    setIsLoading(false);
                  }
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
                onRefresh={loadData}
                isLoading={isLoading}
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
  isLoading,
  onEdit,
  onSave,
  onDelete,
  onCancel,
}: {
  words: Word[];
  editingWord: Word | null;
  isLoading: boolean;
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
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Word
        </Button>
      </div>

      <div className="flex-1 overflow-auto space-y-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin h-8 w-8 text-chakma-primary" />
          </div>
        ) : words.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No words added yet. Click "Add Word" to start.
          </div>
        ) : (
          words.map((word) => (
            <Card key={word.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-chakma text-chakma-primary">
                      {word.chakma_word_script}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /{word.romanized_pronunciation}/
                    </span>
                  </div>
                  <div className="font-medium">{word.english_translation}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(word)} disabled={isLoading}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(word.id)}
                    className="text-destructive"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
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
  const [audioUrl, setAudioUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    synonyms: false,
    antonyms: false,
    media: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalAudioUrl = formData.audio_pronunciation_url || audioUrl;
    let finalImageUrl = formData.explanation_media?.value || imageUrl;

    // Handle audio upload if file is selected
    if (audioFile) {
      setIsUploading(true);
      try {
        finalAudioUrl = await apiClient.uploadFile(audioFile, 'audio');
      } catch (error) {
        console.error("Audio upload failed:", error);
        alert("Audio upload failed. Please try again.");
        setIsUploading(false);
        return;
      }
    }

    // Handle image upload if file is selected
    if (imageFile) {
      try {
        finalImageUrl = await apiClient.uploadFile(imageFile, 'image');
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("Image upload failed. Please try again.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    onSave({
      ...formData,
      audio_pronunciation_url: finalAudioUrl,
      explanation_media: finalImageUrl ? {
        type: 'url' as const,
        value: finalImageUrl
      } : formData.explanation_media,
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
      alert("Please select a valid image file (JPG, PNG, WebP)");
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="h-full overflow-auto">
      <form onSubmit={handleSubmit} className="space-y-6 p-1">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b">
          <h3 className="text-xl font-semibold">
            {word.id ? "Edit Word" : "Add New Word"}
          </h3>
          <div className="flex gap-3">
            <Button type="submit" disabled={isUploading} className="h-12 px-6">
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
              className="h-12 px-6"
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-medium">Chakma Script *</Label>
              <Input
                value={formData.chakma_word_script}
                onChange={(e) =>
                  setFormData({ ...formData, chakma_word_script: e.target.value })
                }
                placeholder="𑄌𑄇𑄴𑄟"
                className="font-chakma text-lg h-12 mt-2"
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
                className="h-12 mt-2"
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
              className="h-12 mt-2"
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
              className="min-h-[120px] mt-2"
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
              className="min-h-[100px] mt-2"
              required
            />
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-4">
          {/* Synonyms Section */}
          <Collapsible 
            open={expandedSections.synonyms} 
            onOpenChange={() => toggleSection('synonyms')}
          >
            <CollapsibleTrigger asChild>
              <Button variant="outline" type="button" className="w-full justify-between h-12">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Synonyms & Antonyms
                </span>
                {expandedSections.synonyms ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <div>
                <Label className="text-sm">Synonyms (comma separated)</Label>
                <Input
                  value={formData.synonyms?.map(s => s.term).join(', ') || ''}
                  onChange={(e) => {
                    const terms = e.target.value.split(',').map(term => term.trim()).filter(Boolean);
                    setFormData({ 
                      ...formData, 
                      synonyms: terms.map(term => ({ term, language: 'english' as const }))
                    });
                  }}
                  placeholder="similar, alike, equivalent"
                  className="h-12 mt-2"
                />
              </div>
              <div>
                <Label className="text-sm">Antonyms (comma separated)</Label>
                <Input
                  value={formData.antonyms?.map(a => a.term).join(', ') || ''}
                  onChange={(e) => {
                    const terms = e.target.value.split(',').map(term => term.trim()).filter(Boolean);
                    setFormData({ 
                      ...formData, 
                      antonyms: terms.map(term => ({ term, language: 'english' as const }))
                    });
                  }}
                  placeholder="different, opposite, contrary"
                  className="h-12 mt-2"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Media Section */}
          <Collapsible 
            open={expandedSections.media} 
            onOpenChange={() => toggleSection('media')}
          >
            <CollapsibleTrigger asChild>
              <Button variant="outline" type="button" className="w-full justify-between h-12">
                <span className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Audio & Visual Media
                </span>
                {expandedSections.media ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronRight className="h-4 w-4" />
                }
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 mt-4">
              {/* Audio Section */}
              <div>
                <Label className="text-base font-medium">Audio Pronunciation</Label>
                <div className="space-y-4 mt-2">
                  {(formData.audio_pronunciation_url || audioUrl) && (
                    <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                      <Volume2 className="h-5 w-5 text-chakma-primary" />
                      <span className="text-sm text-muted-foreground flex-1">
                        Audio file available
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const audio = new Audio(formData.audio_pronunciation_url || audioUrl);
                          audio.play().catch(console.error);
                        }}
                        className="h-10 w-10"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Upload Audio File</Label>
                      <div className="relative mt-2">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Button type="button" variant="outline" className="w-full h-12">
                          <Music className="h-4 w-4 mr-2" />
                          {audioFile ? audioFile.name : "Choose Audio File"}
                        </Button>
                      </div>
                      {audioFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setAudioFile(null)}
                          className="mt-2"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm">Or Audio URL</Label>
                      <Input
                        value={audioUrl}
                        onChange={(e) => setAudioUrl(e.target.value)}
                        placeholder="https://example.com/audio.mp3"
                        className="h-12 mt-2"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: MP3, WAV, OGG. Max file size: 5MB
                  </p>
                </div>
              </div>

              {/* Image Section */}
              <div>
                <Label className="text-base font-medium">Visual Explanation</Label>
                <div className="space-y-4 mt-2">
                  {(formData.explanation_media?.value || imageUrl) && (
                    <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                      <Image className="h-5 w-5 text-chakma-primary" />
                      <span className="text-sm text-muted-foreground flex-1">
                        Image available
                      </span>
                      <img 
                        src={formData.explanation_media?.value || imageUrl} 
                        alt="Preview" 
                        className="h-12 w-12 object-cover rounded"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Upload Image</Label>
                      <div className="relative mt-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Button type="button" variant="outline" className="w-full h-12">
                          <Image className="h-4 w-4 mr-2" />
                          {imageFile ? imageFile.name : "Choose Image"}
                        </Button>
                      </div>
                      {imageFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setImageFile(null)}
                          className="mt-2"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm">Or Image URL</Label>
                      <Input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="h-12 mt-2"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: JPG, PNG, WebP. Max file size: 2MB
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </form>
    </div>
  );
}

// Characters Management Component
function CharactersManagement({
  characters,
  editingCharacter,
  isLoading,
  onEdit,
  onSave,
  onDelete,
  onCancel,
}: {
  characters: Character[];
  editingCharacter: Character | null;
  isLoading: boolean;
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
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Character
        </Button>
      </div>

      <div className="flex-1 overflow-auto space-y-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin h-8 w-8 text-chakma-primary" />
          </div>
        ) : characters.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No characters added yet. Click "Add Character" to start.
          </div>
        ) : (
          characters.map((character) => (
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
                    disabled={isLoading}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(character.id)}
                    className="text-destructive"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
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
  const [audioUrl, setAudioUrl] = useState("");

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

    let finalAudioUrl = formData.audio_pronunciation_url || audioUrl;

    if (audioFile) {
      setIsUploading(true);
      try {
        finalAudioUrl = await apiClient.uploadFile(audioFile, 'audio');
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
      audio_pronunciation_url: finalAudioUrl,
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
    <div className="h-full overflow-auto">
      <form onSubmit={handleSubmit} className="space-y-6 p-1">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b">
          <h3 className="text-xl font-semibold">
            {character.id ? "Edit Character" : "Add New Character"}
          </h3>
          <div className="flex gap-3">
            <Button type="submit" disabled={isUploading} className="h-12 px-6">
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
              className="h-12 px-6"
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-medium">Character Script *</Label>
              <Input
                value={formData.character_script}
                onChange={(e) =>
                  setFormData({ ...formData, character_script: e.target.value })
                }
                placeholder="𑄌"
                className="font-chakma text-3xl h-16 mt-2 text-center"
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
                className="h-12 mt-2"
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
              className="w-full px-4 py-3 mt-2 border border-input rounded-lg bg-background h-12 text-base"
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
              className="min-h-[100px] mt-2"
            />
          </div>

          {/* Audio Section */}
          <div>
            <Label className="text-base font-medium">Audio Pronunciation</Label>
            <div className="space-y-4 mt-2">
              {(formData.audio_pronunciation_url || audioUrl) && (
                <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                  <Volume2 className="h-5 w-5 text-chakma-primary" />
                  <span className="text-sm text-muted-foreground flex-1">
                    Audio file available
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const audio = new Audio(formData.audio_pronunciation_url || audioUrl);
                      audio.play().catch(console.error);
                    }}
                    className="h-10 w-10"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Upload Audio File</Label>
                  <div className="relative mt-2">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Button type="button" variant="outline" className="w-full h-12">
                      <Music className="h-4 w-4 mr-2" />
                      {audioFile ? audioFile.name : "Choose Audio File"}
                    </Button>
                  </div>
                  {audioFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAudioFile(null)}
                      className="mt-2"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <div>
                  <Label className="text-sm">Or Audio URL</Label>
                  <Input
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    placeholder="https://example.com/audio.mp3"
                    className="h-12 mt-2"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: MP3, WAV, OGG. Max file size: 5MB
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
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

// GitHub Sync Manager Component
function GitHubSyncManager({
  syncStatus,
  isConnected,
  githubToken,
  githubRepo,
  onTokenChange,
  onRepoChange,
  onSetupGitHub,
  onRefreshStatus,
  onSyncData,
}: {
  syncStatus: string;
  isConnected: boolean;
  githubToken: string;
  githubRepo: string;
  onTokenChange: (token: string) => void;
  onRepoChange: (repo: string) => void;
  onSetupGitHub: () => void;
  onRefreshStatus: () => void;
  onSyncData: () => void;
}) {
  return (
    <Collapsible open={true} className="w-full">
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between w-full cursor-pointer">
          <div className="flex items-center gap-2">
            <Github className="h-4 w-4 text-chakma-primary" />
            <span className="text-lg font-semibold">GitHub Sync</span>
            <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
              {isConnected ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
              {syncStatus}
            </Badge>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="github-token" className="text-sm">GitHub Token</Label>
              <Input
                id="github-token"
                type="password"
                value={githubToken}
                onChange={(e) => onTokenChange(e.target.value)}
                placeholder="Enter your GitHub token"
                className="h-10 text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Required for GitHub sync. Get one from <Link href="https://github.com/settings/tokens" target="_blank" className="underline">GitHub Settings</Link>.
              </p>
            </div>
            <div>
              <Label htmlFor="github-repo" className="text-sm">GitHub Repository</Label>
              <Input
                id="github-repo"
                type="text"
                value={githubRepo}
                onChange={(e) => onRepoChange(e.target.value)}
                placeholder="e.g., user/chakmalex-content"
                className="h-10 text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The repository where your content will be synced.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onRefreshStatus} disabled={isConnected}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
            <Button onClick={onSetupGitHub} disabled={!githubToken || !githubRepo || isConnected}>
              <Sync className="h-4 w-4 mr-2" />
              {isConnected ? "Synced" : "Setup GitHub"}
            </Button>
            <Button onClick={onSyncData} disabled={!isConnected || isLoading}>
              <Key className="h-4 w-4 mr-2" />
              Sync Data
            </Button>
          </div>

          <Separator />

          <div className="flex items-center text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 mr-2" />
            Syncing will overwrite existing content in the repository.
            <Link href="https://github.com/chakma-lex/chakma-lex/wiki/GitHub-Sync" target="_blank" className="ml-2 underline">
              Learn more
            </Link>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Data Management Component
function DataManagement({
  wordsCount,
  charactersCount,
  onExport,
  onImport,
  onRefresh,
  isLoading,
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
          <Button onClick={onExport} className="w-full" disabled={isLoading}>
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
            <Button className="w-full" disabled={isLoading}>
              <Upload className="h-4 w-4 mr-2" />
              Import Content
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-medium mb-3">Refresh Data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Reload content from the database
          </p>
          <Button onClick={onRefresh} className="w-full" disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </Card>
      </div>
    </div>
  );
}
