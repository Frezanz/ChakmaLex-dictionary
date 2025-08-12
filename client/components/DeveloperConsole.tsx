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
  CharacterFormData,
  CharacterType,
  RelatedTerm,
} from "@shared/types";
import { DeveloperConsoleManager } from "@/lib/storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWords,
  createWord,
  updateWord,
  deleteWord,
  fetchCharacters,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from "@/lib/api";
import { toast } from "sonner";

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
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null,
  );
  const [aiGeneratedWords, setAiGeneratedWords] = useState<string[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const queryClient = useQueryClient();
  const wordsQuery = useQuery({
    queryKey: ["words"],
    queryFn: fetchWords,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
  const charactersQuery = useQuery({
    queryKey: ["characters"],
    queryFn: fetchCharacters,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const createWordMutation = useMutation({
    mutationFn: (payload: Partial<Word>) => createWord(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["words"] }),
  });
  const updateWordMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Word> }) =>
      updateWord(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["words"] }),
  });
  const deleteWordMutation = useMutation({
    mutationFn: (id: string) => deleteWord(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["words"] }),
  });

  const createCharacterMutation = useMutation({
    mutationFn: (payload: Partial<Character>) => createCharacter(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["characters"] }),
  });
  const updateCharacterMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Character> }) =>
      updateCharacter(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["characters"] }),
  });
  const deleteCharacterMutation = useMutation({
    mutationFn: (id: string) => deleteCharacter(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["characters"] }),
  });

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
      words: wordsQuery.data || [],
      characters: charactersQuery.data || [],
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

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data.words)) {
          for (const w of data.words as Word[]) {
            const { id, ...payload } = w;
            await createWordMutation.mutateAsync(payload);
          }
        }
        if (Array.isArray(data.characters)) {
          for (const c of data.characters as Character[]) {
            const { id, ...payload } = c;
            await createCharacterMutation.mutateAsync(payload);
          }
        }
        toast.success("Data imported successfully!");
      } catch (error) {
        toast.error("Import failed: Invalid file format");
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
              {(wordsQuery.isLoading || wordsQuery.isFetching) && (
                <div className="text-sm text-muted-foreground mb-2">Syncing words...</div>
              )}
              <WordsManagement
                words={wordsQuery.data || []}
                editingWord={editingWord}
                onEdit={setEditingWord}
                onSave={async (word) => {
                  try {
                    if (editingWord && editingWord.id) {
                      await updateWordMutation.mutateAsync({ id: editingWord.id, payload: word });
                      toast.success("Word updated");
                    } else {
                      const { id, ...payload } = word;
                      await createWordMutation.mutateAsync(payload);
                      toast.success("Word created");
                    }
                  } catch (err: any) {
                    toast.error(err?.message || "Failed to save word");
                  } finally {
                    setEditingWord(null);
                  }
                }}
                onDelete={async (id) => {
                  try {
                    await deleteWordMutation.mutateAsync(id);
                    toast.success("Word deleted");
                  } catch (err: any) {
                    toast.error(err?.message || "Failed to delete word");
                  }
                }}
                onCancel={() => setEditingWord(null)}
              />
            </TabsContent>

            {/* Characters Management */}
            <TabsContent value="characters" className="flex-1 overflow-hidden">
              {(charactersQuery.isLoading || charactersQuery.isFetching) && (
                <div className="text-sm text-muted-foreground mb-2">Syncing characters...</div>
              )}
              <CharactersManagement
                characters={charactersQuery.data || []}
                editingCharacter={editingCharacter}
                onEdit={setEditingCharacter}
                onSave={async (character) => {
                  try {
                    if (editingCharacter && editingCharacter.id) {
                      await updateCharacterMutation.mutateAsync({ id: editingCharacter.id, payload: character });
                      toast.success("Character updated");
                    } else {
                      const { id, ...payload } = character;
                      await createCharacterMutation.mutateAsync(payload);
                      toast.success("Character created");
                    }
                  } catch (err: any) {
                    toast.error(err?.message || "Failed to save character");
                  } finally {
                    setEditingCharacter(null);
                  }
                }}
                onDelete={async (id) => {
                  try {
                    await deleteCharacterMutation.mutateAsync(id);
                    toast.success("Character deleted");
                  } catch (err: any) {
                    toast.error(err?.message || "Failed to delete character");
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
                wordsCount={(wordsQuery.data || []).length}
                charactersCount={(charactersQuery.data || []).length}
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
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Word
        </Button>
      </div>

      <div className="flex-1 overflow-auto space-y-2">
        {words.map((word) => (
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
                <Button variant="ghost" size="sm" onClick={() => onEdit(word)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(word.id)}
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

  const [newSynonym, setNewSynonym] = useState("");
  const [newSynonymLang, setNewSynonymLang] = useState<"chakma" | "english">("chakma");
  const [newAntonym, setNewAntonym] = useState("");
  const [newAntonymLang, setNewAntonymLang] = useState<"chakma" | "english">("chakma");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let audioUrl = formData.audio_pronunciation_url;

    // Handle audio upload if file is selected
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Chakma Script *</Label>
          <Input
            value={formData.chakma_word_script}
            onChange={(e) =>
              setFormData({ ...formData, chakma_word_script: e.target.value })
            }
            placeholder="Chakma text"
            className="font-chakma"
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
          required
        />
      </div>

      {/* Synonyms */}
      <div className="space-y-2">
        <Label>Synonyms</Label>
        <div className="flex gap-2">
          <Input
            value={newSynonym}
            onChange={(e) => setNewSynonym(e.target.value)}
            placeholder="Add synonym term"
          />
          <select
            value={newSynonymLang}
            onChange={(e) => setNewSynonymLang(e.target.value as any)}
            className="px-3 py-2 border border-input rounded-lg bg-background"
          >
            <option value="chakma">Chakma</option>
            <option value="english">English</option>
          </select>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const term = newSynonym.trim();
              if (!term) return;
              const updated = [...(formData.synonyms || []), { term, language: newSynonymLang } as RelatedTerm];
              setFormData({ ...formData, synonyms: updated });
              setNewSynonym("");
            }}
          >
            Add
          </Button>
        </div>
        {(formData.synonyms || []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(formData.synonyms || []).map((syn, idx) => (
              <Badge key={idx} variant="secondary" className={cn(syn.language === "chakma" && "font-chakma") }>
                {syn.term}
                <button
                  type="button"
                  className="ml-2 text-xs"
                  onClick={() => {
                    const updated = (formData.synonyms || []).filter((_, i) => i !== idx);
                    setFormData({ ...formData, synonyms: updated });
                  }}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Antonyms */}
      <div className="space-y-2">
        <Label>Antonyms</Label>
        <div className="flex gap-2">
          <Input
            value={newAntonym}
            onChange={(e) => setNewAntonym(e.target.value)}
            placeholder="Add antonym term"
          />
          <select
            value={newAntonymLang}
            onChange={(e) => setNewAntonymLang(e.target.value as any)}
            className="px-3 py-2 border border-input rounded-lg bg-background"
          >
            <option value="chakma">Chakma</option>
            <option value="english">English</option>
          </select>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const term = newAntonym.trim();
              if (!term) return;
              const updated = [...(formData.antonyms || []), { term, language: newAntonymLang } as RelatedTerm];
              setFormData({ ...formData, antonyms: updated });
              setNewAntonym("");
            }}
          >
            Add
          </Button>
        </div>
        {(formData.antonyms || []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(formData.antonyms || []).map((ant, idx) => (
              <Badge key={idx} variant="outline" className={cn(ant.language === "chakma" && "font-chakma") }>
                {ant.term}
                <button
                  type="button"
                  className="ml-2 text-xs"
                  onClick={() => {
                    const updated = (formData.antonyms || []).filter((_, i) => i !== idx);
                    setFormData({ ...formData, antonyms: updated });
                  }}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label>Example Sentence *</Label>
        <Textarea
          value={formData.example_sentence}
          onChange={(e) =>
            setFormData({ ...formData, example_sentence: e.target.value })
          }
          placeholder="Example usage in Chakma with English translation"
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
