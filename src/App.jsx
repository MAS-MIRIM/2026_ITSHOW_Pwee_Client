import { useMemo, useState } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { guideMessages, modeContent, rankingData } from './data/gameContent'
import GameLayout from './components/GameLayout'
import SoloGameLayout from './components/SoloGameLayout'
import FourCutPage from './components/FourCutPage'
import FilterPage from './components/FilterPage'
import LeaderboardPage from './components/LeaderboardPage'
import { EntryPage } from './pages/EntryPage'
import { GuidePage } from './pages/GuidePage'
import { ModePage } from './pages/ModePage'
import { NamePage } from './pages/NamePage'
import { SharePage } from './pages/SharePage'
import { GameSessionProvider } from './context/GameSessionProvider'

const GlobalStyle = createGlobalStyle`
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/static/pretendard.min.css');

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
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body {
    margin: 0;
    min-width: 320px;
    width: 100vw;
    height: 100vh;
    background: #fffdf2;
    overflow: hidden;
    overscroll-behavior: none;
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
  height: 100vh;
  margin: 0 auto;
  padding: 0;
  overflow: hidden;
`

const PageFrame = styled.section`
  width: 100%;
  height: 100vh;
  display: grid;
  place-items: center;
  overflow: hidden;
`

function App() {
  const [nickname, setNickname] = useState('')
  const [mode, setMode] = useState('')
  const [page, setPage] = useState('home')
  const [guideStep, setGuideStep] = useState(0)

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

  const goToFourCut = () => {
    setPage('fourcut')
  }

  const goToFilter = () => {
    setPage('filter')
  }

  const goToShare = () => {
    setPage('share')
  }

  const goHome = () => {
    setNickname('')
    setMode('')
    setGuideStep(0)
    setPage('home')
  }

  return (
    <GameSessionProvider>
      <GlobalStyle />
      <AppShell>
        <PageFrame>
          {page === 'home' && (
            <EntryPage onRanking={openRankingPage} onStart={openNamePage} />
          )}

          {page === 'ranking' && (
            <LeaderboardPage rankings={rankingData} onBack={goHome} />
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

          {page === 'game' && mode === 'multi' && (
            <GameLayout onFinish={goToFourCut} nickname={nickname} />
          )}

          {page === 'game' && mode !== 'multi' && (
            <SoloGameLayout onFinish={goToFourCut} nickname={nickname} />
          )}

          {page === 'fourcut' && (
            <FourCutPage
              onNext={goToFilter}
            />
          )}

          {page === 'filter' && <FilterPage onDone={goToShare} />}

          {page === 'share' && (
            <SharePage onRanking={openRankingPage} onRestart={goHome} />
          )}
        </PageFrame>
      </AppShell>
    </GameSessionProvider>
  )
}

export default App
