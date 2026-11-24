import { useEffect, useMemo, useRef, useState } from 'react';
import { AI_MODELS } from './data/ais';
import './App.css';

const SUGGESTIONS = [
  'Объясни квантовые компьютеры простыми словами',
  'Составь план запуска стартапа',
  'Напиши идею для мобильного приложения',
  'Как выучить Python за 30 дней?',
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function buildAiResponse(ai, prompt) {
  const p = prompt.trim();
  const short = p.length > 120 ? p.slice(0, 117) + '...' : p;
  const templates = {
    structured: `**План от ${ai.name}:**\n1. Суть запроса: "${short}"\n2. Ключевые шаги: разбить задачу на подзадачи, выбрать инструменты, проверить результат.\n3. Рекомендация: начните с малого прототипа и быстро итераируйте.`,
    thoughtful: `Я рассмотрю это внимательно. По запросу "${short}" важно сначала определить цель, ограничения и критерии успеха. Мой совет: сформулируйте ожидаемый результат, затем двигайтесь небольшими проверяемыми шагами, сохраняя ясность и качество.`,
    broad: `По запросу "${short}" можно посмотреть на задачу широко: собрать контекст, сравнить варианты и выбрать практичный путь. Полезно объединить быстрый поиск фактов, анализ и конкретный план действий.`,
    bold: `Коротко и прямо: "${short}" — решаемо. Не усложняй. Определи цель, сделай первый шаг сегодня, проверь, что работает, и удваивай то, что даёт результат.`,
    open: `С точки зрения открытого подхода к "${short}": используйте прозрачные инструменты, документируйте решения и делайте решение воспроизводимым. Это даст гибкость и контроль.`,
    efficient: `Оптимальный путь для "${short}":\n- Цель: чётко сформулировать результат.\n- Действие: 3 приоритетных шага.\n- Проверка: метрика успеха через 24 часа.`,
    reasoning: `Разбор запроса "${short}":\n• Предпосылки: что известно и чего не хватает.\n• Логика: выбрать решение с наименьшими рисками.\n• Вывод: начать с проверяемой гипотезы и измеримого результата.`,
    multilingual: `Для запроса "${short}" полезен многоязычный и глобальный взгляд: соберите лучшие практики из разных источников, адаптируйте под вашу аудиторию и проверьте понятность формулировок.`,
    longform: `По теме "${short}" можно углубиться: выделите основной вопрос, соберите контекст, разложите на разделы и сформируйте итоговый вывод. Такой подход хорошо работает для больших задач и документов.`,
    search: `По запросу "${short}" я бы начал с проверки ключевых фактов и сравнения источников. Затем выделил бы 2-3 надёжных вывода и превратил их в практический план действий.`,
    productivity: `Для задачи "${short}" предлагаю рабочий режим:\n1. Определить итоговый артефакт.\n2. Назначить сроки и ответственных.\n3. Автоматизировать повторяющиеся шаги и зафиксировать следующий шаг.`,
    enterprise: `В контексте "${short}" для бизнеса важно: определить данные, выбрать процесс, встроить контроль качества и безопасность. Решение должно быть масштабируемым и измеримым.`,
  };
  return templates[ai.style] || templates.structured;
}

function buildAllResponse(prompt, selectedAis) {
  const p = prompt.trim();
  const short = p.length > 140 ? p.slice(0, 137) + '...' : p;
  const names = selectedAis.map((a) => a.name).join(', ');
  return {
    summary: `**ALLai синтез (${selectedAis.length} ИИ):**\n\nЗапрос: "${short}"\n\n**Общий ответ:**\nЛучший подход — объединить сильные стороны моделей: структурное планирование, глубокое рассуждение, проверку фактов и практическую реализацию. Начните с чёткой цели, разделите задачу на шаги, проверьте гипотезы данными и быстро итерируйте.\n\n**Что внесли модели:**`,
    points: selectedAis.slice(0, 8).map((ai) => ({
      ai,
      text: pickContribution(ai),
    })),
    names,
  };
}

function pickContribution(ai) {
  const map = {
    structured: `структурирует задачу и предлагает пошаговый план.`,
    thoughtful: `проверяет риски, ясность цели и качество ответа.`,
    broad: `добавляет широкий контекст и альтернативные варианты.`,
    bold: `упрощает решение и фокусирует на первом действии.`,
    open: `предлагает прозрачный и воспроизводимый подход.`,
    efficient: `оптимизирует путь до результата и экономит время.`,
    reasoning: `усиливает логику и проверяет выводы.`,
    multilingual: `адаптирует ответ под разные языки и аудитории.`,
    longform: `раскрывает тему глубже и системно.`,
    search: `подсказывает, какие факты стоит проверить.`,
    productivity: `превращает идею в рабочий процесс.`,
    enterprise: `оценивает масштабируемость и бизнес-применимость.`,
  };
  return `${ai.name} ${map[ai.style] || 'добавляет полезную перспективу.'}`;
}

function AiAvatar({ ai, size = 28 }) {
  return (
    <span
      className="ai-avatar"
      style={{
        width: size,
        height: size,
        minWidth: size,
        background: `linear-gradient(135deg, ${ai.color}, ${ai.accent || ai.color})`,
        fontSize: Math.max(11, Math.round(size * 0.42)),
      }}
      aria-hidden="true"
    >
      {ai.letter}
    </span>
  );
}

function MessageContent({ text }) {
  const lines = text.split('\n');
  return (
    <div className="message-content">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="msg-bold">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <p key={i} className="msg-li">{line}</p>;
        }
        const m = line.match(/^(\d+)\.\s(.*)/);
        if (m) return <p key={i} className="msg-li"><span className="msg-num">{m[1]}.</span>{m[2]}</p>;
        if (line.trim() === '') return <div key={i} className="msg-spacer" />;
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j}>{part.slice(2, -2)}</strong>
                : <span key={j}>{part}</span>
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function App() {
  const [selectedIds, setSelectedIds] = useState(() => new Set(AI_MODELS.map((a) => a.id)));
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const selectedAis = useMemo(
    () => AI_MODELS.filter((a) => selectedIds.has(a.id)),
    [selectedIds]
  );
  const allSelected = selectedIds.size === AI_MODELS.length;
  const noneSelected = selectedIds.size === 0;

  const filteredAis = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return AI_MODELS;
    return AI_MODELS.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.company.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
    );
  }, [search]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping]);

  function toggleAi(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds((prev) => {
      if (prev.size === AI_MODELS.length) return new Set();
      return new Set(AI_MODELS.map((a) => a.id));
    });
  }

  async function sendMessage(text) {
    const prompt = (text ?? input).trim();
    if (!prompt || isTyping) return;
    if (selectedAis.length === 0) return;
    const userMsg = { id: uid(), role: 'user', text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setSidebarOpen(false);

    const delay = allSelected ? 900 : 500 + Math.min(selectedAis.length, 4) * 180;
    await new Promise((r) => setTimeout(r, delay));

    if (allSelected || selectedAis.length > 3) {
      const all = buildAllResponse(prompt, selectedAis);
      const aiMsg = {
        id: uid(),
        role: 'assistant',
        mode: 'all',
        text: all.summary,
        points: all.points,
        contributors: selectedAis,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } else {
      const replies = selectedAis.map((ai) => ({
        ai,
        text: buildAiResponse(ai, prompt),
      }));
      const aiMsg = {
        id: uid(),
        role: 'assistant',
        mode: 'multi',
        replies,
        contributors: selectedAis,
      };
      setMessages((prev) => [...prev, aiMsg]);
    }
    setIsTyping(false);
  }

  function onSubmit(e) {
    e.preventDefault();
    sendMessage();
  }

  function clearChat() {
    setMessages([]);
    setInput('');
    inputRef.current?.focus();
  }

  const modeLabel = allSelected
    ? `ALL режим: ${AI_MODELS.length} ИИ`
    : noneSelected
      ? 'Выберите ИИ'
      : `${selectedAis.length} ИИ выбрано`;

  return (
    <div className="app">
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-mark">A</div>
            <div>
              <div className="brand-name">ALLai</div>
              <div className="brand-sub">Все ИИ в одном месте</div>
            </div>
          </div>
          <button className="ghost-btn sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Закрыть меню">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6 6 18"/></svg>
          </button>
        </div>

        <div className="sidebar-section">
          <button
            className={`all-toggle ${allSelected ? 'active' : ''}`}
            onClick={toggleAll}
            type="button"
          >
            <div className="all-toggle-left">
              <span className="all-orb" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <div>
                <div className="all-toggle-title">ALL</div>
                <div className="all-toggle-sub">Все ИИ мира работают вместе</div>
              </div>
            </div>
            <span className={`all-count ${allSelected ? 'active' : ''}`}>{AI_MODELS.length}</span>
          </button>
        </div>

        <div className="sidebar-section search-wrap">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Найти ИИ..."
            aria-label="Поиск ИИ"
          />
        </div>

        <div className="sidebar-section sidebar-meta">
          <span>{selectedIds.size} / {AI_MODELS.length} выбрано</span>
          {selectedIds.size > 0 && !allSelected && (
            <button className="text-btn" onClick={toggleAll} type="button">Выбрать все</button>
          )}
          {allSelected && (
            <button className="text-btn" onClick={() => setSelectedIds(new Set())} type="button">Снять все</button>
          )}
        </div>

        <div className="ai-list" role="listbox" aria-label="Список ИИ">
          {filteredAis.map((ai) => {
            const active = selectedIds.has(ai.id);
            return (
              <div
                key={ai.id}
                className={`ai-item ${active ? 'active' : ''}`}
                role="option"
                aria-selected={active}
                onClick={() => toggleAi(ai.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAi(ai.id); } }}
                tabIndex={0}
              >
                <AiAvatar ai={ai} size={34} />
                <div className="ai-item-body">
                  <div className="ai-item-top">
                    <span className="ai-item-name">{ai.name}</span>
                    <span className="ai-item-company">{ai.company}</span>
                  </div>
                  <div className="ai-item-desc">{ai.description}</div>
                </div>
                <div className={`ai-check ${active ? 'checked' : ''}`} aria-hidden="true">
                  {active && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>}
                </div>
              </div>
            );
          })}
          {filteredAis.length === 0 && (
            <div className="empty-list">Ничего не найдено</div>
          )}
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="ghost-btn menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Открыть меню">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
          <div className="topbar-center">
            <div className="mode-pill">
              <span className={`mode-dot ${allSelected ? 'all' : noneSelected ? 'none' : 'some'}`} />
              {modeLabel}
            </div>
            <div className="topbar-sub">
              {allSelected
                ? 'Единый ответ от всех подключённых ИИ'
                : noneSelected
                  ? 'Откройте меню и выберите модели'
                  : 'Ответы от выбранных моделей'}
            </div>
          </div>
          <button className="ghost-btn" onClick={clearChat} type="button" title="Новый чат">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            <span className="btn-label">Новый чат</span>
          </button>
        </header>

        <div className="chat">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-badge">ALLai HUB</div>
              <h1>Все ИИ мира.<br /><span className="gradient-text">В одном интерфейсе.</span></h1>
              <p className="welcome-text">
                Выберите нужные ИИ в меню или включите режим <strong>ALL</strong>, чтобы все модели работали вместе над вашим запросом.
              </p>
              <div className="welcome-stats">
                <div className="stat">
                  <div className="stat-value">{AI_MODELS.length}</div>
                  <div className="stat-label">ИИ моделей</div>
                </div>
                <div className="stat">
                  <div className="stat-value">1</div>
                  <div className="stat-label">Единый чат</div>
                </div>
                <div className="stat">
                  <div className="stat-value">ALL</div>
                  <div className="stat-label">Общий режим</div>
                </div>
              </div>
              <div className="suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="suggestion" onClick={() => sendMessage(s)} type="button">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.role}`}>
                  {msg.role === 'user' ? (
                    <div className="user-bubble">
                      <div className="user-bubble-text">{msg.text}</div>
                    </div>
                  ) : (
                    <div className="assistant-block">
                      <div className="assistant-head">
                        {msg.mode === 'all' ? (
                          <>
                            <div className="all-avatar" aria-hidden="true">
                              <span>ALL</span>
                            </div>
                            <div>
                              <div className="assistant-name">ALLai</div>
                              <div className="assistant-meta">{msg.contributors.length} ИИ объединили ответ</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="multi-avatars">
                              {msg.contributors.slice(0, 4).map((ai) => (
                                <AiAvatar key={ai.id} ai={ai} size={28} />
                              ))}
                            </div>
                            <div>
                              <div className="assistant-name">Выбранные ИИ</div>
                              <div className="assistant-meta">{msg.contributors.map((a) => a.name).join(', ')}</div>
                            </div>
                          </>
                        )}
                      </div>

                      {msg.mode === 'all' ? (
                        <div className="assistant-card all-card">
                          <MessageContent text={msg.text} />
                          <div className="contrib-grid">
                            {msg.points.map((p) => (
                              <div key={p.ai.id} className="contrib-item">
                                <AiAvatar ai={p.ai} size={22} />
                                <span className="contrib-text">{p.text}</span>
                              </div>
                            ))}
                          </div>
                          {msg.contributors.length > 8 && (
                            <div className="contrib-more">+ ещё {msg.contributors.length - 8} моделей участвовали в синтезе</div>
                          )}
                        </div>
                      ) : (
                        <div className="reply-grid">
                          {msg.replies.map((r) => (
                            <div key={r.ai.id} className="assistant-card">
                              <div className="reply-head">
                                <AiAvatar ai={r.ai} size={26} />
                                <div>
                                  <div className="reply-name">{r.ai.name}</div>
                                  <div className="reply-company">{r.ai.company}</div>
                                </div>
                              </div>
                              <MessageContent text={r.text} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="message assistant">
                  <div className="assistant-block">
                    <div className="assistant-card typing-card">
                      <div className="typing-dots" aria-label="ИИ отвечают">
                        <span /><span /><span />
                      </div>
                      <span className="typing-text">
                        {allSelected ? 'Все ИИ формируют ответ...' : 'Выбранные ИИ отвечают...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        <div className="composer-wrap">
          {noneSelected && (
            <div className="composer-warning">Выберите хотя бы один ИИ в меню, чтобы отправить запрос.</div>
          )}
          <form className="composer" onSubmit={onSubmit}>
            <textarea
              ref={inputRef}
              className="composer-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={allSelected ? 'Спросите у всех ИИ сразу...' : 'Введите сообщение...'}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={noneSelected}
            />
            <button
              className="send-btn"
              type="submit"
              disabled={noneSelected || !input.trim() || isTyping}
              aria-label="Отправить"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
          </form>
          <div className="composer-note">
            ALLai — демо-интерфейс, объединяющий модели в одном меню. Ответы генерируются локально для демонстрации концепции.
          </div>
        </div>
      </main>
    </div>
  );
}
