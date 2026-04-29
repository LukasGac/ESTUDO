# estudo-concurso

SPA de flashcards com Spaced Repetition System (SRS) para preparação de concursos públicos.

## Stack

React 18 · TypeScript strict · Vite · Zustand · Tailwind CSS · Framer Motion · Vitest

## Comandos

```bash
npm run dev      # servidor de desenvolvimento
npm test         # testes (Vitest, modo watch)
npm run build    # build de produção
npm run lint     # ESLint
```

## Arquitetura

```
src/
├── components/   # UI organizada por feature (cards/, decks/, flashcard/, layout/, ui/)
├── pages/        # Home, Study, Manage
├── store/        # Estado global Zustand (deckStore, studyStore)
├── lib/          # Lógica de domínio: srs.ts (algoritmo SRS), storage.ts, utils.ts
├── data/         # Dados de exemplo (petrobras.ts, seed.ts)
├── types/        # Tipos compartilhados (index.ts)
└── constants/    # Constantes SRS
```

**Roteamento:** React Router DOM (client-side)  
**State:** Zustand — sem Redux, sem Context para dados  
**Algoritmo central:** `src/lib/srs.ts` — não tocar sem entender o algoritmo completo  
**Alias:** `@/` → `src/`

## Convenções

- TypeScript strict — sem `any`, sem `as unknown`
- Tailwind para estilos — sem CSS modules, sem styled-components
- `clsx` + `tailwind-merge` para classes condicionais
- Framer Motion para animações
- Lucide React para ícones
- Testes em `src/test/` com Vitest + Testing Library
