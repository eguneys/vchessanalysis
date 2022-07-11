import { createEffect, createSignal, createMemo } from 'solid-js'
import { Board, MobileSituation } from 'lchessanalysis'
import { read, write, owrite } from './play'

let preset_fens = {
  'startpos': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  'empty': '8/8/8/8/8/8/8/8 w - - 0 1'
}


export class Ctrl {

  get pieses() {
    return this.editor.pieses
  }

  get orientation() {
    return this.editor.orientation
  }

  get situation() {
    return this.editor.situation
  }

  in(piese: Piese) {
    this.editor.in(piese)
  }


  out(pos: Pos) {
    this.editor.out(pos)
  }

  od(od: OD) {
    this.editor.od(od)
  }

  constructor() {

    this.editor = make_editor(this)
    this.analysis = make_analysis(this)
  }
}

const make_analysis = (ctrl: Ctrl) => {

  let _mode = createSignal('fen')
  let m_mode = createMemo(() => read(_mode))

  return {
    set mode(mode: Mode) {
      owrite(_mode, mode)
    },
    get mode() {
      return m_mode()
    }
  }
}

const make_editor = (ctrl: Ctrl) => {

  let _situation = createSignal(MobileSituation.from_fen(preset_fens['empty']))
  let _orientation = createSignal('w')
  let _preset = createSignal('empty')


  let m_situation = createMemo(() => read(_situation))
  let m_board = createMemo(() => m_situation().board)
  let m_orientation = createMemo(() => read(_orientation))
  let m_preset = createMemo(() => read(_preset))
  let m_pieses = createMemo(() => m_board().pieses)


  createEffect(() => {
    let preset_fen = preset_fens[m_preset()]
    if (preset_fen) {
      owrite(_situation, _ => _.with_board(_ => Board.from_fen(preset_fen.split(' ')[0])))
    }
  })

  return {
    od(od: OD) {
      owrite(_situation, _ => _.od(od)[0])
    },
    in(piese: Piese) {
      owrite(_situation, _ => _.with_board(_ => {
        _.in(piese) 
        return _
      }))
    },
    out(pos: Pos) {
      owrite(_situation, _ => _.with_board(_ => {
        _.out(pos) 
        return _
      }))
    },
    get situation() {
      return m_situation()
    },
    get pieses() {
      return m_pieses()
    },
    get preset() {
      return m_preset()
    },
    get orientation() {
      return m_orientation()
    },
    set orientation(o: Color) {
      owrite(_orientation, o)
    },
    set preset(p: string) {
      owrite(_preset, p)
    }
  }
}


export function make_hooks(ctrl: Ctrl) {
  return {
    can_user_od(od: OD) {
      return ctrl.situation.ods.includes(od)
    },
    on_user_od(od: string) {
      ctrl.od(od)
    },
    on_user_ods(piese: string) {

      let [piece, o] = piese.split('@')
      return ctrl.situation.o_ds(o)
    },
    on_user_in(piese: string) {
      ctrl.in(piese)

    },
    on_user_out(_piese: string) {
      let _ = _piese.split('@')
      let pos = _[_.length - 1]

      ctrl.out(pos)
    },
    on_orientation(orientation: string) {
      ctrl.editor.orientation = orientation
    },
    on_preset(preset: string) {
      ctrl.editor.preset = preset
    },
    on_mode(mode: string) {
      ctrl.analysis.mode = mode
    }
  }
}


export function make_user(ctrl:  Ctrl, analysis: Analysis) {
  createEffect(() => {
    analysis.pieses = ctrl.pieses
  })

  createEffect(() => {
    analysis.orientation = ctrl.orientation
  })


  createEffect(() => {
    analysis.drops.mode = ctrl.analysis.mode
  })
}
