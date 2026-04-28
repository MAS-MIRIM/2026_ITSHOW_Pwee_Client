import { useMemo, useState } from 'react'
import { captureCards, guideMessages, modeContent, rankingData } from './data/gameContent'
import { EntryPage } from './pages/EntryPage'
import { GamePage } from './pages/GamePage'
import { GuidePage } from './pages/GuidePage'
import { ModePage } from './pages/ModePage'
import { NamePage } from './pages/NamePage'
import { RankingPage } from './pages/RankingPage'
import { ResultPage } from './pages/ResultPage'
import { SharePage } from './pages/SharePage'
import { AppShell, GlobalStyle, PageFrame } from './styles/ui'

function App() {
  const [nickname, setNickname] = useState('')
  const [mode, setMode] = useState('')
  const [page, setPage] = useState('home')
  const [guideStep, setGuideStep] = useState(0)

  const currentMode = useMemo(() => modeContent[mode] ?? modeContent.solo, [mode])

  const openNamePage = () => {
    setPage('name')
  }

  const openRankingPage = () => {
    setPage('ranking')
  }

  const submitName = () => {
    if (!nickname.trim()) {
      return
    }
    setPage('mode')
  }

  const selectMode = (nextMode) => {
    setMode(nextMode)
    setGuideStep(0)
    setPage('guide')
  }

  const advanceGuide = () => {
    if (guideStep < guideMessages.length - 1) {
      setGuideStep((prev) => prev + 1)
      return
    }
    setPage('game')
  }

  const finishGame = () => {
    setPage('result')
  }

  const goHome = () => {
    setNickname('')
    setMode('')
    setGuideStep(0)
    setPage('home')
  }

  return (
    <>
      <GlobalStyle />
      <AppShell>
        <PageFrame>
        {page === 'home' && (
          <EntryPage onRanking={openRankingPage} onStart={openNamePage} />
        )}

        {page === 'ranking' && (
          <RankingPage onBack={goHome} rankingData={rankingData} />
        )}

        {page === 'name' && (
          <NamePage nickname={nickname} onNext={submitName} setNickname={setNickname} />
        )}

        {page === 'mode' && (
          <ModePage mode={mode} modeContent={modeContent} onSelect={selectMode} />
        )}

        {page === 'guide' && (
          <GuidePage
            message={guideMessages[guideStep]}
            onNext={advanceGuide}
            step={guideStep}
          />
        )}

        {page === 'game' && <GamePage onFinish={finishGame} />}

        {page === 'result' && (
          <ResultPage
            currentMode={currentMode}
            mode={mode || 'solo'}
            nickname={nickname}
            onHome={goHome}
            onRanking={openRankingPage}
          />
        )}

        {page === 'share' && <SharePage captureCards={captureCards} onRestart={goHome} />}
        </PageFrame>
      </AppShell>
    </>
  )
}

export default App
