/**
 * About Page - Application information, legal documents, and contact
 * Features: App goals, instructions, terms, privacy, social links
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  BookOpen, 
  Users, 
  Globe, 
  Mail, 
  MessageCircle,
  Youtube,
  Facebook,
  Send,
  Shield,
  FileText,
  Target,
  Lightbulb,
  Star
} from 'lucide-react';

import { CONTACT_INFO } from '@shared/types';
import { FxanxInlineBrand, FxanxFooterBrand } from '@/components/FxanxWatermark';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-4xl font-chakma text-chakma-primary mb-2">
          𑄌𑄇𑄴𑄟𑄣𑄮𑄇𑄴𑄌
        </div>
        <h1 className="text-3xl font-bold text-foreground">ChakmaLex</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A comprehensive digital dictionary and language learning platform 
          dedicated to preserving and promoting the Chakma language.
        </p>
        <Badge variant="outline" className="text-sm">
          Version 1.0.0
        </Badge>
      </div>

      {/* App Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            ChakmaLex aims to preserve, promote, and facilitate learning of the Chakma language 
            through modern technology. We provide comprehensive word information including 
            translations, pronunciations, etymology, and cultural context.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="text-center space-y-2">
              <BookOpen className="h-8 w-8 text-chakma-primary mx-auto" />
              <h3 className="font-medium">Comprehensive Dictionary</h3>
              <p className="text-sm text-muted-foreground">
                Detailed word information with audio pronunciation, etymology, and examples
              </p>
            </div>
            <div className="text-center space-y-2">
              <Users className="h-8 w-8 text-chakma-secondary mx-auto" />
              <h3 className="font-medium">Community Learning</h3>
              <p className="text-sm text-muted-foreground">
                Interactive features to support both casual users and dedicated learners
              </p>
            </div>
            <div className="text-center space-y-2">
              <Globe className="h-8 w-8 text-chakma-accent mx-auto" />
              <h3 className="font-medium">Cultural Preservation</h3>
              <p className="text-sm text-muted-foreground">
                Maintaining linguistic heritage for future generations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Use */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            How to Use ChakmaLex
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Getting Started</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center text-xs">1</Badge>
                  Use the search bar to look up words in English, Chakma script, or romanized text
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center text-xs">2</Badge>
                  Click on any word to see detailed information including pronunciation and examples
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center text-xs">3</Badge>
                  Use the heart icon to save words to your favorites for later review
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center text-xs">4</Badge>
                  Explore the Characters section to learn the Chakma script
                </li>
              </ol>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Advanced Features</h3>
              <ol className="space-y-2 text-sm text-muted-foreground" start={5}>
                <li className="flex gap-2">
                  <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center text-xs">5</Badge>
                  Take AI-generated quizzes to test your knowledge
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center text-xs">6</Badge>
                  Customize your experience in Settings (themes, font size, audio)
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center text-xs">7</Badge>
                  Export your favorites and settings for backup
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center text-xs">8</Badge>
                  Use audio features to improve pronunciation
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Highlight */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Key Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Advanced Search', description: 'Search across multiple fields with intelligent matching' },
              { title: 'Audio Pronunciation', description: 'Native speaker recordings for correct pronunciation' },
              { title: 'Etymology & Examples', description: 'Word origins and practical usage examples' },
              { title: 'AI-Generated Quizzes', description: 'Dynamic learning assessments powered by AI' },
              { title: 'Personalization', description: 'Multiple themes, font sizes, and customization options' },
              { title: 'Offline Favorites', description: 'Save and manage your favorite words locally' }
            ].map((feature, index) => (
              <div key={index} className="p-4 rounded-lg border border-border">
                <h3 className="font-medium mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact & Social */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Connect With Us
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            We'd love to hear from you! Whether you have questions, suggestions, or just want to share 
            your experience with ChakmaLex, there are several ways to get in touch.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Social Media</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={CONTACT_INFO.facebook} target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-4 w-4 mr-2" />
                    Follow us on Facebook
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={CONTACT_INFO.youtube} target="_blank" rel="noopener noreferrer">
                    <Youtube className="h-4 w-4 mr-2" />
                    Subscribe to our YouTube
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={CONTACT_INFO.telegram} target="_blank" rel="noopener noreferrer">
                    <Send className="h-4 w-4 mr-2" />
                    Join our Telegram
                  </a>
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Email Contact</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`mailto:${CONTACT_INFO.email.personal}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Personal Inquiries
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`mailto:${CONTACT_INFO.email.support}?subject=ChakmaLex Feedback`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Feedback & Support
                  </a>
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p><strong>Support:</strong> {CONTACT_INFO.email.support}</p>
                <p>For bug reports, suggestions, and general feedback</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Legal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Terms and Conditions
              </h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  By using ChakmaLex, you agree to use this application responsibly and 
                  respect the intellectual property rights of the content provided.
                </p>
                <p>
                  The dictionary content is provided for educational and personal use. 
                  Commercial use requires explicit permission.
                </p>
                <p>
                  We strive for accuracy but cannot guarantee the completeness or 
                  correctness of all translations and definitions.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy Policy
              </h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  ChakmaLex respects your privacy. All your personal data (favorites, 
                  search history, settings) is stored locally on your device.
                </p>
                <p>
                  We do not collect, store, or transmit any personal information to 
                  external servers without your explicit consent.
                </p>
                <p>
                  Audio pronunciations may be loaded from external sources for 
                  performance optimization.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acknowledgments */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Heart className="h-8 w-8 text-red-500 mx-auto" />
            <h3 className="font-medium">Acknowledgments</h3>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              ChakmaLex is built with love for the Chakma community. Special thanks to all 
              the linguists, educators, and community members who contribute to preserving 
              and promoting the Chakma language and culture.
            </p>
            <Separator className="my-4" />
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                © 2024 ChakmaLex. Made with dedication for language preservation.
              </p>
              <FxanxFooterBrand />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
