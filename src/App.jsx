import { useMemo, useState } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { captureCards, guideMessages, modeContent, rankingData } from './data/gameContent'
import { EntryPage } from './pages/EntryPage'
import { GamePage } from './pages/GamePage'
import { GuidePage } from './pages/GuidePage'
import { ModePage } from './pages/ModePage'
import { NamePage } from './pages/NamePage'
import { RankingPage } from './pages/RankingPage'
import { ResultPage } from './pages/ResultPage'
import { SharePage } from './pages/SharePage'

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Gruppo&family=Suez+One&display=swap');

  :root {
    font-family:
      'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', 'Segoe UI', sans-serif;
    line-height: 1.5;
    font-weight: 400;
    color: #856b6b;
    background: #fffdf2;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    min-height: 100%;
  }

  body {
    margin: 0;
    min-width: 320px;
    min-height: 100vh;
    background: #fffdf2;
  }

  button,
  input {
    font: inherit;
  }

  button {
    appearance: none;
  }

  h1,
  h2,
  h3,
  p {
    margin: 0;
  }
`

const AppShell = styled.main`
  width: min(100%, 960px);
  margin: 0 auto;
  padding: 0;
`

const PageFrame = styled.section`
  min-height: calc(100vh - 64px);
  display: grid;
  place-items: center;
`

function App() {
  const [nickname, setNickname] = useState('')
  const [mode, setMode] = useState('')
  const [page, setPage] = useState('home')
  const [guideStep, setGuideStep] = useState(0)

  const currentMode = useMemo(() => modeContent[mode] ?? modeContent.solo, [mode])
  const currentGuideMessages = useMemo(
    () => guideMessages[mode] ?? guideMessages.solo,
    [mode],
  )

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
    if (guideStep < currentGuideMessages.length - 1) {
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
            message={currentGuideMessages[guideStep]}
            step={guideStep}
            onNext={advanceGuide}
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
