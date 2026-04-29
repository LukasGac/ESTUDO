import { Card, Deck } from '@/types'
import { SRS } from '@/constants/srs'

const now = new Date().toISOString()

function makeCard(id: string, deckId: string, front: string, back: string, hint?: string): Card {
  return {
    id,
    deckId,
    front,
    back,
    hint,
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

// ─── Língua Portuguesa ────────────────────────────────────────────────────────

export const DECK_PORTUGUES: Deck = {
  id: 'deck-portugues',
  name: 'Língua Portuguesa',
  description: 'Gramática normativa, crase, regência, concordância e interpretação',
  color: 'violet',
  icon: '📝',
  createdAt: now,
  updatedAt: now,
}

export const CARDS_PORTUGUES: Card[] = [
  makeCard(
    'card-pt-01',
    DECK_PORTUGUES.id,
    'Quando o uso da crase é obrigatório?',
    'A crase é obrigatória diante de palavras femininas que admitem o artigo "a", quando o termo regente exige a preposição "a".\n\nExemplos obrigatórios:\n• "Fui à reunião." (fui a + a reunião)\n• "Referiu-se à candidata." (referiu-se a + a candidata)\n\nNão se usa crase:\n• Antes de palavras masculinas: "a pé", "a lápis"\n• Antes de verbos: "Começou a chover"\n• Antes de pronomes: "a ela", "a você"',
    'Regra da crase: preposição A + artigo A = À'
  ),
  makeCard(
    'card-pt-02',
    DECK_PORTUGUES.id,
    'Qual a diferença de regência entre "assistir a um filme" e "assistir o paciente"?',
    'O verbo ASSISTIR tem dois sentidos com regências diferentes:\n\n① "Assistir a" (= ver, presenciar) → exige preposição A\n"Assisti ao jogo." / "Ela assistiu à peça."\n\n② "Assistir" (= ajudar, cuidar) → verbo transitivo direto\n"O médico assistiu o paciente."\n\nErro comum: "Assistir o filme" no sentido de ver — ERRADO.\nCorrecto: "Assistir ao filme."'
  ),
  makeCard(
    'card-pt-03',
    DECK_PORTUGUES.id,
    'O que é sujeito indeterminado e como identificá-lo?',
    'Sujeito indeterminado é aquele que existe mas não está claramente identificado.\n\nFormas de indeterminar o sujeito:\n① Verbo na 3ª pessoa do plural sem sujeito expresso:\n"Ligaram para você." (quem? — não sabemos)\n\n② Verbo na 3ª pessoa do singular + SE (índice de indeterminação):\n"Precisa-se de funcionários."\n"Vive-se bem aqui."\n\nDiferença com sujeito oculto (elíptico):\nSujeito oculto É identificável pelo contexto ou conjugação.\n"Chegou cedo." (= ele/ela, identificado pelo contexto)',
    'Indeterminado ≠ inexistente. Ele existe, mas não se sabe quem é.'
  ),
  makeCard(
    'card-pt-04',
    DECK_PORTUGUES.id,
    'Quando usar "cujo" e com quais regras?',
    '"Cujo" é pronome relativo que indica posse — equivale a "do qual", "da qual".\n\nRegras obrigatórias:\n① NUNCA acompanha artigo: "cujo o" = ERRADO\n② Concorda em gênero e número com o OBJETO possuído (não com o possuidor)\n③ O possuidor vem antes; o possuído, depois\n\nExemplos:\n"O funcionário cujo desempenho foi reconhecido..." (desempenho = masc.)\n"A empresa cuja sede fica em SP..." (sede = fem.)\n\nErro clássico em prova:\n"A empresa cujo a sede..." → ERRADO (não se usa artigo após cujo)'
  ),
  makeCard(
    'card-pt-05',
    DECK_PORTUGUES.id,
    'Explique próclise, mesóclise e ênclise.',
    'São as três posições do pronome oblíquo átono em relação ao verbo:\n\n① PRÓCLISE (antes do verbo) — obrigatória com:\n• Palavras atrativas: não, nunca, jamais, também, só, até\n• Conjunções subordinativas: "Quando ela me chamou..."\n• Pronomes relativos, indefinidos e interrogativos\n"Não me diga isso." ✓\n\n② MESÓCLISE (no meio do verbo) — com futuro do presente e futuro do pretérito quando não há palavra atrativa:\n"Dir-lhe-ei a verdade." / "Far-me-ia um favor."\n\n③ ÊNCLISE (após o verbo) — posição padrão quando não há próclise obrigatória:\n"Diga-me a verdade." / "Ajude-nos logo."',
    'Em início absoluto de frase: nunca próclise ("Me diga" = informal; "Diga-me" = formal correto)'
  ),
  makeCard(
    'card-pt-06',
    DECK_PORTUGUES.id,
    'Concordância verbal com sujeito composto: quando o verbo vai para o plural?',
    'Sujeito composto antes do verbo → verbo no PLURAL (regra geral):\n"João e Maria chegaram."\n\nExceções importantes:\n① Núcleos sinônimos ou em gradação → pode ficar no singular:\n"A tristeza, a angústia, o desespero tomou/tomaram conta dela."\n\n② Sujeito composto posposto ao verbo → pode concordar com o mais próximo:\n"Chegou o gerente e os diretores." (ou "Chegaram...")\n\n③ Com "ou" exclusivo → singular:\n"Ele ou ela será responsável."\n\n④ Com "nem" → plural:\n"Nem ele nem ela chegaram a tempo."'
  ),
]

// ─── Raciocínio Lógico ────────────────────────────────────────────────────────

export const DECK_LOGICA: Deck = {
  id: 'deck-logica',
  name: 'Raciocínio Lógico',
  description: 'Proposições, conectivos, tabela-verdade, silogismos e argumentação',
  color: 'amber',
  icon: '🧩',
  createdAt: now,
  updatedAt: now,
}

export const CARDS_LOGICA: Card[] = [
  makeCard(
    'card-lg-01',
    DECK_LOGICA.id,
    'Como negar uma proposição com o conectivo "E" (conjunção)?',
    'Pela Lei de De Morgan:\n\n¬(P ∧ Q) ≡ ¬P ∨ ¬Q\n\n"A negação do E é o OU das negações."\n\nExemplo:\nOriginal: "João estudou E passou na prova."\nNegação: "João NÃO estudou OU não passou na prova."\n\nRegra prática:\n• Troca o E pelo OU\n• Nega cada proposição simples individualmente\n\nTabela-verdade: P ∧ Q é verdadeira APENAS quando P e Q são ambas verdadeiras.',
    'De Morgan: nega e troca o conectivo (E↔OU)'
  ),
  makeCard(
    'card-lg-02',
    DECK_LOGICA.id,
    'Como negar uma proposição com o conectivo "OU" (disjunção)?',
    'Pela Lei de De Morgan:\n\n¬(P ∨ Q) ≡ ¬P ∧ ¬Q\n\n"A negação do OU é o E das negações."\n\nExemplo:\nOriginal: "Ele é médico OU engenheiro."\nNegação: "Ele NÃO é médico E não é engenheiro."\n\nDiferença entre disjunção inclusiva e exclusiva:\n• Inclusiva (∨): verdadeira quando ao menos uma é V\n• Exclusiva (⊕): verdadeira apenas quando exatamente uma é V\n\nNas provas de concurso, sem indicação, assuma inclusiva.',
    'De Morgan: nega e troca o conectivo (OU↔E)'
  ),
  makeCard(
    'card-lg-03',
    DECK_LOGICA.id,
    'O que é a Contrapositiva de uma condicional e para que serve?',
    'Toda condicional P → Q é logicamente equivalente à sua contrapositiva:\n\nP → Q ≡ ¬Q → ¬P\n\n"Se P então Q" ≡ "Se não-Q então não-P"\n\nExemplo:\nOriginal: "Se é mamífero, então é animal."\nContrapositiva: "Se não é animal, então não é mamífero." ✓\n\nUSO EM PROVA: Se uma questão afirma P → Q e diz que Q é falso, você pode concluir que P é falso (Modus Tollens).\n\nContraexemplo clássico de equivalência FALSA:\nA recíproca (Q → P) NÃO é equivalente à original.',
    'Contrapositiva é equivalente. Recíproca e inversa NÃO são.'
  ),
  makeCard(
    'card-lg-04',
    DECK_LOGICA.id,
    'O que são Modus Ponens e Modus Tollens?',
    'São as duas formas básicas de raciocínio dedutivo válido:\n\n① MODUS PONENS (afirmando afirma):\nPremissa 1: P → Q\nPremissa 2: P (verdadeiro)\nConclusão: Q (verdadeiro)\n\nEx: "Se chove, a rua molha. Choveu. Logo, a rua molhou."\n\n② MODUS TOLLENS (negando nega):\nPremissa 1: P → Q\nPremissa 2: ¬Q (Q é falso)\nConclusão: ¬P (P é falso)\n\nEx: "Se chove, a rua molha. A rua não molhou. Logo, não choveu."\n\nErro comum — raciocínio INVÁLIDO:\n"P→Q, Q verdadeiro ∴ P verdadeiro" = Falácia da afirmação do consequente.'
  ),
  makeCard(
    'card-lg-05',
    DECK_LOGICA.id,
    'Como negar proposições com quantificadores "todo" e "algum"?',
    'Quantificadores universais e existenciais têm negações específicas:\n\n① "Todo A é B" → nega → "Algum A não é B"\n(∀x: P(x)) → nega → (∃x: ¬P(x))\n\n② "Nenhum A é B" → nega → "Algum A é B"\n(∀x: ¬P(x)) → nega → (∃x: P(x))\n\n③ "Algum A é B" → nega → "Nenhum A é B"\n(∃x: P(x)) → nega → (∀x: ¬P(x))\n\nMacete:\nTODO ↔ ALGUM (troca e nega o predicado)\nNENHUM ↔ ALGUM (troca sem negar)\n\nEx: "Todos os técnicos são aprovados"\nNegação: "Algum técnico não é aprovado"',
    'Todo ↔ Algum...não | Nenhum ↔ Algum'
  ),
  makeCard(
    'card-lg-06',
    DECK_LOGICA.id,
    'O que é um silogismo e como verificar sua validade?',
    'Silogismo é um argumento dedutivo com duas premissas e uma conclusão.\n\nEstrutura clássica:\nPremissa maior: Todo M é P\nPremissa menor: Todo S é M\nConclusão: Todo S é P\n\nEx:\n"Todo servidor é concursado. (P1)\nTodo técnico da Petrobras é servidor. (P2)\nLogo, todo técnico da Petrobras é concursado." ✓\n\nComo verificar validade:\n① O termo médio (M) deve ser distribuído ao menos uma vez\n② Termos não distribuídos nas premissas não podem ser distribuídos na conclusão\n③ De duas premissas negativas, nada se conclui\n④ A conclusão segue a premissa mais fraca (negativa ou particular)\n\nEm provas: use diagramas de Euler-Venn para visualizar.'
  ),
]

// ─── Matemática ───────────────────────────────────────────────────────────────

export const DECK_MATEMATICA: Deck = {
  id: 'deck-matematica',
  name: 'Matemática',
  description: 'PA, PG, análise combinatória, probabilidade e funções',
  color: 'cyan',
  icon: '📐',
  createdAt: now,
  updatedAt: now,
}

export const CARDS_MATEMATICA: Card[] = [
  makeCard(
    'card-mt-01',
    DECK_MATEMATICA.id,
    'Qual a fórmula do termo geral de uma Progressão Aritmética (PA)?',
    'O termo geral de uma PA é:\n\nan = a1 + (n – 1) · r\n\nOnde:\n• an = termo de posição n (o que você quer encontrar)\n• a1 = primeiro termo\n• r = razão (diferença constante entre termos consecutivos)\n• n = posição do termo\n\nExemplo:\nPA: 3, 7, 11, 15, ... (r = 4, a1 = 3)\n\na10 = 3 + (10 – 1) · 4 = 3 + 36 = 39\n\nComo encontrar r: r = a2 – a1 = a3 – a2 (qualquer par consecutivo)',
    'an = a1 + (n–1)·r'
  ),
  makeCard(
    'card-mt-02',
    DECK_MATEMATICA.id,
    'Qual a fórmula da soma dos termos de uma PA finita?',
    'A soma dos n primeiros termos de uma PA é:\n\nSn = n · (a1 + an) / 2\n\nOu equivalentemente:\nSn = n · (2·a1 + (n–1)·r) / 2\n\nInterpretação: a soma é n vezes a média do primeiro com o último termo.\n\nExemplo:\nSoma dos 10 primeiros termos de 1, 3, 5, 7, ...\na1 = 1, a10 = 1 + 9·2 = 19\nS10 = 10 · (1 + 19) / 2 = 10 · 10 = 100\n\nAplicação clássica: soma dos n primeiros números naturais\n1 + 2 + ... + n = n·(n+1)/2',
    'Sn = n·(a1+an)/2 — média dos extremos vezes quantidade'
  ),
  makeCard(
    'card-mt-03',
    DECK_MATEMATICA.id,
    'Qual a fórmula do termo geral de uma Progressão Geométrica (PG)?',
    'O termo geral de uma PG é:\n\nan = a1 · q^(n–1)\n\nOnde:\n• an = termo de posição n\n• a1 = primeiro termo\n• q = razão (quociente constante entre termos consecutivos)\n• n = posição do termo\n\nExemplo:\nPG: 2, 6, 18, 54, ... (q = 3, a1 = 2)\n\na5 = 2 · 3^(5–1) = 2 · 81 = 162\n\nComo encontrar q: q = a2/a1 = a3/a2\n\nCuidado: na PA, r pode ser negativo (PA decrescente). Na PG, q pode ser negativo (PG alternante em sinal).',
    'an = a1 · q^(n–1) — a razão é multiplicativa, não aditiva'
  ),
  makeCard(
    'card-mt-04',
    DECK_MATEMATICA.id,
    'O que é o Princípio Fundamental da Contagem (PFC) e como aplicar?',
    'Se um evento A pode ocorrer de m maneiras e, para cada uma delas, um evento B pode ocorrer de n maneiras, então A e B juntos podem ocorrer de m × n maneiras.\n\nRegra: multiplica as escolhas independentes.\n\nExemplo clássico:\nUm código tem 3 letras (A-Z) e 2 dígitos (0-9). Quantas combinações?\n26 × 26 × 26 × 10 × 10 = 17.576.000\n\nQuando usar?\n• Escolhas em sequência onde a ordem importa\n• Cada estágio é independente dos outros\n\nDiferença com Combinação:\nPFC → ordem importa\nCombinação → ordem NÃO importa',
    'Multiplique as escolhas de cada etapa independente'
  ),
  makeCard(
    'card-mt-05',
    DECK_MATEMATICA.id,
    'Qual a fórmula da Combinação Simples C(n,k)?',
    'A combinação indica quantas maneiras de escolher k elementos de n, sem importar a ordem:\n\nC(n,k) = n! / (k! · (n–k)!)\n\nTambém escrito como C_n^k ou "n escolhe k".\n\nExemplo:\nQuantas comissões de 3 pessoas de um grupo de 8?\nC(8,3) = 8! / (3! · 5!) = (8·7·6) / (3·2·1) = 56\n\nPropriedades importantes:\n• C(n,0) = C(n,n) = 1\n• C(n,1) = n\n• C(n,k) = C(n, n–k) ← simetria\n• C(n,k) + C(n,k+1) = C(n+1,k+1) ← Pascal\n\nUsando calculadora: calcule numerador e denominador separadamente.',
    'C(n,k) = n! / (k!·(n-k)!) — ordem não importa'
  ),
  makeCard(
    'card-mt-06',
    DECK_MATEMATICA.id,
    'Como calcular a probabilidade clássica de um evento?',
    'Probabilidade clássica (Laplace):\n\nP(A) = número de casos favoráveis / número de casos possíveis\n\nCondições: todos os casos igualmente prováveis (dados honestos, moedas equilibradas).\n\nExemplo:\nJogar um dado: P(par) = 3/6 = 1/2\n(Casos favoráveis: 2, 4, 6 → 3 casos)\n(Casos possíveis: 1 a 6 → 6 casos)\n\nPropriedades:\n• 0 ≤ P(A) ≤ 1\n• P(evento impossível) = 0\n• P(evento certo) = 1\n• P(A complementar) = 1 – P(A)\n\nProbabilidade de A OU B (mutuamente exclusivos):\nP(A ∪ B) = P(A) + P(B)\n\nProbabilidade de A E B (independentes):\nP(A ∩ B) = P(A) · P(B)',
    'P(A) = favoráveis / possíveis — todos igualmente prováveis'
  ),
]

// ─── Inglês Técnico ───────────────────────────────────────────────────────────

export const DECK_INGLES: Deck = {
  id: 'deck-ingles',
  name: 'Inglês Técnico',
  description: 'False friends, voz passiva, vocabulário oil & gas e interpretação de texto',
  color: 'emerald',
  icon: '🌐',
  createdAt: now,
  updatedAt: now,
}

export const CARDS_INGLES: Card[] = [
  makeCard(
    'card-en-01',
    DECK_INGLES.id,
    'Quais são os false friends mais cobrados em provas? Dê exemplos e traduções corretas.',
    'False friends são palavras que se parecem com português mas têm significado diferente:\n\n• "actually" = na verdade, de fato (≠ atualmente)\n• "eventually" = finalmente, por fim (≠ eventualmente)\n• "sensible" = sensato, razoável (≠ sensível)\n• "sensitive" = sensível (≠ sensitivo)\n• "pretend" = fingir (≠ pretender)\n• "intend" = pretender, ter intenção de\n• "college" = faculdade (≠ colégio)\n• "notice" = perceber, notar (≠ notícia)\n• "novel" = romance (livro) (≠ novela)\n• "assist" = ajudar, auxiliar (≠ assistir a)\n• "data" = dados (singular em inglês = datum)\n• "fabric" = tecido (≠ fábrica)',
    'Dica: se a palavra parece óbvia demais, desconfie!'
  ),
  makeCard(
    'card-en-02',
    DECK_INGLES.id,
    'Como é estruturada a voz passiva em inglês e quando usá-la?',
    'Estrutura da voz passiva:\n\nSujeito + verbo "to be" (conjugado) + particípio passado\n\nExemplos por tempo verbal:\n• Presente simples: "The report is written daily."\n• Passado simples: "The valve was replaced yesterday."\n• Futuro: "The pipeline will be inspected next week."\n• Presente perfeito: "The analysis has been completed."\n\nPara indicar o agente: usa-se "by"\n"The system was designed by the engineering team."\n\nUso em textos técnicos:\nA voz passiva é muito comum em manuais, relatórios e artigos científicos porque coloca o foco no processo, não no executor.\n"The sample must be stored at 4°C."\n"Results were analyzed using statistical software."',
    'be + particípio passado | agente: by + quem fez'
  ),
  makeCard(
    'card-en-03',
    DECK_INGLES.id,
    'Qual o significado dos verbos modais must, should e may em contexto técnico?',
    'Em manuais e normas técnicas, os modais têm significados precisos:\n\n• MUST / SHALL = obrigação absoluta, requisito mandatório\n"The operator must wear PPE at all times."\n"All valves shall be tested before commissioning."\n\n• SHOULD = recomendação, boa prática (não obrigatório)\n"Personnel should be trained before operating the equipment."\n\n• MAY = permissão ou possibilidade\n"Operators may use alternative methods if approved."\n\n• MUST NOT = proibição absoluta\n"Workers must not enter the area without authorization."\n\n• NEED NOT = ausência de obrigação (não é proibido)\n"You need not fill all fields on the form."\n\nNorma ISO 9001 e documentos técnicos seguem exatamente essa hierarquia.',
    'Must = obrigatório | Should = recomendado | May = permitido/possível'
  ),
  makeCard(
    'card-en-04',
    DECK_INGLES.id,
    'Quais são os prefixos negativos mais usados em inglês técnico?',
    'Prefixos negativos mais cobrados:\n\n• UN- (mais comum): unsafe, unplanned, unexpected, unreliable\n• IN-/IM-/IL-/IR-: inefficient, impossible, illegal, irregular\n• DIS-: disconnect, disassemble, discharge, disqualify\n• NON-: non-compliance, non-destructive, non-renewable\n• MIS-: misalignment, malfunction (≠ mis-), mismatch\n• OVER-: overpressure, overload, overheating\n• UNDER-: underpressure, underperformance\n\nDica de leitura:\nQuando encontrar uma palavra desconhecida, tente remover o prefixo negativo:\n"Non-compliance" → sem o non- = compliance (conformidade)\nEntão: non-compliance = não-conformidade ✓',
    'Un-, in-, dis-, non-, mis- são os mais frequentes em provas'
  ),
  makeCard(
    'card-en-05',
    DECK_INGLES.id,
    'Vocabulário essencial de Oil & Gas em inglês. Quais os termos mais cobrados?',
    'Cadeia produtiva (Supply Chain):\n• Upstream = exploração e produção (E&P)\n• Midstream = transporte e armazenamento\n• Downstream = refino e distribuição\n\nEquipamentos e processos:\n• Wellhead = cabeça de poço\n• Pipeline = duto, tubulação\n• Refinery = refinaria\n• Rig = sonda de perfuração\n• Offshore = em alto mar / Onshore = em terra\n• LNG = Liquefied Natural Gas (GNL)\n• FPSO = Floating Production Storage and Offloading\n\nSegurança:\n• Blowout = explosão/erupção de poço\n• Shutdown = parada de operação\n• Flaring = queima de gás\n• PPE = Personal Protective Equipment (EPI)\n• HAZOP = Hazard and Operability Study',
    'Upstream = produção | Downstream = refino | Midstream = transporte'
  ),
]

// ─── Segurança do Trabalho ────────────────────────────────────────────────────

export const DECK_SEGURANCA: Deck = {
  id: 'deck-seguranca',
  name: 'Segurança do Trabalho',
  description: 'NR-5, NR-6, NR-10, NR-35 — CIPA, EPIs, risco elétrico e trabalho em altura',
  color: 'rose',
  icon: '🦺',
  createdAt: now,
  updatedAt: now,
}

export const CARDS_SEGURANCA: Card[] = [
  makeCard(
    'card-seg-01',
    DECK_SEGURANCA.id,
    'O que é a CIPA (NR-5) e qual sua composição?',
    'CIPA — Comissão Interna de Prevenção de Acidentes (NR-5)\n\nObjetivo: prevenir acidentes e doenças decorrentes do trabalho.\n\nComposição:\n• Representantes do EMPREGADOR — indicados pela empresa\n• Representantes dos EMPREGADOS — eleitos em escrutínio secreto\n• A presidência é do empregador; a vice-presidência, dos empregados\n\nMandato: 1 ano, permitida uma reestabilidade.\n\nEstabilidade: os representantes eleitos têm estabilidade provisória desde o registro da candidatura até 1 ano após o mandato.\n\nObrigação de constituir CIPA:\nEmpresas com CNPJ próprio e número mínimo de empregados conforme o Quadro I da NR-5 (varia por atividade econômica).\n\nEmpresas abaixo do número mínimo → designam um responsável pelo SESMT ou indicam um Designado de Prevenção.',
    'Empregador indica; empregados elegem; empregador preside'
  ),
  makeCard(
    'card-seg-02',
    DECK_SEGURANCA.id,
    'O que define a NR-6 sobre EPI e quais são as obrigações do empregador?',
    'NR-6 — Equipamento de Proteção Individual (EPI)\n\nDefinição:\nEPI é todo dispositivo ou produto de uso individual destinado à proteção de riscos suscetíveis de ameaçar a segurança e a saúde do trabalhador.\n\nObrigações do EMPREGADOR:\n① Fornecer gratuitamente o EPI adequado ao risco\n② Exigir seu uso\n③ Fornecer treinamento sobre o uso correto\n④ Substituir o EPI danificado ou extraviado\n⑤ Responsabilizar-se pela higienização e manutenção\n⑥ Comunicar ao MTE qualquer irregularidade\n\nCA — Certificado de Aprovação:\nTodo EPI vendido no Brasil deve ter CA emitido pelo MTE, com validade definida. Sem CA válido, o EPI não é reconhecido legalmente.\n\nObrigação do TRABALHADOR:\nUsar, guardar, conservar e comunicar qualquer alteração que o torne impróprio.',
    'EPI é gratuito, tem CA obrigatório, empregador fornece e exige uso'
  ),
  makeCard(
    'card-seg-03',
    DECK_SEGURANCA.id,
    'O que estabelece a NR-10 sobre trabalho em instalações elétricas?',
    'NR-10 — Segurança em Instalações e Serviços em Eletricidade\n\nZonas de risco definidas:\n• Zona controlada: área ao redor de partes vivas onde é necessário capacitação específica\n• Zona de risco: dentro da zona controlada, ainda mais próxima das partes vivas\n• Zona livre: fora das duas anteriores\n\nHabilitação para trabalho elétrico:\n① Trabalhador qualificado: treinado conforme NR-10\n② Trabalhador habilitado: qualificado + responsabilidade técnica (engenheiro elétrico ou técnico)\n\nCondições de segurança:\n• Trabalho sem tensão (desenergizado): preferencial\n• Trabalho com tensão: exige autorização e EPIs específicos\n• LOTO (Lockout/Tagout): bloqueio e etiquetagem de energia\n\nProntuário de Instalações Elétricas: documento obrigatório com diagrama unifilar, especificação de equipamentos, PPRAE.',
    'Zonas: livre → controlada → risco. Sempre preferir trabalho desenergizado.'
  ),
  makeCard(
    'card-seg-04',
    DECK_SEGURANCA.id,
    'O que define a NR-35 sobre trabalho em altura?',
    'NR-35 — Trabalho em Altura\n\nDefinição de trabalho em altura:\nAtividade executada ACIMA DE 2,00 METROS do nível inferior, onde haja risco de queda.\n\nObrigações:\n① Todo trabalhador em altura deve ser treinado (mínimo 8h teóricas + práticas)\n② Certificado válido por 2 anos\n③ Análise de Risco (AR) deve ser feita antes de cada atividade\n④ Permissão de Trabalho (PT) em atividades não-rotineiras\n\nEquipamentos obrigatórios:\n• Cinto de segurança tipo paraquedista\n• Talabarte com absorvedor de energia (queda livre ≤ 0,6m)\n• Trava-queda\n• Capacete com jugular\n\nHierarquia de proteção:\n1° Eliminação do risco → 2° Proteção coletiva (andaimes, guarda-corpos) → 3° EPI (último recurso)',
    'Altura ≥ 2 metros = trabalho em altura. Cinto paraquedista obrigatório.'
  ),
  makeCard(
    'card-seg-05',
    DECK_SEGURANCA.id,
    'O que é a hierarquia de controles de risco e qual sua ordem de prioridade?',
    'A hierarquia de controles define a ordem de prioridade para eliminar ou reduzir riscos:\n\n1° ELIMINAÇÃO — remover o perigo completamente\nEx: substituir processo perigoso por um seguro\n\n2° SUBSTITUIÇÃO — trocar o agente perigoso por um menos nocivo\nEx: substituir solvente tóxico por água\n\n3° CONTROLE DE ENGENHARIA (EPC) — barreiras físicas\nEx: enclausuramento, ventilação forçada, guarda-corpos\n\n4° CONTROLE ADMINISTRATIVO — procedimentos e treinamento\nEx: rotação de turnos, sinalização, treinamentos\n\n5° EPI — Equipamento de Proteção Individual (ÚLTIMO recurso)\nEx: máscara, luva, capacete\n\nMacete de memorização:\nE-S-EPC-ADM-EPI\n"Engenharia Substitui o Risco, Administrativo avisa, EPI protege o que sobrou"',
    'Eliminação > Substituição > EPC > Administrativo > EPI'
  ),
  makeCard(
    'card-seg-06',
    DECK_SEGURANCA.id,
    'Qual a diferença entre acidente do trabalho e doença ocupacional? (Lei 8.213/91)',
    'Lei 8.213/91 — Plano de Benefícios da Previdência Social\n\nACIDENTE DO TRABALHO:\nOcorre pelo exercício do trabalho a serviço da empresa, provocando lesão corporal ou perturbação funcional que cause:\n• Morte\n• Perda ou redução da capacidade para o trabalho\n\nEquiparados a acidente do trabalho:\n① Acidente de trajeto (in itinere)\n② Doença profissional ou doença do trabalho\n③ Acidente fora do local durante horário de trabalho (serviço externo)\n\nDOENÇA PROFISSIONAL (Tecnopatia):\nResulta do exercício típico de determinada profissão.\nEx: silicose em mineiros, PAIR em trabalhos com ruído.\n\nDOENÇA DO TRABALHO (Mesopatia):\nAdquirida em função das condições especiais do trabalho.\nEx: LER/DORT em digitadores.\n\nNÃO são acidente do trabalho: doenças degenerativas, inerentes a grupo etário, endêmicas (exceto por exposição ou vetores relacionados ao trabalho).',
    'Acidente = fato súbito. Doença profissional = típica da função. Doença do trabalho = condições especiais.'
  ),
]

// ─── Exportações agrupadas ────────────────────────────────────────────────────

export const PETROBRAS_DECKS: Deck[] = [
  DECK_PORTUGUES,
  DECK_LOGICA,
  DECK_MATEMATICA,
  DECK_INGLES,
  DECK_SEGURANCA,
]

export const PETROBRAS_CARDS: Card[] = [
  ...CARDS_PORTUGUES,
  ...CARDS_LOGICA,
  ...CARDS_MATEMATICA,
  ...CARDS_INGLES,
  ...CARDS_SEGURANCA,
]
