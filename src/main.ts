import '../assets/vchessboard.css'
import '../assets/vchessreplay.css'
import './drops.css'
import './replay.css'
import './index.css'
import './theme.css'
import { render } from 'solid-js/web'

import App from './view'

import { Analysis } from './analysis'
import { Ctrl, make_hooks, make_user } from './api'

export default function VChessAnalysis($element: HTMLElement, options = {}) {

  let ctrl = new Ctrl(options)

  let analysis = new Analysis(make_hooks(ctrl), $element)
  render(App(analysis), $element)


  return make_user(ctrl, analysis)
}
