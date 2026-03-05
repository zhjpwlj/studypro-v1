
import React, { useState, useContext } from 'react';
import { Deck, Flashcard } from '../types';
import { Plus, Play, Trash2, Check, BookOpen, Layers } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';

interface FlashcardsProps {
  decks: Deck[];
  onAddDeck: (title: string) => void;
  onDeleteDeck: (id: string) => void;
  onAddCard: (deckId: string, front: string, back: string) => void;
  onUpdateCard: (deckId: string, cardId: string, updates: Partial<Flashcard>) => void;
  onDeleteCard: (deckId: string, cardId: string) => void;
}

const StudySession: React.FC<{ deck: Deck, onFinish: () => void, onUpdateCard: (deckId: string, cardId: string, updates: Partial<Flashcard>) => void }> = ({ deck, onFinish, onUpdateCard }) => {
    const { t } = useContext(LanguageContext);
    const [queue] = useState<Flashcard[]>(deck.cards.sort((a, b) => a.nextReview - b.nextReview));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [finished, setFinished] = useState(false);

    const currentCard = queue[currentIndex];

    const handleRate = (difficulty: 'easy' | 'good' | 'hard' | 'again'): void => {
        // Simple SRS Logic (Leitner-ish)
        let newBox = currentCard.box;
        let nextReview = Date.now();
        const DAY = 24 * 60 * 60 * 1000;

        switch(difficulty) {
            case 'easy': newBox = Math.min(newBox + 1, 5); nextReview += newBox * 2 * DAY; break;
            case 'good': newBox = Math.min(newBox + 1, 5); nextReview += newBox * 1 * DAY; break;
            case 'hard': newBox = Math.max(newBox - 1, 0); nextReview += DAY * 0.5; break;
            case 'again': newBox = 0; nextReview += 1000 * 60; break; // 1 min
        }

        onUpdateCard(deck.id, currentCard.id, { box: newBox, nextReview });

        if (currentIndex < queue.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        } else {
            setFinished(true);
        }
    };

    if (finished) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-900">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <Check size={40} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{t('sessionComplete')}</h2>
                <p className="text-slate-500 mb-6">{t('sessionCompleteDesc')}</p>
                <button onClick={onFinish} className="px-6 py-3 bg-[var(--accent-color)] text-white rounded-xl font-bold shadow-lg hover:brightness-110">{t('backToDecks')}</button>
            </div>
        )
    }

    if (!currentCard) {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                 <p className="text-slate-500">{t('noCards')}</p>
                 <button onClick={onFinish} className="mt-4 text-[var(--accent-color)] font-medium hover:underline">{t('goBack')}</button>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-slate-100 dark:bg-slate-950 p-6">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onFinish} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">{t('exitStudy')}</button>
                <span className="text-sm font-medium text-slate-400">{currentIndex + 1} / {queue.length}</span>
            </div>
            
            <div className="flex-1 perspective-1000 relative flex items-center justify-center">
                 <div 
                    className={`w-full max-w-2xl aspect-[3/2] bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center p-8 text-center cursor-pointer transition-transform duration-500 transform-style-3d border border-gray-200 dark:border-slate-700 ${isFlipped ? 'rotate-y-180' : ''}`}
                    onClick={() => setIsFlipped(!isFlipped)}
                 >
                     <div className="text-3xl font-medium text-slate-800 dark:text-white select-none">
                         {isFlipped ? currentCard.back : currentCard.front}
                     </div>
                     <div className="absolute bottom-4 text-xs text-gray-400 uppercase tracking-widest pointer-events-none">
                         {isFlipped ? t('answer') : t('question')}
                     </div>
                 </div>
            </div>

            <div className="h-24 flex items-center justify-center gap-4 mt-8">
                {!isFlipped ? (
                    <button onClick={() => setIsFlipped(true)} className="w-full max-w-xs py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg">{t('showAnswer')}</button>
                ) : (
                    <>
                        <button onClick={() => handleRate('again')} className="flex-1 py-3 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">{t('again')}</button>
                        <button onClick={() => handleRate('hard')} className="flex-1 py-3 bg-orange-100 text-orange-700 rounded-xl font-bold hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400">{t('hard')}</button>
                        <button onClick={() => handleRate('good')} className="flex-1 py-3 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">{t('good')}</button>
                        <button onClick={() => handleRate('easy')} className="flex-1 py-3 bg-green-100 text-green-700 rounded-xl font-bold hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">{t('easy')}</button>
                    </>
                )}
            </div>
        </div>
    )
};

const Flashcards: React.FC<FlashcardsProps> = ({ decks, onAddDeck, onDeleteDeck, onAddCard, onUpdateCard, onDeleteCard }) => {
  const { t } = useContext(LanguageContext);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [isStudying, setIsStudying] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [isAddingDeck, setIsAddingDeck] = useState(false);
  
  // Card adding state
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);

  const activeDeck = decks.find(d => d.id === activeDeckId);

  const handleCreateDeck = (e: React.FormEvent): void => {
      e.preventDefault();
      if(newDeckTitle.trim()) {
          onAddDeck(newDeckTitle);
          setNewDeckTitle('');
          setIsAddingDeck(false);
      }
  };

  const handleCreateCard = (e: React.FormEvent): void => {
      e.preventDefault();
      if(front.trim() && back.trim() && activeDeckId) {
          onAddCard(activeDeckId, front, back);
          setFront('');
          setBack('');
          setIsAddingCard(false);
      }
  };

  if (isStudying && activeDeck) {
      return <StudySession deck={activeDeck} onFinish={() => setIsStudying(false)} onUpdateCard={onUpdateCard} />;
  }

  return (
    <div className="h-full flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                <h2 className="font-bold flex items-center gap-2"><Layers size={18} className="text-[var(--accent-color)]"/> {t('decks')}</h2>
                <button onClick={() => setIsAddingDeck(true)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"><Plus size={18}/></button>
            </div>
            
            {isAddingDeck && (
                <form onSubmit={handleCreateDeck} className="p-2 border-b border-gray-200 dark:border-slate-700">
                    <input 
                        autoFocus
                        type="text" 
                        value={newDeckTitle} 
                        onChange={e => setNewDeckTitle(e.target.value)}
                        placeholder={t('deckNamePlaceholder')}
                        className="w-full px-2 py-1 bg-gray-50 dark:bg-slate-900 border rounded text-sm focus:outline-none focus:border-[var(--accent-color)]"
                        onBlur={() => !newDeckTitle && setIsAddingDeck(false)}
                    />
                </form>
            )}

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {decks.map(deck => (
                    <button 
                        key={deck.id}
                        onClick={() => setActiveDeckId(deck.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between group ${activeDeckId === deck.id ? 'bg-[var(--accent-color)] text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                    >
                        <span className="truncate">{deck.title}</span>
                        <div className="flex items-center gap-2 text-xs opacity-70">
                            <span>{deck.cards.length}</span>
                            <span onClick={(e) => { e.stopPropagation(); onDeleteDeck(deck.id); }} className="hover:text-red-300 opacity-0 group-hover:opacity-100"><Trash2 size={12}/></span>
                        </div>
                    </button>
                ))}
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
            {activeDeck ? (
                <>
                    <header className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">{activeDeck.title}</h1>
                            <p className="text-slate-500 text-sm">{activeDeck.cards.length} {t('cardsCount')}</p>
                        </div>
                        <button 
                            onClick={() => setIsStudying(true)}
                            disabled={activeDeck.cards.length === 0}
                            className="bg-[var(--accent-color)] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                        >
                            <Play size={20} fill="currentColor" /> {t('studyNow')}
                        </button>
                    </header>
                    
                    <div className="flex-1 overflow-y-auto p-6">
                         {/* Card List */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <button 
                                onClick={() => setIsAddingCard(true)}
                                className="h-32 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-colors bg-white/50 dark:bg-slate-800/50"
                             >
                                 <Plus size={32} />
                                 <span className="font-medium">{t('addNewCard')}</span>
                             </button>

                             {activeDeck.cards.map(card => (
                                 <div key={card.id} className="relative group bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                     <div className="text-sm font-bold text-gray-500 uppercase mb-1">{t('front')}</div>
                                     <div className="mb-4 text-lg">{card.front}</div>
                                     <div className="w-full h-px bg-gray-100 dark:bg-slate-700 mb-3"></div>
                                     <div className="text-sm font-bold text-gray-500 uppercase mb-1">{t('back')}</div>
                                     <div className="text-slate-700 dark:text-slate-300">{card.back}</div>
                                     
                                     <button 
                                        onClick={() => onDeleteCard(activeDeck.id, card.id)}
                                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                     >
                                         <Trash2 size={16} />
                                     </button>
                                 </div>
                             ))}
                         </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <BookOpen size={64} className="mb-4 opacity-20"/>
                    <p className="text-lg font-medium">{t('selectDeck')}</p>
                </div>
            )}
        </main>

        {/* Add Card Modal */}
        {isAddingCard && (
             <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                 <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-slate-700">
                     <h3 className="text-xl font-bold mb-4">{t('newFlashcard')}</h3>
                     <form onSubmit={handleCreateCard} className="space-y-4">
                         <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('front')} ({t('question')})</label>
                             <textarea 
                                autoFocus
                                value={front}
                                onChange={e => setFront(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-[var(--accent-color)] resize-none h-24"
                                placeholder={t('enterQuestion')}
                             />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('back')} ({t('answer')})</label>
                             <textarea 
                                value={back}
                                onChange={e => setBack(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-[var(--accent-color)] resize-none h-24"
                                placeholder={t('enterAnswer')}
                             />
                         </div>
                         <div className="flex justify-end gap-3 pt-2">
                             <button type="button" onClick={() => setIsAddingCard(false)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">{t('cancel')}</button>
                             <button type="submit" disabled={!front.trim() || !back.trim()} className="px-6 py-2 bg-[var(--accent-color)] text-white rounded-lg font-bold hover:brightness-110 disabled:opacity-50">{t('addCard')}</button>
                         </div>
                     </form>
                 </div>
             </div>
        )}
    </div>
  );
};

export default Flashcards;
