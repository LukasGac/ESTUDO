let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx || ctx.state === 'closed') ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// ── Notificação ao fim de cada ciclo Pomodoro ─────────────────────────────────

export function playNotificationChime(): void {
  try {
    const c = getCtx()
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6

    notes.forEach((freq, i) => {
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.connect(gain)
      gain.connect(c.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = c.currentTime + i * 0.18
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.22, t + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5)
      osc.start(t)
      osc.stop(t + 0.5)
    })
  } catch {
    // AudioContext pode ser bloqueado até interação do usuário
  }
}

// ── Sons ambientes ─────────────────────────────────────────────────────────────

interface AmbientHandle {
  stop: () => void
  setVolume: (v: number) => void
}

// Ruído branco filtrado com LFO de amplitude — simula chuva constante
function createRain(c: AudioContext, volume: number): AmbientHandle {
  const bufSize = 4 * c.sampleRate
  const buf = c.createBuffer(1, bufSize, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1

  const source = c.createBufferSource()
  source.buffer = buf
  source.loop = true

  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 400
  filter.Q.value = 0.8

  const masterGain = c.createGain()
  masterGain.gain.value = volume * 0.35

  // LFO lento para variar a intensidade da chuva suavemente
  const lfo = c.createOscillator()
  const lfoGain = c.createGain()
  lfo.frequency.value = 0.08
  lfoGain.gain.value = volume * 0.05
  lfo.connect(lfoGain)
  lfoGain.connect(masterGain.gain)
  lfo.start()

  source.connect(filter)
  filter.connect(masterGain)
  masterGain.connect(c.destination)
  source.start()

  return {
    stop: () => {
      try { source.stop(); source.disconnect() } catch { /* ok */ }
      try { lfo.stop(); lfo.disconnect() } catch { /* ok */ }
    },
    setVolume: (v) => {
      masterGain.gain.setTargetAtTime(v * 0.35, c.currentTime, 0.1)
      lfoGain.gain.setTargetAtTime(v * 0.05, c.currentTime, 0.1)
    },
  }
}

// Ruído rosa (Voss-McCartney) + LFO de vento lento + chirps ocasionais
function createForest(c: AudioContext, volume: number): AmbientHandle {
  const bufSize = 4 * c.sampleRate
  const buf = c.createBuffer(1, bufSize, c.sampleRate)
  const data = buf.getChannelData(0)

  // Algoritmo Voss-McCartney para ruído rosa
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  for (let i = 0; i < bufSize; i++) {
    const w = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + w * 0.0555179
    b1 = 0.99332 * b1 + w * 0.0750759
    b2 = 0.96900 * b2 + w * 0.1538520
    b3 = 0.86650 * b3 + w * 0.3104856
    b4 = 0.55000 * b4 + w * 0.5329522
    b5 = -0.7616 * b5 - w * 0.0168980
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
    b6 = w * 0.115926
  }

  const source = c.createBufferSource()
  source.buffer = buf
  source.loop = true

  // Lowpass para remover frequências altas demais e manter som suave
  const lpFilter = c.createBiquadFilter()
  lpFilter.type = 'lowpass'
  lpFilter.frequency.value = 2000

  const masterGain = c.createGain()
  masterGain.gain.value = volume * 0.25

  // LFO muito lento para simular vento passando entre as árvores
  const windLfo = c.createOscillator()
  const windLfoGain = c.createGain()
  windLfo.frequency.value = 0.03
  windLfoGain.gain.value = volume * 0.04
  windLfo.connect(windLfoGain)
  windLfoGain.connect(masterGain.gain)
  windLfo.start()

  // Chirps de pássaros: osciladores de curta duração agendados aleatoriamente
  let forestStopped = false
  const chirpHandles: { osc: OscillatorNode; gain: GainNode }[] = []
  const chirpTimers: ReturnType<typeof setTimeout>[] = []
  function scheduleChirp() {
    if (forestStopped) return
    const delay = 3000 + Math.random() * 8000 // 3–11s
    const timer = setTimeout(() => {
      if (forestStopped) return
      try {
        const freq = 1800 + Math.random() * 1200 // 1800–3000Hz
        const osc = c.createOscillator()
        const g = c.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        g.gain.setValueAtTime(0, c.currentTime)
        g.gain.linearRampToValueAtTime(volume * 0.04, c.currentTime + 0.02)
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.18)
        osc.connect(g)
        g.connect(c.destination)
        osc.start()
        osc.stop(c.currentTime + 0.2)
        chirpHandles.push({ osc, gain: g })
        scheduleChirp()
      } catch { /* ok */ }
    }, delay)
    chirpTimers.push(timer)
  }
  scheduleChirp()

  source.connect(lpFilter)
  lpFilter.connect(masterGain)
  masterGain.connect(c.destination)
  source.start()

  return {
    stop: () => {
      forestStopped = true
      chirpTimers.forEach(clearTimeout)
      try { source.stop(); source.disconnect() } catch { /* ok */ }
      try { windLfo.stop(); windLfo.disconnect() } catch { /* ok */ }
      chirpHandles.forEach(({ osc }) => { try { osc.stop() } catch { /* ok */ } })
    },
    setVolume: (v) => {
      masterGain.gain.setTargetAtTime(v * 0.25, c.currentTime, 0.1)
      windLfoGain.gain.setTargetAtTime(v * 0.04, c.currentTime, 0.1)
    },
  }
}

// Ruído marrom (integrado) com pulsos suaves irregulares de ambiente de café
function createCafe(c: AudioContext, volume: number): AmbientHandle {
  const bufSize = 8 * c.sampleRate  // 8s de ruído
  const buf = c.createBuffer(1, bufSize, c.sampleRate)
  const data = buf.getChannelData(0)

  // Ruído marrom via integração de ruído branco
  let prev = 0
  for (let i = 0; i < bufSize; i++) {
    const w = Math.random() * 2 - 1
    prev = prev * 0.995 + w * 0.07
    data[i] = prev
  }
  // Normalizar para evitar clipping
  let peak = 0
  for (let i = 0; i < bufSize; i++) peak = Math.max(peak, Math.abs(data[i]))
  if (peak > 0) for (let i = 0; i < bufSize; i++) data[i] /= peak

  const source = c.createBufferSource()
  source.buffer = buf
  source.loop = true

  const lpFilter = c.createBiquadFilter()
  lpFilter.type = 'lowpass'
  lpFilter.frequency.value = 300

  const masterGain = c.createGain()
  masterGain.gain.value = volume * 0.3

  source.connect(lpFilter)
  lpFilter.connect(masterGain)
  masterGain.connect(c.destination)
  source.start()

  // Pulsos irregulares suaves (movimento de xícaras / murmúrio baixo)
  let cafeStopped = false
  const pulseTimers: ReturnType<typeof setTimeout>[] = []
  function schedulePulse() {
    if (cafeStopped) return
    const delay = 800 + Math.random() * 3000 // 0.8–3.8s
    const timer = setTimeout(() => {
      if (cafeStopped) return
      try {
        const noise = c.createBuffer(1, Math.floor(0.12 * c.sampleRate), c.sampleRate)
        const nd = noise.getChannelData(0)
        for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * (1 - i / nd.length)
        const ns = c.createBufferSource()
        ns.buffer = noise
        const ng = c.createGain()
        ng.gain.value = volume * 0.08
        const nlp = c.createBiquadFilter()
        nlp.type = 'lowpass'
        nlp.frequency.value = 400
        ns.connect(nlp)
        nlp.connect(ng)
        ng.connect(c.destination)
        ns.start()
        schedulePulse()
      } catch { /* ok */ }
    }, delay)
    pulseTimers.push(timer)
  }
  schedulePulse()

  return {
    stop: () => {
      cafeStopped = true
      pulseTimers.forEach(clearTimeout)
      try { source.stop(); source.disconnect() } catch { /* ok */ }
    },
    setVolume: (v) => {
      masterGain.gain.setTargetAtTime(v * 0.3, c.currentTime, 0.1)
    },
  }
}

// ── Singleton de som ambiente ─────────────────────────────────────────────────

let activeAmbient: AmbientHandle | null = null

export function startAmbientSound(type: 'rain' | 'forest' | 'cafe', volume = 0.3): void {
  stopAmbientSound()
  try {
    const c = getCtx()
    if (type === 'rain') activeAmbient = createRain(c, volume)
    else if (type === 'forest') activeAmbient = createForest(c, volume)
    else activeAmbient = createCafe(c, volume)
  } catch { /* ok */ }
}

export function stopAmbientSound(): void {
  activeAmbient?.stop()
  activeAmbient = null
}

export function setAmbientVolume(v: number): void {
  activeAmbient?.setVolume(v)
}
