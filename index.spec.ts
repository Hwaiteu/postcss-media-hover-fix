import postcss from 'postcss'
import plugin from './index'

type Options = Record<string, unknown>

const run = (input: string, output: string, opts: Options = {}): void => {
  const result = postcss([plugin(opts)]).process(input, {
    from: undefined
  })

  expect(result.css).toEqual(output)
  expect(result.warnings()).toHaveLength(0)
}

describe('basic usage', () => {
  it('works with a single selector', () => {
    run(
      '.this-is-a-class:hover {}',
      '@media (hover: hover) and (pointer: fine) {.this-is-a-class:hover {}\n}'
    )
  })

  it('works when rule contains CSS declarations', () => {
    run(
      '.this-is-a-class:hover { text-decoration: underline; }',
      '@media (hover: hover) and (pointer: fine) {.this-is-a-class:hover { text-decoration: underline; } }'
    )
  })

  it('works with descendant selectors', () => {
    run(
      '.s-some-scope p a:hover p {}',
      '@media (hover: hover) and (pointer: fine) {.s-some-scope p a:hover p {}\n}'
    )

    run(
      '.js .link:hover .thing {}',
      '@media (hover: hover) and (pointer: fine) {.js .link:hover .thing {}\n}'
    )
  })

  it('works with multiple selectors', () => {
    run(
      '.this-is-a-class:hover, .banana {}',
      '.banana {}@media (hover: hover) and (pointer: fine) {.this-is-a-class:hover {}\n}'
    )

    run(
      '.this-is-a-class:hover, .banana:hover {}',
      '@media (hover: hover) and (pointer: fine) {.this-is-a-class:hover, .banana:hover {}\n}'
    )
  })

  it('skips rules contained within `@media (hover: hover) {}`', () => {
    run(
      '@media (hover: hover) {.btn:hover {}}',
      '@media (hover: hover) and (pointer: fine) {.btn:hover {}}'
    )

    run(
      '.p-index { @media (hover: hover) {.btn:hover {}} }',
      '.p-index { @media (hover: hover) and (pointer: fine) {.btn:hover {}} }'
    )
  })

  it('works with pseudo-class functions that accept selector lists as an argument', () => {
    run(
      ':is(button, [role="button"]):hover { background-color: transparent; }',
      '@media (hover: hover) and (pointer: fine) {:is(button,[role="button"]):hover { background-color: transparent; } }'
    )
  })

  it('ignores :hover pseudo-class selectors within :not pseudo-class selector lists', () => {
    run(
      '.list__item:not(:hover, .is-editing) .show-on-hover { visibility: hidden }',
      '.list__item:not(:hover, .is-editing) .show-on-hover { visibility: hidden }'
    )
  })
})
