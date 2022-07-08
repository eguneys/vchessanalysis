import { untrack, on, createEffect, createSignal, createMemo, mapArray } from 'solid-js'
import { read, write, owrite } from './play'
import { make_drag, make_ref } from './make_sticky'
import { make_position } from './make_util'
import { Vec2 } from 'soli2d'


const colors = ['white', 'black']
const roles = ['pawn', 'rook', 'queen', 'bishop', 'knight', 'king']
const pieces = colors.flatMap(color => roles.map(role => [color, role].join(' ')))

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const ranks = ['1', '2', '3', '4', '5', '6', '7', '8']

const vs_chess_pos = (vs: Vec2) => {
  return files[vs.x] + ranks[7-vs.y]
}

const vs_key_piece_data = (vs: Vec2, piece: string) => {
  let at = vs_chess_pos(vs)
  let wr = piece.split(' ').map(_ => _[0]).join('')

  return [wr, at].join('@')
}


function make_hooks(analysis: Analysis) {
  return { 
    on_hover() {
    },
    on_up(decay) {
    },
    on_click() {
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
      return analysis.drops.find_on_drag_start(drag.move)
    }
  }
}

export class Analysis {

  onScroll() {
    this.refs.forEach(_ => _.$clear_bounds())
  }

  get drag_piece() {
    return this.drops.drag_piece.cur
  }

  set pieses(pieses: Pieses) {
    this.board.pieses = pieses
  }

  constructor(hooks: UserHooks, readonly $element: HTMLElement) {
  
    this.refs = []
    this.drag = make_drag(make_hooks(this), $element)
    this.refs.push(this.drag)
    this.fens = make_fens(this)
    this.drops = make_drops(this)
    this.board = make_board(this)

    createEffect(on(() => this.drag.decay, (decay, prev) => {
      if (!decay) {
        if (prev) {
          let key = this.board.get_key_at_abs_pos(prev.target.vs)
          let { piece } = prev.target
          this.board.highlight = undefined
          this.drops.drag_piece.drop()
          hooks.on_user_drop(vs_key_piece_data(key, piece))
        }
        this.drops.pieces.forEach(_ => _.mouse_down = false)
      }
    }))


  }

}



const make_board = (analysis: Analysis) => {

  let ref = make_ref()

  let _hi = createSignal()


  let _pieses = createSignal([])

  analysis.refs.push(ref)
  return {
    get pieses() {
      return read(_pieses)
    },
    set pieses(pieses: Array<Piese>) {
      owrite(_pieses, pieses)
    },
    ref,
    get_key_at_abs_pos(vs: Vec2) {
      let res = ref.get_normal_at_abs_pos(vs)
      if (res.x < 1 && res.x > 0 && res.y < 1 && res.y > 0) {
        return Vec2.make(Math.floor(res.x * 8), Math.floor(res.y * 8))
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
      return piece
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

  let m_klass = createMemo(() => [
    ...read(_piece).split(' ')
  ].join(' '))

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
      pos.vs = Vec2.make(...vs)
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

const modes = ['', 'Move', 'Fen']
const make_drops = (analysis: Analysis) => {
  
  const _mode = createSignal(1)

  const m_is_open = createMemo(() => {
    return read(_mode) === 2
  })
  
  const m_head_klass = createMemo(() => [
    m_is_open() ? 'open': ''
  ].join(' '))

  const m_mode = createMemo(() => {
    return modes[read(_mode)]
  })

  const _pieces = pieces

  const m_pieces = _pieces.map(_ => make_piece(analysis, _))

  const drag_piece = make_drag_piece(analysis)


  return {
    drag_piece,
    find_on_drag_start(vs: Vec2) {
      let piece = m_pieces.find(_ => _.mouse_down)
      if (piece) {
        drag_piece.begin(piece.piece, vs)
        return drag_piece
      }
    },
    get mode() {
      return m_mode()
    },
    toggle_head() {
      owrite(_mode, _ => _ === 1 ? 2 : 1)
    },
    get klass() {
      return m_head_klass()
    },
    get pieces() {
      return m_pieces
    }
  }
}
