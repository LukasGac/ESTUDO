import { Card, Deck } from '@/types'
import { SRS } from '@/constants/srs'

const now = new Date().toISOString()

export const SEED_DECK: Deck = {
  id: 'deck-dir-const',
  name: 'Direito Constitucional',
  description: 'Princípios fundamentais, direitos e garantias, organização do Estado',
  color: 'blue',
  icon: '⚖️',
  createdAt: now,
  updatedAt: now,
}

function makeCard(id: string, front: string, back: string): Card {
  return {
    id,
    deckId: SEED_DECK.id,
    front,
    back,
    status: 'new',
    intervalDays: 0,
    easeFactor: SRS.INITIAL_EASE_FACTOR,
    repetitions: 0,
    dueDate: now,
    lastReviewed: null,
    totalReviews: 0,
    correctReviews: 0,
    createdAt: now,
    updatedAt: now,
  }
}

export const SEED_CARDS: Card[] = [
  makeCard(
    'card-dc-01',
    'O que é uma Constituição e qual é a classificação da CF/88 quanto à origem?',
    'Constituição é a lei fundamental que organiza o Estado, define direitos e limita o poder.\n\nA CF/88 é **promulgada** (democrática) — elaborada por uma Assembleia Nacional Constituinte eleita pelo povo, diferente das outorgadas (impostas pelo governante).'
  ),
  makeCard(
    'card-dc-02',
    'Quais são as cláusulas pétreas da CF/88? (Art. 60, §4º)',
    'Não podem ser abolidas nem por emenda constitucional:\n\n① A **forma federativa** de Estado\n② O **voto direto, secreto, universal e periódico**\n③ A **separação dos Poderes**\n④ Os **direitos e garantias individuais**\n\nMacete: **FSSD** — Federação, Sufrágio, Separação, Direitos.'
  ),
  makeCard(
    'card-dc-03',
    'Como o art. 1º da CF/88 define os fundamentos da República?',
    'Art. 1º — A República Federativa do Brasil é formada pela união indissolúvel dos Estados, Municípios e DF, constituindo Estado Democrático de Direito.\n\nFundamentos (**SODNP**):\n① **S**oberania\n② **O**bjetivos fundamentais ← *Erro comum: objetivos estão no art. 3º*\n③ **D**ignidade da pessoa humana\n④ **N**atureza do trabalho / valores sociais do trabalho e da livre iniciativa\n⑤ **P**luralismo político'
  ),
  makeCard(
    'card-dc-04',
    'Qual a diferença entre controle difuso e controle concentrado de constitucionalidade?',
    '**Difuso (concreto):** qualquer juiz ou tribunal pode declarar a inconstitucionalidade num caso concreto. Efeitos *inter partes* (entre as partes). Origem: EUA.\n\n**Concentrado (abstrato):** competência exclusiva do STF (ADI, ADC, ADPF). Efeitos *erga omnes* (contra todos) e *ex tunc* (retroativos). Origem: Europa (Kelsen).\n\nO Brasil adota o sistema **misto**, combinando os dois.'
  ),
  makeCard(
    'card-dc-05',
    'O que é o princípio da separação dos poderes e como a CF/88 o organiza?',
    'Teoria de Montesquieu (*O Espírito das Leis*, 1748): o poder deve ser dividido para evitar abusos.\n\nNA CF/88 (art. 2º):\n• **Legislativo** — elabora leis\n• **Executivo** — administra e aplica\n• **Judiciário** — resolve conflitos e controla a constitucionalidade\n\nCada Poder tem funções **típicas** (principais) e **atípicas** (excepcionais). O sistema de *checks and balances* garante freios mútuos entre eles.'
  ),
]
