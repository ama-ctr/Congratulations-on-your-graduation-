
import React, { useState, useCallback } from 'react';
import { FormState, Hint, PolishedResult, Emotion } from './types';
import StepContainer from './components/StepContainer';
import * as geminiService from './services/geminiService';

const EMOTIONS = [
  { label: 'かっこよかった', icon: '✨', key: 'かっこよかった' },
  { label: 'やさしかった', icon: '🌸', key: 'やさしかった' },
  { label: 'あこがれ', icon: '💎', key: 'あこがれだった' },
  { label: 'さびしい', icon: '😢', key: 'さびしくなるよ' },
];

const App: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    who: '',
    what: '',
    feeling: '',
    otherFeeling: '',
    future: '',
    finalText: '',
    shortText: '',
  });

  const [hints, setHints] = useState<Hint[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'warning' } | null>(null);

  const handleInputChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEmotionSelect = (emotion: Emotion) => {
    setForm(prev => ({ ...prev, feeling: emotion, otherFeeling: '' }));
  };

  const fetchHints = async () => {
    setLoading(true);
    const result = await geminiService.getGraduationHints(form.who);
    setHints(result);
    setLoading(false);
  };

  const generateLetter = () => {
    if (!form.who || !form.what) {
      setMessage({ text: "名前と 思い出を かいてね！", type: 'warning' });
      return;
    }

    const currentFeeling = form.otherFeeling || form.feeling;

    // Standard version
    let letter = `${form.who} さんへ\n\n`;
    letter += `ご卒業おめでとうございます。\n`;
    letter += `${form.who}さんは、いつも ${form.what}ね。\n`;
    if (currentFeeling) letter += `そんな ${form.who}さんは、わたしにとって ${currentFeeling}な 存在でした。\n`;
    letter += `今まで 本当に ありがとうございました。\n`;
    if (form.future) letter += `中学校でも、${form.future}！\n`;
    letter += `ずっと おうえんしています。`;

    // Short version
    let short = `${form.who}さん、卒業おめでとう！\n${form.what}くれて ありがとう。\n${form.future}、おうえんしているよ！`;

    setForm(prev => ({ ...prev, finalText: letter, shortText: short }));
    setMessage(null);
  };

  const polishText = async () => {
    if (!form.finalText) return;
    setLoading(true);
    const result = await geminiService.polishLetter(form.finalText, form.shortText);
    if (result) {
      setForm(prev => ({ ...prev, finalText: result.long, shortText: result.short }));
      setMessage({ text: "✨ 魔法のペンで、もっと すてきに なったよ！", type: 'success' });
    }
    setLoading(false);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const uttr = new SpeechSynthesisUtterance(text);
      uttr.lang = 'ja-JP';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(uttr);
    }
  };

  const checkText = () => {
    if (!form.finalText) return;
    if (form.finalText.includes('ありがとう') && form.finalText.includes('おめでとう')) {
      setMessage({ text: "✅ バッチリ！ とても すてきな てがみだね！", type: 'success' });
      speak(form.finalText);
    } else {
      setMessage({ text: "⚠️ 「おめでとう」や「ありがとう」を いれると もっと よくなるよ！", type: 'warning' });
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 z-[1000] flex flex-col items-center justify-center no-print">
          <div className="w-12 h-12 border-4 border-[#f3f3f3] border-top-[#ff85b2] rounded-full animate-spin mb-4" />
          <p className="text-[#d81b60] font-bold">AIが メッセージを かんがえています...</p>
        </div>
      )}

      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-[0_8px_20px_rgba(255,182,193,0.3)] border-2 border-[#ffdae9] print-full">
        <header className="text-center mb-10 relative">
          <h1 className="text-2xl sm:text-3xl text-[#d81b60] font-bold relative inline-block pb-2 border-b-2 border-transparent">
            6年生へ ありがとう ワークシート
            <span className="ml-2">🌸</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">そつぎょうする お兄さん・お姉さんに おくる てがみを つくろう！</p>
        </header>

        {/* STEP 1 */}
        <StepContainer 
          step={1} 
          title="だれに おくる？" 
          description="ありがとうを つたえたい 6年生の名前を かこう。（例：〇〇班の〇〇さん、〇〇委員会の〇〇先輩）"
        >
          <input 
            type="text" 
            value={form.who}
            onChange={(e) => handleInputChange('who', e.target.value)}
            className="w-full p-3 text-lg border-2 border-dashed border-[#ffc1d6] rounded-xl focus:outline-none focus:border-[#d81b60] transition-colors"
            placeholder="（例）登校班の さくらさん"
          />
        </StepContainer>

        {/* STEP 2 */}
        <StepContainer 
          step={2} 
          title="どんな 思い出が ある？" 
          description="いっしょに して 楽しかったことや、うれしかったことを おもい出そう。おもい出せないときは、「AIヒント」をおしてみてね。"
        >
          <input 
            type="text" 
            value={form.what}
            onChange={(e) => handleInputChange('what', e.target.value)}
            className="w-full p-3 text-lg border-2 border-dashed border-[#ffc1d6] rounded-xl focus:outline-none focus:border-[#d81b60] transition-colors mb-4"
            placeholder="（例）そうじの やり方を やさしく おしえてくれた"
          />
          
          <button 
            onClick={fetchHints}
            className="inline-flex items-center gap-2 bg-[#9c27b0] text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity mb-4"
          >
            ✨ 6年生との思い出ヒント
          </button>

          <div className="flex flex-wrap gap-2">
            {hints.map((hint, idx) => (
              <button
                key={idx}
                onClick={() => handleInputChange('what', hint.text)}
                className="flex flex-col items-center bg-white border-2 border-[#fce4ec] rounded-xl w-32 overflow-hidden hover:scale-105 hover:border-[#ff85b2] transition-all"
              >
                <div className="h-16 flex items-center justify-center text-3xl bg-[#fff5f8] w-full">{hint.emoji}</div>
                <p className="p-2 text-[10px] leading-tight text-center">{hint.text}</p>
              </button>
            ))}
            {!hints.length && (
              ['登校班', '委員会', '昼休み', '運動会'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    const texts: Record<string, string> = {
                      '登校班': '登校班で やさしく こえを かけてくれた',
                      '委員会': '委員会で おしごとを やさしく おしえてくれた',
                      '昼休み': '昼休みに いっしょに あそんでくれた',
                      '運動会': '運動会で いっしょうけんめい 応援してくれた'
                    };
                    handleInputChange('what', texts[tag]);
                  }}
                  className="bg-[#fce4ec] text-[#d81b60] px-3 py-1.5 rounded-full text-xs hover:bg-[#ffc1d6] transition-colors"
                >
                  {tag}
                </button>
              ))
            )}
          </div>
        </StepContainer>

        {/* STEP 3 */}
        <StepContainer 
          step={3} 
          title="あなたの きもちは？" 
          description="6年生を みていて、どう 思ったかな？"
        >
          <div className="flex flex-wrap gap-3 justify-center sm:justify-between">
            {EMOTIONS.map((emotion) => (
              <button
                key={emotion.key}
                onClick={() => handleEmotionSelect(emotion.key as Emotion)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 w-24 sm:w-32 transition-all ${
                  form.feeling === emotion.key 
                    ? 'border-[#ff85b2] bg-[#fff0f5] scale-105 font-bold' 
                    : 'border-[#ffd1e0] bg-white'
                }`}
              >
                <span className="text-3xl mb-1">{emotion.icon}</span>
                <span className="text-xs sm:text-sm">{emotion.label}</span>
              </button>
            ))}
          </div>
          <input 
            type="text" 
            value={form.otherFeeling}
            onChange={(e) => {
              handleInputChange('otherFeeling', e.target.value);
              handleInputChange('feeling', '');
            }}
            className="w-full mt-4 p-3 border-2 border-dashed border-[#ffc1d6] rounded-xl focus:outline-none focus:border-[#d81b60]"
            placeholder="（例）じぶんも 〇〇さんのように なりたい"
          />
        </StepContainer>

        {/* STEP 4 */}
        <StepContainer 
          step={4} 
          title="これからの おうえん" 
          description="中学校に 行く 6年生に、なんて 言いたいかな？"
        >
          <input 
            type="text" 
            value={form.future}
            onChange={(e) => handleInputChange('future', e.target.value)}
            className="w-full p-3 text-lg border-2 border-dashed border-[#ffc1d6] rounded-xl focus:outline-none focus:border-[#d81b60] transition-colors mb-3"
            placeholder="（例）中学校でも 勉強や 部活を がんばってね"
          />
          <div className="flex flex-wrap gap-2">
            {['中学校でも おうえんしています', '中学校でも 笑顔で がんばってね', 'また 学校に あそびに きてね'].map(text => (
              <button
                key={text}
                onClick={() => handleInputChange('future', text)}
                className="bg-[#fce4ec] text-[#d81b60] px-3 py-1.5 rounded-full text-xs hover:bg-[#ffc1d6] transition-colors"
              >
                {text.length > 8 ? text.substring(0, 8) + '...' : text}
              </button>
            ))}
          </div>
        </StepContainer>

        <div className="flex justify-center mb-10 no-print">
          <button 
            onClick={generateLetter}
            className="bg-[#ff85b2] text-white text-xl font-bold px-12 py-4 rounded-full shadow-[0_4px_0_#d81b60] active:translate-y-1 active:shadow-none transition-all hover:bg-[#ff70a5]"
          >
            てがみの 文章を つくる！
          </button>
        </div>

        {/* FINAL OUTPUT */}
        <div className="bg-[#fffafa] border-[3px] border-double border-[#ffb6c1] p-6 sm:p-8 rounded-2xl print:bg-white print:border-none">
          <h3 className="text-center text-[#d81b60] text-xl font-bold mb-6 flex items-center justify-center gap-2">
            <span>✨</span> できあがった てがみ <span>✨</span>
          </h3>

          <div className="mb-6">
            <span className="inline-block bg-[#ff85b2] text-white px-3 py-1 rounded text-xs font-bold mb-2 no-print">
              つうじょう版（しっかり）
            </span>
            <textarea 
              value={form.finalText}
              onChange={(e) => handleInputChange('finalText', e.target.value)}
              rows={8}
              className="w-full p-4 border-2 border-dashed border-[#ffc1d6] rounded-xl bg-white focus:outline-none resize-none leading-relaxed print:border-solid print:p-0 print:border-none"
              placeholder="ここに文章がはいります。"
            />
          </div>

          <div className="mb-6 no-print">
            <span className="inline-block bg-[#ff85b2] text-white px-3 py-1 rounded text-xs font-bold mb-2">
              たんしゅく版（みじかめ）
            </span>
            <textarea 
              value={form.shortText}
              onChange={(e) => handleInputChange('shortText', e.target.value)}
              rows={4}
              className="w-full p-4 border-2 border-dashed border-[#ffc1d6] rounded-xl bg-white focus:outline-none resize-none leading-relaxed"
              placeholder="ここに短い文章がはいります。"
            />
          </div>

          <div className="text-right mb-6 no-print">
            <button 
              onClick={polishText}
              className="inline-flex items-center gap-2 bg-[#9c27b0] text-white px-4 py-2 rounded-full text-xs font-bold hover:opacity-90"
            >
              ✨ 魔法のペン (文章を もっと 温かくする)
            </button>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg text-sm transition-all animate-fade-in no-print ${
              message.type === 'success' ? 'bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]' : 'bg-[#fff3e0] text-[#e65100] border border-[#ffe0b2]'
            }`}>
              {message.text}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4 no-print">
            <button 
              onClick={checkText}
              className="bg-[#ff85b2] text-white px-6 py-2.5 rounded-full font-bold hover:opacity-90 transition-opacity"
            >
              👀 チェックする
            </button>
            <button 
              onClick={() => window.print()}
              className="bg-gray-600 text-white px-6 py-2.5 rounded-full font-bold hover:opacity-90 transition-opacity"
            >
              🖨️ 印刷する
            </button>
          </div>
        </div>
      </div>
      
      <footer className="text-center mt-12 text-gray-400 text-xs pb-8 no-print">
        &copy; 2025 6年生ありがとうワークシートAI
      </footer>
    </div>
  );
};

export default App;
