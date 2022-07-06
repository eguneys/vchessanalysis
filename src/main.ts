import '../assets/vchessboard.css'
import '../assets/vchessreplay.css'
import './replay.css'
import './index.css'
import './theme.css'
import { render } from 'solid-js/web'

import App from './view'

import { Analysis } from './analysis'

export default function VChessAnalysis(element: HTMLElement, options = {}) {

  let analysis = new Analysis()
  render(App(analysis), element)

  return {
  }
}
