import { untrack, on, createEffect, createSignal, createMemo, mapArray } from 'solid-js'
import { read, write, owrite } from './play'
import { make_drag, make_ref } from './make_sticky'
import { make_position } from './make_util'
import { Vec2 } from 'soli2d'


const long_colors = ['white', 'black']
const long_roles = ['pawn', 'rook', 'queen', 'bishop', 'knight', 'king']
const short_roles = { 'pawn': 'p', 'rook': 'r', 'queen': 'q', 'bishop': 'b', 'knight': 'n', 'king': 'k' }
const to_long_roles = { 'p': 'pawn', 'r': 'rook', 'q': 'queen', 'b': 'bishop', 'n': 'knight', 'k': 'king'}
const to_long_colors = { 'w': 'white', 'b': 'black' }

const colors = ['w', 'b']
const roles = ['p', 'r', 'b', 'n', 'q', 'k']
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const ranks = ['1', '2', '3', '4', '5', '6', '7', '8']

const pieces = colors.flatMap(color => roles.map(role => color + role))

const piece_klass = (piece: Piece) => {
  let [color, role] = piece.split('')
  return [to_long_colors[color], to_long_roles[role]].join(' ')
}

const piese_at = (piese: Piese, at: Pos) => {
  return !!piese.split('@')[1].match(at)
}

const vs_chess_pos = (vs: Vec2) => {
  return files[vs.x] + ranks[vs.y]
}

const vs_key_piece_data = (vs: Vec2, piece: string) => {
  let at = vs_chess_pos(vs)
  let [wr] = piece.split('@')

  return [wr, at].join('@')
}


function make_hooks(analysis: Analysis) {
  return { 
    on_hover() {
    },
    on_up(decay) {
    },
    on_click(click: Vec2) {
      let key = analysis.board.get_key_at_abs_pos(Vec2.make(...click))
      if (key) {
        key = vs_chess_pos(key)

        analysis.hooks.on_user_out(key)
      }
    },
    find_inject_drag() {
    },
    on_drag_update(decay) {
      let key = analysis.board.get_key_at_abs_pos(decay.target.vs)
      if (key) {
        analysis.board.highlight = key
      }
    },
    find_on_drag_start(drag) {
      let vs = Vec2.make(...drag.move)
      let _piece = analysis.drops.find_on_drag_start(vs) || 
        analysis.board.find_on_drag_start(vs)
      if (_piece) {
        analysis.drag_piece.begin(_piece, vs)
        return analysis.drag_piece
      }
    }
  }
}

export class Analysis {

  onScroll() {
    this.refs.forEach(_ => _.$clear_bounds())
  }

  get cur_drag_piece() {
    return this.drag_piece.cur
  }

  set pieses(pieses: Pieses) {
    this.board.pieses = pieses
  }

  set orientation(orientation: Color) {
    this.board.orientation = orientation
  }

  constructor(readonly hooks: UserHooks, readonly $element: HTMLElement) {
  
    this.refs = []
    this.drag = make_drag(make_hooks(this), $element)
    this.refs.push(this.drag)
    this.fens = make_fens(this)
    this.drops = make_drops(this)
    this.board = make_board(this)
    this.drag_piece = make_drag_piece(this)

    createEffect(on(() => this.drag.decay, (decay, prev) => {
      if (!decay) {
        if (prev) {
          let key = this.board.get_key_at_abs_pos(prev.target.vs)
          this.board.highlight = undefined
            this.drag_piece.drop()
          if (key) {
            let { piece } = prev.target
            let immediate_drop = vs_key_piece_data(key, piece)
            this.board.immediate_drop= immediate_drop
            hooks.on_user_in(immediate_drop)
          }
        }
        this.drops.pieces.forEach(_ => _.mouse_down = false)
      }
    }))


  }

}



const make_board = (analysis: Analysis) => {

  let ref = make_ref()

  let _hi = createSignal()


  let _orientation = createSignal('w')
  let _pieses = createSignal([])

  analysis.refs.push(ref)
  return {
    find_on_drag_start(vs: Vec2) {
      let key = this.get_key_at_abs_pos(vs)
      if (key) {
        let pos = vs_chess_pos(key)
        if (pos) {
          return read(_pieses).find(_ => piese_at(_, pos))
        }
      }
    },
    get orientation() {
      return read(_orientation)
    },
    set orientation(color: Color) {
      owrite(_orientation, color)
    },
    get pieses() {
      return read(_pieses)
    },
    set pieses(pieses: Array<Piese>) {
      let i_immediate_piese = pieses.findIndex(_ => _ === this.immediate_drop)
      if (i_immediate_piese > -1) {
        pieses[i_immediate_piese] = this.immediate_drop + '~'
        this.immediate_drop = undefined
      }
      owrite(_pieses, pieses)
    },
    ref,
    get_key_at_abs_pos(vs: Vec2) {
      let res = ref.get_normal_at_abs_pos(vs)
      if (res.x < 1 && res.x > 0 && res.y < 1 && res.y > 0) {
        let _res = Vec2.make(Math.floor(res.x * 8), Math.floor(res.y * 8))

        if (analysis.board.orientation === 'w') {
          _res.y = 7 - _res.y
        }

        return _res
      }
    },
    set highlight(vs: Vec2 | undefined) {
      if (vs) {
        owrite(_hi, vs_chess_pos(vs))
      } else {
        owrite(_hi, undefined)
      }
    },
    get highlight() {
      return read(_hi)
    }
  }
}


const make_fen = (analysis: Analysis, fen: Fen) => {

  let _on_hover_off = createSignal(undefined, { equals: false })
  let _moves = createSignal([])

  let m_moves = createMemo(() => { return read(_moves) })

  return {
    fen,
    hover_fen() {
      owrite(_on_hover_off)
    },
    get on_hover_off() {
      return _on_hover_off[0]
    },
    get moves() {
      return m_moves()
    }
  }
}

const make_fens = (analysis: Analysis) => {

  let _fens = createSignal([1,2,3])

  let m_fens = createMemo(mapArray(_fens[0], _ => make_fen(analysis, _)))

  return {
    get fens() {
      return m_fens()
    }
  }
}

const make_piece = (analysis: Analysis, piece: string) => {
  let ref = make_ref()
  analysis.refs.push(ref)

  let _mouse_down = false

  let [color, role] = piece.split('')

  let _klass = piece_klass(piece)

  return {
    set mouse_down(v: boolean) {
      _mouse_down = v
    },
    get mouse_down() {
      return _mouse_down
    },
    set $ref($ref: HTMLElement) {
      ref.$ref = $ref
    },
    piece,
    get klass() {
      return _klass
    }
  }
}

const make_drag_piece = (analysis: Analysis) => {

  let _dragging = createSignal(false)
  let _piece = createSignal('')
  let pos = make_position(0, 0)

  let m_style = createMemo(() => ({
    transform: `translate(calc(${pos.x}px - 50%), calc(${pos.y}px - 50%))`
  }))

  let m_klass = createMemo(() => piece_klass(read(_piece)))

  return {
    get cur() {
      if (read(_dragging)) {
        return this
      }
    },
    drop() {
      owrite(_dragging, false)
    },
    get vs() {
      return pos.vs
    },
    lerp_vs(vec: Vec2) {
      pos.lerp_vs(vec)
    },
    get piece() {
      return read(_piece)
    },
    begin(piece: string, vs: Vec2) {
      owrite(_dragging, true)
      pos.vs = vs
      owrite(_piece, piece)
    },
    get klass() {
      return m_klass()
    },
    get style() {
      return m_style()
    }
  }
}

const make_drops = (analysis: Analysis) => {
  
  const _mode = createSignal('fen')

  const m_is_open = createMemo(() => {
    return read(_mode) === 'fen'
  })
  
  const m_head_klass = createMemo(() => [
    m_is_open() ? 'open': ''
  ].join(' '))

  const m_mode = createMemo(() => {
    return read(_mode)
  })

  const _pieces = pieces

  const m_pieces = _pieces.map(_ => make_piece(analysis, _))


  return {
    set orientation(orientation: Color) {
      analysis.hooks.on_orientation(orientation[0])
    },
    set preset(preset: Preset) {
      analysis.hooks.on_preset(preset)
    },
    find_on_drag_start(vs: Vec2) {
      return m_pieces.find(_ => _.mouse_down)?.piece
    },
    set mode(mode: Mode) {
      owrite(_mode, mode)
    },
    get mode() {
      return m_mode()
    },
    toggle_head() {
      analysis.hooks.on_mode(read(_mode) === 'fen' ? 'move': 'fen')
    },
    get klass() {
      return m_head_klass()
    },
    get pieces() {
      return m_pieces
    }
  }
}
